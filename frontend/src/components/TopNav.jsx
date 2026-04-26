import { Moon, Sun, LogOut, User } from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";
import { Button } from "./Button.jsx";

export function TopNav({ token, onLogout }) {
	const { dark, toggle } = useTheme();

	return (
		<header className="glass flex items-center justify-between gap-4 rounded-2xl border border-slate-200/60 px-4 py-3 dark:border-white/10">
			<p className="text-sm text-slate-600 dark:text-slate-400">
				<span className="font-medium text-slate-900 dark:text-white">
					Hybrid engine
				</span>
				· Prolog + Gemini
			</p>
			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={toggle}
					className="rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-200/50 dark:text-slate-300 dark:hover:bg-white/10"
					aria-label="Toggle theme"
				>
					{dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
				</button>
				<div className="hidden items-center gap-2 rounded-xl bg-slate-200/40 px-3 py-2 dark:bg-white/5 sm:flex">
					<User className="h-4 w-4 text-slate-500" />
					<span className="max-w-[140px] truncate text-xs text-slate-600 dark:text-slate-400">
						{token ? "Signed in" : "Guest"}
					</span>
				</div>
				{token && (
					<Button variant="ghost" className="!py-2 !px-3" onClick={onLogout}>
						<LogOut className="h-4 w-4" />
						<span className="hidden sm:inline">Logout</span>
					</Button>
				)}
			</div>
		</header>
	);
}
