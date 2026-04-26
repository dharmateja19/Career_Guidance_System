import clsx from "clsx";

export function Button({
	children,
	className,
	variant = "primary",
	disabled,
	type = "button",
	...props
}) {
	const base =
		"inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";
	const variants = {
		primary:
			"bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:brightness-110",
		secondary:
			"glass text-slate-800 dark:text-slate-100 border border-slate-300/50 dark:border-white/15 hover:bg-white/80 dark:hover:bg-white/10",
		ghost:
			"text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-white/5",
	};
	return (
		<button
			type={type}
			className={clsx(base, variants[variant], className)}
			disabled={disabled}
			{...props}
		>
			{children}
		</button>
	);
}
