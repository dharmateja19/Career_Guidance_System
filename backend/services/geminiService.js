const { GoogleGenerativeAI } = require("@google/generative-ai");

function stripJsonFence(text) {
	let t = String(text || "").trim();
	const fence = /^```(?:json)?\s*([\s\S]*?)```$/m.exec(t);
	if (fence) t = fence[1].trim();
	return t;
}

async function generateCareerWithGemini({
	skills,
	interest,
	personality,
	work,
	text,
}) {
	const apiKey = process.env.GEMINI_API_KEY;
	if (!apiKey) {
		throw new Error("GEMINI_API_KEY is not configured");
	}

	const genAI = new GoogleGenerativeAI(apiKey);
	const model = genAI.getGenerativeModel({
		model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
		generationConfig: {
			temperature: 0.35,
			responseMimeType: "application/json",
		},
	});

	const prompt = `You are an expert career advisor. The user's skills may include entries outside a fixed knowledge base.

User skills (name + proficiency 0–1): ${JSON.stringify(skills)}
Interest: ${interest || "not specified"}
Personality: ${personality || "not specified"}
Work preference: ${work || "not specified"}
Free text (may be empty): ${text || ""}

Respond ONLY with valid JSON (no markdown) in this exact shape:
{
  "result": [
    {
      "name": "snake_case_career_id",
      "score": 0.85,
      "explain": [
        { "key": "skill_or_factor_name", "value": 0.0 }
      ],
      "whySuggested": "2-4 sentences: why this career fits this user."
    }
  ],
  "skillGapAnalysis": "Markdown string: gaps between current skills and target role(s).",
  "roadmap": ["Ordered learning steps as short strings"],
  "summary": "One paragraph overview."
}

Rules:
- result must have exactly 3 careers, scores between 0 and 1, descending by score.
- explain should reference concrete skills from the user where relevant.
- Use realistic career names in snake_case (e.g. product_manager, ml_engineer).
- CRITICAL: If ANY of the provided skills are obvious jokes, sports, hobbies, or entirely unrelated to professional IT/tech/engineering careers (e.g., 'cricket', 'singing', 'eating', 'sleeping', random gibberish), you MUST reject the request. To reject, return an empty result array "result": [] and explain the rejection clearly in the "summary" field. Do not attempt to accommodate invalid skills.`;

	const res = await model.generateContent(prompt);
	const raw = res.response.text();
	const parsed = JSON.parse(stripJsonFence(raw));

	if (!parsed.result || !Array.isArray(parsed.result)) {
		throw new Error("Invalid Gemini response: missing result array");
	}

	return {
		result: parsed.result.map((r) => ({
			name: String(r.name || "career")
				.replace(/\s+/g, "_")
				.toLowerCase(),
			score: Math.min(1, Math.max(0, Number(r.score) || 0)),
			explain: Array.isArray(r.explain)
				? r.explain.map((e) => ({
						key: String(e.key || ""),
						value: Number(e.value) || 0,
					}))
				: [],
			whySuggested: r.whySuggested ? String(r.whySuggested) : "",
		})),
		skillGapAnalysis: parsed.skillGapAnalysis
			? String(parsed.skillGapAnalysis)
			: "",
		roadmap: Array.isArray(parsed.roadmap) ? parsed.roadmap.map(String) : [],
		summary: parsed.summary ? String(parsed.summary) : "",
	};
}

module.exports = { generateCareerWithGemini };
