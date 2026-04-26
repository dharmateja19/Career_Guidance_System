import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { signupRequest } from "../api/client.js";
import { Button } from "../components/Button.jsx";

export default function Signup() {
	const navigate = useNavigate();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [show, setShow] = useState(false);
	const [loading, setLoading] = useState(false);

	async function onSubmit(e) {
		e.preventDefault();
		if (!name.trim() || !email.trim() || password.length < 6) {
			toast.error("Name, email, and password (min 6 chars) required.");
			return;
		}
		setLoading(true);
		try {
			const data = await signupRequest(name.trim(), email.trim(), password);
			localStorage.setItem("token", data.token);
			localStorage.setItem("userId", data.userId);
			toast.success("Account created");
			navigate("/dashboard");
		} catch (err) {
			toast.error(err.message);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-500/20 via-transparent to-transparent" />
			<div className="pointer-events-none absolute right-0 top-1/3 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl" />

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.45 }}
				className="relative z-10 w-full max-w-md"
			>
				<div className="mb-8 text-center">
					<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-500/30">
						<Sparkles className="h-8 w-8 text-white" />
					</div>
					<h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
						Join CareerOS
					</h1>
					<p className="mt-2 text-slate-600 dark:text-slate-400">
						Create an account to save analyses
					</p>
				</div>

				<div className="glass rounded-3xl p-8 shadow-2xl">
					<form onSubmit={onSubmit} className="space-y-5">
						<div className="relative">
							<input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="peer w-full rounded-xl border border-slate-300/80 bg-white/50 px-4 pb-2 pt-5 text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-white/15 dark:bg-slate-900/40 dark:text-white"
								placeholder=" "
							/>
							<label
								htmlFor="name"
								className="pointer-events-none absolute left-4 top-3.5 text-sm text-slate-500 transition-all peer-placeholder-shown:top-3.5 peer-focus:top-2 peer-focus:text-xs [.peer:not(:placeholder-shown)]:top-2 [.peer:not(:placeholder-shown)]:text-xs"
							>
								Full name
							</label>
						</div>

						<div className="relative">
							<input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="peer w-full rounded-xl border border-slate-300/80 bg-white/50 px-4 pb-2 pt-5 text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-white/15 dark:bg-slate-900/40 dark:text-white"
								placeholder=" "
							/>
							<label
								htmlFor="email"
								className="pointer-events-none absolute left-4 top-3.5 text-sm text-slate-500 transition-all peer-placeholder-shown:top-3.5 peer-focus:top-2 peer-focus:text-xs [.peer:not(:placeholder-shown)]:top-2 [.peer:not(:placeholder-shown)]:text-xs"
							>
								Email
							</label>
						</div>

						<div className="relative">
							<input
								id="password"
								type={show ? "text" : "password"}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="peer w-full rounded-xl border border-slate-300/80 bg-white/50 px-4 pb-2 pt-5 pr-12 text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-white/15 dark:bg-slate-900/40 dark:text-white"
								placeholder=" "
							/>
							<label
								htmlFor="password"
								className="pointer-events-none absolute left-4 top-3.5 text-sm text-slate-500 transition-all peer-placeholder-shown:top-3.5 peer-focus:top-2 peer-focus:text-xs [.peer:not(:placeholder-shown)]:top-2 [.peer:not(:placeholder-shown)]:text-xs"
							>
								Password (min 6 characters)
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

						<Button
							type="submit"
							className="mt-2 w-full !py-3.5"
							disabled={loading}
						>
							{loading ? "Creating…" : "Create account"}
						</Button>
					</form>

					<p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
						Already have an account?{" "}
						<Link
							to="/login"
							className="font-semibold text-violet-600 hover:underline dark:text-violet-400"
						>
							Sign in
						</Link>
					</p>
				</div>
			</motion.div>
		</div>
	);
}
