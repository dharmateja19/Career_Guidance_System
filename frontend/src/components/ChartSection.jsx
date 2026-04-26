import {
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	CartesianGrid,
	LineChart,
	Line,
} from "recharts";
import { GlassCard } from "./GlassCard.jsx";

const COLORS = ["#22d3ee", "#a78bfa", "#f472b6", "#34d399", "#fbbf24"];

function prettyCareer(n) {
	return String(n)
		.replace(/_/g, " ")
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ChartSection({ skills, careers, roadmap }) {
	const pieData = (skills || []).map((s, i) => ({
		name: s.name.replace(/_/g, " "),
		value: Math.round(Number(s.score) * 100),
	}));

	const barData = (careers || []).map((c) => ({
		name: prettyCareer(c.name).slice(0, 18),
		score: Math.round(Number(c.score) * 100),
	}));

	const lineData = (roadmap || []).slice(0, 8).map((step, i) => ({
		step: i + 1,
		progress: Math.min(100, 20 + i * 12),
	}));

	return (
		<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
			<GlassCard
				title="Skill distribution"
				subtitle="Your input proficiency (normalized %)"
			>
				<div className="h-[280px] w-full min-w-0">
					{pieData.length > 0 ? (
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={pieData}
									dataKey="value"
									nameKey="name"
									cx="50%"
									cy="50%"
									outerRadius={90}
									label={({ name, percent }) =>
										`${name} ${(percent * 100).toFixed(0)}%`
									}
								>
									{pieData.map((_, i) => (
										<Cell key={i} fill={COLORS[i % COLORS.length]} />
									))}
								</Pie>
								<Tooltip />
							</PieChart>
						</ResponsiveContainer>
					) : (
						<p className="py-16 text-center text-sm text-slate-500">
							Add skills to see the chart.
						</p>
					)}
				</div>
			</GlassCard>

			<GlassCard title="Career match scores" subtitle="Top recommendations (%)">
				<div className="h-[280px] w-full min-w-0">
					{barData.length > 0 ? (
						<ResponsiveContainer width="100%" height="100%">
							<BarChart
								data={barData}
								margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
							>
								<defs>
									<linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
										<stop offset="0%" stopColor="#22d3ee" />
										<stop offset="100%" stopColor="#a78bfa" />
									</linearGradient>
								</defs>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke="#334155"
									opacity={0.3}
								/>
								<XAxis
									dataKey="name"
									tick={{ fontSize: 11 }}
									interval={0}
									angle={-12}
									textAnchor="end"
									height={60}
								/>
								<YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
								<Tooltip />
								<Bar
									dataKey="score"
									fill="url(#barGrad)"
									radius={[6, 6, 0, 0]}
								/>
							</BarChart>
						</ResponsiveContainer>
					) : (
						<p className="py-16 text-center text-sm text-slate-500">
							Run analysis to see scores.
						</p>
					)}
				</div>
			</GlassCard>

			<GlassCard
				title="Growth path"
				subtitle="Optional roadmap progression (Gemini)"
				className="lg:col-span-2"
			>
				<div className="h-[260px] w-full min-w-0">
					{lineData.length > 0 ? (
						<ResponsiveContainer width="100%" height="100%">
							<LineChart
								data={lineData}
								margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
							>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke="#334155"
									opacity={0.3}
								/>
								<XAxis
									dataKey="step"
									tick={{ fontSize: 11 }}
									label={{
										value: "Step",
										position: "insideBottom",
										offset: -4,
									}}
								/>
								<YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
								<Tooltip />
								<Line
									type="monotone"
									dataKey="progress"
									stroke="#f472b6"
									strokeWidth={2}
									dot={{ r: 4 }}
								/>
							</LineChart>
						</ResponsiveContainer>
					) : (
						<p className="py-12 text-center text-sm text-slate-500">
							Gemini roadmap appears here when the AI fallback runs.
						</p>
					)}
				</div>
			</GlassCard>
		</div>
	);
}
