import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { LogIn, Sparkles, UserPlus } from "lucide-react";
import clsx from "clsx";

const links = [
	{ to: "/dashboard", label: "Workspace", icon: Sparkles },
	{ to: "/login", label: "Login", icon: LogIn },
	{ to: "/signup", label: "Sign up", icon: UserPlus },
];

export function Sidebar({ collapsed, onToggle }) {
	return (
		<motion.aside
			initial={false}
			animate={{ width: collapsed ? 72 : 240 }}
			className="glass flex h-screen flex-col border-r border-slate-200/60 py-6 dark:border-white/10"
		>
			<div className="mb-8 flex items-center justify-between px-3">
				{!collapsed && (
					<span className="font-display text-lg font-bold tracking-tight text-gradient">
						CareerOS
					</span>
				)}
				<button
					type="button"
					onClick={onToggle}
					className="rounded-lg p-2 text-slate-500 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:bg-white/10"
					aria-label="Toggle sidebar"
				>
					<span className="text-lg">{collapsed ? "→" : "←"}</span>
				</button>
			</div>
			<nav className="flex flex-1 flex-col gap-1 px-2">
				{links.map(({ to, label, icon: Icon }) => (
					<NavLink
						key={to}
						to={to}
						className={({ isActive }) =>
							clsx(
								"flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
								isActive
									? "bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-700 dark:text-cyan-300"
									: "text-slate-600 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:bg-white/5",
							)
						}
					>
						<Icon className="h-5 w-5 shrink-0" />
						{!collapsed && <span>{label}</span>}
					</NavLink>
				))}
			</nav>
		</motion.aside>
	);
}
