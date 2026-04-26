import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { loginRequest } from "../api/client.js";
import { Button } from "../components/Button.jsx";

export default function Login() {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [show, setShow] = useState(false);
	const [loading, setLoading] = useState(false);

	async function onSubmit(e) {
		e.preventDefault();
		if (!email.trim() || !password) {
			toast.error("Enter email and password.");
			return;
		}
		setLoading(true);
		try {
			const data = await loginRequest(email.trim(), password);
			localStorage.setItem("token", data.token);
			localStorage.setItem("userId", data.userId);
			toast.success("Welcome back");
			navigate("/dashboard");
		} catch (err) {
			toast.error(err.message);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent" />
			<div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
			<div className="pointer-events-none absolute -right-32 bottom-1/4 h-96 w-96 rounded-full bg-fuchsia-500/15 blur-3xl" />

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.45 }}
				className="relative z-10 w-full max-w-md"
			>
				<div className="mb-8 text-center">
					<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-600 shadow-lg shadow-cyan-500/30">
						<Sparkles className="h-8 w-8 text-white" />
					</div>
					<h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
						CareerOS
					</h1>
					<p className="mt-2 text-slate-600 dark:text-slate-400">
						Sign in to sync your analysis history
					</p>
				</div>

				<div className="glass rounded-3xl p-8 shadow-2xl">
					<form onSubmit={onSubmit} className="space-y-6">
						<div className="relative">
							<input
								id="email"
								type="email"
								autoComplete="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="peer w-full rounded-xl border border-slate-300/80 bg-white/50 px-4 pb-2 pt-5 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-white/15 dark:bg-slate-900/40 dark:text-white"
								placeholder=" "
							/>
							<label
								htmlFor="email"
								className="pointer-events-none absolute left-4 top-3.5 text-sm text-slate-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-cyan-600 dark:peer-focus:text-cyan-400 [.peer:not(:placeholder-shown)]:top-2 [.peer:not(:placeholder-shown)]:text-xs"
							>
								Email
							</label>
						</div>

						<div className="relative">
							<input
								id="password"
								type={show ? "text" : "password"}
								autoComplete="current-password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="peer w-full rounded-xl border border-slate-300/80 bg-white/50 px-4 pb-2 pt-5 pr-12 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-white/15 dark:bg-slate-900/40 dark:text-white"
								placeholder=" "
							/>
							<label
								htmlFor="password"
								className="pointer-events-none absolute left-4 top-3.5 text-sm text-slate-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-cyan-600 dark:peer-focus:text-cyan-400 [.peer:not(:placeholder-shown)]:top-2 [.peer:not(:placeholder-shown)]:text-xs"
							>
								Password
							</label>
							<button
								type="button"
								className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-500 hover:bg-slate-200/50 dark:hover:bg-white/10"
								onClick={() => setShow((s) => !s)}
								aria-label={show ? "Hide password" : "Show password"}
							>
								{show ? (
									<EyeOff className="h-5 w-5" />
								) : (
									<Eye className="h-5 w-5" />
								)}
							</button>
						</div>

						<Button type="submit" className="w-full !py-3.5" disabled={loading}>
							{loading ? "Signing in…" : "Sign in"}
						</Button>
					</form>

					<p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
						No account?{" "}
						<Link
							to="/signup"
							className="font-semibold text-cyan-600 hover:underline dark:text-cyan-400"
						>
							Create one
						</Link>
					</p>
				</div>
			</motion.div>
		</div>
	);
}
