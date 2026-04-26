import {
	useEffect,
	useRef,
	useState,
	useCallback,
	lazy,
	Suspense,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { analyzeCareer, fetchHistory } from "../api/client.js";
import { useDebouncedValue } from "../hooks/useDebouncedValue.js";
import { GlassCard } from "../components/GlassCard.jsx";
import { Button } from "../components/Button.jsx";
import { Plus, Trash2, FileDown, Loader2 } from "lucide-react";

const ChartSection = lazy(() =>
	import("../components/ChartSection.jsx").then((m) => ({
		default: m.ChartSection,
	})),
);

const SKILL_OPTIONS = [
	{ label: "DSA", value: "dsa" },
	{ label: "DBMS", value: "dbms" },
	{ label: "Python", value: "python" },
	{ label: "Java", value: "java" },
	{ label: "ML", value: "ml" },
	{ label: "Web", value: "web" },
	{ label: "Docker", value: "docker" },
	{ label: "Kubernetes", value: "kubernetes" },
	{ label: "Security", value: "security" },
	{ label: "Other", value: "other" },
];

const SCORES = [
	{ label: "Very good", value: 0.85 },
	{ label: "Good", value: 0.6 },
	{ label: "Average", value: 0.4 },
	{ label: "Learning", value: 0.2 },
];

function prettyCareer(n) {
	return String(n)
		.replace(/_/g, " ")
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function Dashboard() {
	const [rows, setRows] = useState([
		{ key: 1, skill: "python", score: 0.6, other: "" },
	]);
	const [nextKey, setNextKey] = useState(2);
	const [text, setText] = useState("");
	const debouncedText = useDebouncedValue(text, 400);
	const [interest, setInterest] = useState("");
	const [personality, setPersonality] = useState("");
	const [work, setWork] = useState("");

	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState(null);
	const [source, setSource] = useState(null);
	const [gap, setGap] = useState(null);
	const [roadmap, setRoadmap] = useState(null);
	const [summary, setSummary] = useState(null);
	const [analyzedSkills, setAnalyzedSkills] = useState(null);

	const [history, setHistory] = useState([]);
	const reportRef = useRef(null);

	useEffect(() => {
		fetchHistory()
			.then((d) => setHistory(d.history || []))
			.catch(() => {});
	}, []);

	const addRow = useCallback(() => {
		if (rows.length >= 5) {
			toast.error("Maximum 5 skills.");
			return;
		}
		setRows((r) => [
			...r,
			{ key: nextKey, skill: "dsa", score: 0.6, other: "" },
		]);
		setNextKey((k) => k + 1);
	}, [rows.length, nextKey]);

	const removeRow = useCallback((key) => {
		setRows((r) => (r.length <= 1 ? r : r.filter((x) => x.key !== key)));
	}, []);

	const updateRow = useCallback((key, patch) => {
		setRows((r) =>
			r.map((row) => (row.key === key ? { ...row, ...patch } : row)),
		);
	}, []);

	async function runAnalyze() {
		const skills = [];
		for (const row of rows) {
			let name = row.skill === "other" ? row.other.trim() : row.skill;
			if (!name) continue;
			skills.push({ name: name.toLowerCase(), score: row.score });
		}

		if (skills.length === 0 && !text.trim()) {
			toast.error("Add skills or describe your background in the text area.");
			return;
		}

		setLoading(true);
		setResult(null);
		setSource(null);
		setGap(null);
		setRoadmap(null);
		setSummary(null);
		setAnalyzedSkills(null);

		try {
			const data = await analyzeCareer({
				skills,
				interest: interest || null,
				personality: personality || null,
				work: work || null,
				text: text.trim() || undefined,
			});
			setResult(data.result);
			setSource(data.source);
			setGap(data.skillGapAnalysis || null);
			setRoadmap(data.roadmap || null);
			setSummary(data.summary || null);
			setAnalyzedSkills(data.skills || null);
			toast.success(
				data.source === "prolog"
					? "Prolog engine matched your profile"
					: "AI advisor generated insights",
			);
			const h = await fetchHistory();
			setHistory(h.history || []);
		} catch (e) {
			toast.error(e.message || "Analysis failed");
		} finally {
			setLoading(false);
		}
	}

	async function exportPdf() {
		if (!reportRef.current) return;
		try {
			toast.loading("Building PDF…");
			const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
				import("jspdf"),
				import("html2canvas"),
			]);
			const canvas = await html2canvas(reportRef.current, {
				scale: 2,
				useCORS: true,
			});
			const img = canvas.toDataURL("image/png");
			const pdf = new jsPDF({ unit: "pt", format: "a4" });
			const w = pdf.internal.pageSize.getWidth();
			const h = (canvas.height * w) / canvas.width;
			pdf.addImage(img, "PNG", 0, 0, w, h);
			pdf.save("career-report.pdf");
			toast.dismiss();
			toast.success("PDF downloaded");
		} catch {
			toast.dismiss();
			toast.error("PDF export failed");
		}
	}

	const skillsForCharts = analyzedSkills
		? analyzedSkills
		: rows
				.map((row) => {
					const name = row.skill === "other" ? row.other : row.skill;
					if (!name?.trim()) return null;
					return { name: name.toLowerCase(), score: row.score };
				})
				.filter(Boolean);

	return (
		<div className="mx-auto max-w-5xl space-y-6 pb-32">
			<div>
				<h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
					Career workspace
				</h1>
				<p className="mt-1 text-slate-600 dark:text-slate-400">
					Known skills use the Prolog engine and AI fallback to Gemini.
				</p>
			</div>

			<GlassCard
				title="Your profile"
				subtitle="Skills (max 5), interests, and free text"
			>
				<div className="space-y-4">
					{rows.map((row) => (
						<motion.div
							layout
							key={row.key}
							className="flex flex-col gap-3 rounded-xl border border-slate-200/80 p-4 dark:border-white/10 sm:flex-row sm:items-end"
						>
							<div className="grid flex-1 gap-3 sm:grid-cols-2">
								<div>
									<label className="mb-1 block text-xs font-medium text-slate-500">
										Skill
									</label>
									<select
										value={row.skill}
										onChange={(e) =>
											updateRow(row.key, { skill: e.target.value })
										}
										className="w-full rounded-lg border border-slate-300 bg-white/80 px-3 py-2.5 text-slate-900 dark:border-white/15 dark:bg-slate-900/50 dark:text-white"
									>
										{SKILL_OPTIONS.map((o) => (
											<option key={o.value} value={o.value}>
												{o.label}
											</option>
										))}
									</select>
								</div>
								<div>
									<label className="mb-1 block text-xs font-medium text-slate-500">
										Proficiency
									</label>
									<select
										value={row.score}
										onChange={(e) =>
											updateRow(row.key, { score: Number(e.target.value) })
										}
										className="w-full rounded-lg border border-slate-300 bg-white/80 px-3 py-2.5 dark:border-white/15 dark:bg-slate-900/50 dark:text-white"
									>
										{SCORES.map((s) => (
											<option key={s.value} value={s.value}>
												{s.label}
											</option>
										))}
									</select>
								</div>
							</div>
							{row.skill === "other" && (
								<input
									value={row.other}
									onChange={(e) =>
										updateRow(row.key, { other: e.target.value })
									}
									placeholder="Custom skill"
									className="w-full rounded-lg border border-slate-300 bg-white/80 px-3 py-2.5 sm:max-w-xs dark:border-white/15 dark:bg-slate-900/50 dark:text-white"
								/>
							)}
							<button
								type="button"
								onClick={() => removeRow(row.key)}
								className="rounded-lg p-2 text-red-500 hover:bg-red-500/10"
								aria-label="Remove"
							>
								<Trash2 className="h-5 w-5" />
							</button>
						</motion.div>
					))}

					<Button variant="secondary" onClick={addRow} className="!mt-2">
						<Plus className="h-4 w-4" />
						Add skill
					</Button>

					<div>
						<label className="mb-1 block text-xs font-medium text-slate-500">
							Free text (optional, NLP extraction)
						</label>
						<textarea
							value={text}
							onChange={(e) => setText(e.target.value)}
							rows={4}
							placeholder="e.g. Strong in DBMS and Python; building ML side projects…"
							className="w-full rounded-xl border border-slate-300 bg-white/80 px-4 py-3 text-slate-900 dark:border-white/15 dark:bg-slate-900/50 dark:text-white"
						/>
					</div>

					<div className="grid gap-4 sm:grid-cols-3">
						<div>
							<label className="mb-1 block text-xs font-medium text-slate-500">
								Interest
							</label>
							<select
								value={interest}
								onChange={(e) => setInterest(e.target.value)}
								className="w-full rounded-lg border border-slate-300 bg-white/80 px-3 py-2.5 dark:border-white/15 dark:bg-slate-900/50 dark:text-white"
							>
								<option value="">—</option>
								<option value="data">Data</option>
								<option value="web">Web</option>
								<option value="ai">AI</option>
								<option value="security">Security</option>
								<option value="design">Design</option>
							</select>
						</div>
						<div>
							<label className="mb-1 block text-xs font-medium text-slate-500">
								Personality
							</label>
							<select
								value={personality}
								onChange={(e) => setPersonality(e.target.value)}
								className="w-full rounded-lg border border-slate-300 bg-white/80 px-3 py-2.5 dark:border-white/15 dark:bg-slate-900/50 dark:text-white"
							>
								<option value="">—</option>
								<option value="analytical">Analytical</option>
								<option value="creative">Creative</option>
								<option value="logical">Logical</option>
								<option value="leadership">Leadership</option>
							</select>
						</div>
						<div>
							<label className="mb-1 block text-xs font-medium text-slate-500">
								Work style
							</label>
							<select
								value={work}
								onChange={(e) => setWork(e.target.value)}
								className="w-full rounded-lg border border-slate-300 bg-white/80 px-3 py-2.5 dark:border-white/15 dark:bg-slate-900/50 dark:text-white"
							>
								<option value="">—</option>
								<option value="coding">Coding</option>
								<option value="research">Research</option>
								<option value="management">Management</option>
							</select>
						</div>
					</div>
				</div>
			</GlassCard>

			<AnimatePresence>
				{loading && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="glass rounded-2xl p-8"
					>
						<div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
							<Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
							Running hybrid analysis…
						</div>
						<div className="mt-4 space-y-2">
							{[1, 2, 3].map((i) => (
								<div
									key={i}
									className="h-3 animate-pulse rounded bg-slate-300/50 dark:bg-white/10"
									style={{ width: `${100 - i * 15}%` }}
								/>
							))}
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{result && (
				<div ref={reportRef} className="space-y-6">
					<GlassCard
						title="Recommendations"
						subtitle={
							source === "prolog"
								? "Powered by Prolog rules"
								: "Powered by Gemini (fallback)"
						}
					>
						<div className="mb-4 flex flex-wrap items-center gap-2">
							<span
								className={`rounded-full px-3 py-1 text-xs font-semibold ${
									source === "prolog"
										? "bg-cyan-500/20 text-cyan-800 dark:text-cyan-300"
										: "bg-violet-500/20 text-violet-800 dark:text-violet-300"
								}`}
							>
								{source === "prolog" ? "Prolog KB" : "Gemini AI"}
							</span>
							{summary && (
								<p className="text-sm text-slate-600 dark:text-slate-400">
									{summary}
								</p>
							)}
						</div>
						<ul className="space-y-4">
							{result.map((r, i) => (
								<li
									key={i}
									className="rounded-xl border border-slate-200/80 p-4 dark:border-white/10"
								>
									<div className="flex flex-wrap items-baseline justify-between gap-2">
										<span className="font-display text-lg font-semibold text-slate-900 dark:text-white">
											{i + 1}. {prettyCareer(r.name)}
										</span>
										<span className="text-sm font-medium text-cyan-600 dark:text-cyan-400">
											{(Number(r.score) * 100).toFixed(1)}% match
										</span>
									</div>
									{r.whySuggested && (
										<p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
											<span className="font-medium text-slate-900 dark:text-white">
												Why?{" "}
											</span>
											{r.whySuggested}
										</p>
									)}
									<p className="mt-2 text-xs text-slate-500">
										{(r.explain || [])
											.map((e) => `${e.key}: ${Number(e.value).toFixed(2)}`)
											.join(" · ")}
									</p>
								</li>
							))}
						</ul>
					</GlassCard>

					{gap && (
						<GlassCard title="Skill gap analysis" subtitle="From Gemini">
							<div className="prose prose-sm max-w-none text-slate-700 dark:prose-invert dark:text-slate-300">
								{gap.split("\n").map((line, i) => (
									<p key={i}>{line}</p>
								))}
							</div>
						</GlassCard>
					)}

					{roadmap && roadmap.length > 0 && (
						<GlassCard title="Learning roadmap" subtitle="Suggested steps">
							<ol className="list-decimal space-y-2 pl-5 text-slate-700 dark:text-slate-300">
								{roadmap.map((step, i) => (
									<li key={i}>{step}</li>
								))}
							</ol>
						</GlassCard>
					)}

					<Suspense
						fallback={<div className="glass h-64 animate-pulse rounded-2xl" />}
					>
						<ChartSection
							skills={skillsForCharts}
							careers={result}
							roadmap={roadmap}
						/>
					</Suspense>

					<div className="flex justify-end">
						<Button variant="secondary" onClick={exportPdf}>
							<FileDown className="h-4 w-4" />
							Export PDF
						</Button>
					</div>
				</div>
			)}

			<GlassCard title="Recent analyses" subtitle="Requires login">
				{history.length === 0 ? (
					<p className="text-sm text-slate-500">
						No saved history yet — sign in and run an analysis.
					</p>
				) : (
					<ul className="space-y-3">
						{history.slice(0, 8).map((h) => (
							<li
								key={h.id}
								className="rounded-lg border border-slate-200/60 px-3 py-2 text-sm dark:border-white/10"
							>
								<span className="text-slate-500">
									{new Date(h.createdAt).toLocaleString()}
								</span>
								<span className="ml-2 font-medium text-slate-800 dark:text-slate-200">
									{(h.result || []).map((x) => prettyCareer(x.name)).join(", ")}
								</span>
							</li>
						))}
					</ul>
				)}
			</GlassCard>

			<div className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 px-2">
				<div className="flex justify-center">
					<Button
						onClick={runAnalyze}
						disabled={loading}
						className="w-full !py-4 text-base shadow-2xl shadow-cyan-500/20"
					>
						{loading ? (
							<>
								<Loader2 className="h-5 w-5 animate-spin" />
								Analyzing…
							</>
						) : (
							"Analyze career"
						)}
					</Button>
				</div>
			</div>
		</div>
	);
}
