const { runProlog } = require("../services/prologService");
const { extractSkills } = require("../services/nlpService");
const { generateCareerWithGemini } = require("../services/geminiService");
const Skill = require("../models/Skill");
const History = require("../models/History");

const KNOWN_SKILLS = [
	"dsa",
	"dbms",
	"os",
	"cn",
	"java",
	"python",
	"ai",
	"ml",
	"data_science",
	"cyber_security",
	"cloud",
	"devops",
	"web",
	"mobile",
	"blockchain",
	"ui_ux",
	"docker",
	"kubernetes",
	"react",
	"node",
	"express",
	"sql",
	"nosql",
	"etl",
	"statistics",
	"deep_learning",
	"android",
	"ios",
	"security",
	"networks",
	"crypto",
	"js",
	"css",
	"scripting",
];

const SKILL_ALIASES = {
	web_development: "web",
	mobile_development: "android",
	data_science: "data_science",
	cyber_security: "cyber_security",
	machine_learning: "ml",
	javascript: "js",
	js: "js",
	html: "web",
	css: "css",
	kubernetes: "kubernetes",
	k8s: "kubernetes",
};

const MAX_TEXT = 8000;
const MAX_LABEL = 80;

function sanitizeName(name) {
	return String(name || "")
		.toLowerCase()
		.replace(/[^a-z0-9]/g, "_");
}

function canonicalSkillName(name) {
	const s = sanitizeName(name);
	return SKILL_ALIASES[s] || s;
}

function splitKnownAndUnknownSkills(processed) {
	const known = [];
	const unknown = [];
	for (const p of processed) {
		if (KNOWN_SKILLS.includes(p.name)) known.push(p);
		else unknown.push(p);
	}
	return { known, unknown };
}

function enrichPrologWhy(result) {
	return (result || []).map((item) => {
		const parts = (item.explain || [])
			.slice(0, 5)
			.map((e) => `${e.key} (${Number(e.value).toFixed(2)})`)
			.join(", ");
		const whySuggested = parts
			? `Score blends your stated skills and preferences: ${parts}.`
			: "Matched using the weighted Prolog knowledge base.";
		return { ...item, whySuggested };
	});
}

function validateAnalyzeBody(body) {
	const errors = [];
	const { skills = [], text } = body;

	if (skills.length > 5) errors.push("At most 5 skills allowed.");

	for (const s of skills) {
		if (!s || typeof s.name !== "string" || !s.name.trim()) {
			errors.push("Each skill must have a non-empty name.");
			break;
		}
		const sc = Number(s.score);
		if (Number.isNaN(sc) || sc < 0 || sc > 1) {
			errors.push("Each skill score must be a number between 0 and 1.");
			break;
		}
	}

	if (text != null && String(text).length > MAX_TEXT) {
		errors.push(`Description must be at most ${MAX_TEXT} characters.`);
	}

	for (const key of ["interest", "personality", "work"]) {
		const v = body[key];
		if (v != null && String(v).length > MAX_LABEL) {
			errors.push(`${key} is too long.`);
			break;
		}
	}

	return errors;
}

exports.analyzeCareer = async (req, res) => {
	try {
		const errors = validateAnalyzeBody(req.body);
		if (errors.length) {
			return res.status(400).json({ msg: errors[0] });
		}

		const { skills = [], interest, personality, work, userId, text } = req.body;

		let taken = skills.slice(0, 5);
		if (text && String(text).trim().length > 0) {
			const extracted = await extractSkills(text);
			for (const ex of extracted) {
				if (
					!taken.some((s) => s.name.toLowerCase() === ex.name.toLowerCase())
				) {
					taken.push(ex);
				}
			}
			taken = taken.slice(0, 10);
		}

		let effPersonality = personality || null;
		if (interest === "design" && !effPersonality) {
			effPersonality = "creative";
		}

		const processed = [];

		for (const s of taken) {
			const name = canonicalSkillName(s.name);
			const score = Number(s.score) || 0.4;

			if (!KNOWN_SKILLS.includes(name)) {
				return res
					.status(400)
					.json({
						msg: `Invalid skill: '${s.name}'. Please choose a valid technical or professional skill.`,
					});
			}

			processed.push({ name, score });
		}

		if (processed.length === 0) {
			return res.status(400).json({
				msg: "Add at least one skill or enter a description that mentions your skills (e.g. DBMS, Python, web).",
			});
		}

		const payload = {
			skills: processed,
			interest: interest || null,
			personality: effPersonality,
			work: work || null,
		};

		const uid = req.user && req.user.id ? req.user.id : userId || null;
		const { known: knownSkills, unknown: unknownSkills } =
			splitKnownAndUnknownSkills(processed);
		const hasKnown = knownSkills.length > 0;

		let source = "prolog";
		let result = [];
		let skillGapAnalysis = null;
		let roadmap = null;
		let summary = null;

		if (hasKnown) {
			try {
				const raw = await runProlog({
					...payload,
					skills: knownSkills,
				});
				result = enrichPrologWhy(raw);
			} catch (prologErr) {
				console.warn(
					"Prolog failed, falling back to Gemini:",
					prologErr.message,
				);
				result = [];
			}
		}

		const needGemini =
			!hasKnown || result.length === 0 || unknownSkills.length > 0;
		if (needGemini) {
			source = "gemini";
			try {
				const g = await generateCareerWithGemini({
					skills: processed,
					interest: interest || "",
					personality: effPersonality || "",
					work: work || "",
					text: text || "",
				});
				result = g.result;
				skillGapAnalysis = g.skillGapAnalysis;
				roadmap = g.roadmap;
				summary = g.summary;

				if (!result || result.length === 0) {
					return res
						.status(400)
						.json({
							msg:
								summary ||
								"Please provide valid IT, tech, engineering, or professional skills.",
						});
				}
			} catch (gemErr) {
				console.error("Gemini Error:", gemErr);
				let errorMsg = "Career analysis service unavailable. Try again later.";
				const rawMsg = gemErr.message || "";
				if (
					rawMsg.includes("API_KEY_INVALID") ||
					rawMsg.includes("API key not valid")
				) {
					errorMsg = "Invalid Gemini API Key.";
				} else if (rawMsg.includes("API Key not found")) {
					errorMsg = "Gemini API Key is missing. Please configure it.";
				} else if (
					rawMsg.includes("Quota") ||
					rawMsg.includes("rate limit") ||
					rawMsg.includes("429")
				) {
					errorMsg = "Gemini API rate limit exceeded or quota exhausted.";
				} else {
					errorMsg = `AI Fallback failed: ${rawMsg.split("\n")[0].substring(0, 80)}`;
				}
				return res.status(503).json({
					msg: errorMsg,
				});
			}
		}

		if (source === "prolog" && unknownSkills.length > 0) {
			const note = `Some skills are not in the Prolog knowledge base and were skipped: ${unknownSkills
				.map((s) => s.name)
				.join(", ")}.`;
			summary = summary ? `${summary}\n${note}` : note;
		}

		await new History({
			userId: uid,
			skills: processed,
			result,
			source,
			skillGapAnalysis: skillGapAnalysis || undefined,
			roadmap: roadmap || undefined,
			summary: summary || undefined,
		}).save();

		res.json({
			source,
			result,
			skillGapAnalysis,
			roadmap,
			summary,
			skills: processed,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ msg: "Server error" });
	}
};

exports.getHistory = async (req, res) => {
	try {
		const uid = req.user && req.user.id ? req.user.id : null;
		if (!uid) {
			return res.json({ history: [] });
		}
		const items = await History.find({ userId: uid })
			.sort({ createdAt: -1 })
			.limit(50);
		const out = items.map((it) => ({
			id: it._id,
			userId: it.userId,
			skills: it.skills,
			result: it.result,
			source: it.source,
			skillGapAnalysis: it.skillGapAnalysis,
			roadmap: it.roadmap,
			summary: it.summary,
			createdAt: it.createdAt,
		}));
		res.json({ history: out });
	} catch (err) {
		console.error(err);
		res.status(500).json({ msg: "Server error" });
	}
};
