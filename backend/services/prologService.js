const { exec } = require("child_process");
const path = require("path");

function safeAtom(s) {
	if (!s) return "''";
	let t = String(s)
		.toLowerCase()
		.replace(/[^a-z0-9]/g, "_");
	return `'${t}'`;
}

function runProlog(payload) {
	return new Promise((resolve, reject) => {
		const { skills = [], interest, personality, work } = payload || {};

		const factsArr = [];

		skills.forEach((s) => {
			const nameAtom = safeAtom(s.name);
			const val = Number(s.score) || 0;
			factsArr.push(`assertz(skill(${nameAtom}, ${val}))`);
		});

		if (interest) {
			const a = safeAtom(interest);
			const v = typeof interest === "number" ? interest : 0.5; // if string, default boost 0.5
			factsArr.push(
				`assertz(interest(${a}, ${typeof interest === "number" ? interest : 0.5}))`,
			);
		}

		if (personality) {
			const a = safeAtom(personality);
			factsArr.push(`assertz(personality(${a}, 0.7))`);
		}

		if (work) {
			const a = safeAtom(work);
			factsArr.push(`assertz(work(${a}, 0.8))`);
		}

		const facts = factsArr.join(",");

		const prologFile = path.join(__dirname, "../../prolog/career.pl");

		const cmdGoal = facts
			? `${facts}, recommend_top3, halt.`
			: `recommend_top3, halt.`;

		const swipl =
			process.env.SWIPL_PATH || `C:\\Program Files\\swipl\\bin\\swipl.exe`;
		const command = `"${swipl}" -s "${prologFile}" -g "${cmdGoal}"`;

		exec(command, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
			if (error) {
				console.error("Prolog error:", error, stderr);
				return reject(error);
			}

			const lines = stdout
				.trim()
				.split(/\r?\n/)
				.filter((l) => l.trim().length > 0);
			const results = lines.map((line) => {
				const parts = line.split("::");
				const name = parts[0] || "";
				const score = parseFloat(parts[1]) || 0;
				const explain = parts[2] || "";
				const explItems = explain
					.split(",")
					.map((p) => {
						const kv = p.split(":");
						if (kv.length === 2)
							return { key: kv[0].trim(), value: parseFloat(kv[1]) };
						return null;
					})
					.filter(Boolean);
				return { name, score, explain: explItems };
			});

			resolve(results);
		});
	});
}

module.exports = { runProlog };
