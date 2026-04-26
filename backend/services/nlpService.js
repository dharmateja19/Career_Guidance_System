const skillList = [
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
	"javascript",
];

async function extractSkills(text) {
	text = String(text || "").toLowerCase();

	if (process.env.USE_GOOGLE_NLP === "1") {
		try {
			const language = require("@google-cloud/language");
			const client = new language.LanguageServiceClient();
			const document = { content: text, type: "PLAIN_TEXT" };
			const [result] = await client.analyzeEntities({ document });
			const entities = result.entities || [];
			const skills = entities
				.map((e) => ({ name: String(e.name).toLowerCase(), score: 0.6 }))
				.filter(
					(s) =>
						skillList.includes(s.name) ||
						skillList.includes(s.name.replace(/\s+/g, "_")),
				);
			return skills;
		} catch (err) {
			console.warn(
				"Google NLP not available, falling back to keyword extractor",
			);
		}
	}

	const skills = [];
	const seen = new Set();

	skillList.forEach((skill) => {
		const phrase = skill.replace(/_/g, " ");
		const mentioned =
			text.includes(phrase) ||
			text.includes(skill) ||
			(skill === "js" && /\bjs\b/.test(text));

		if (!mentioned) return;

		let score = 0.5;

		if (
			text.includes(`very good in ${phrase}`) ||
			text.includes(`${phrase} is very good`)
		) {
			score = 0.85;
		} else if (
			text.includes(`good in ${phrase}`) ||
			text.includes(`${phrase} is good`)
		) {
			score = 0.6;
		} else if (
			text.includes(`average in ${phrase}`) ||
			text.includes(`i know ${phrase}`)
		) {
			score = 0.4;
		} else if (text.includes(`bad in ${phrase}`)) {
			score = 0.2;
		}

		if (!seen.has(skill)) {
			seen.add(skill);
			skills.push({ name: skill, score });
		}
	});

	return skills;
}

module.exports = { extractSkills };
