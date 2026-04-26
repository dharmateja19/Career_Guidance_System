import clsx from "clsx";

export function GlassCard({ children, className, title, subtitle }) {
	return (
		<div className={clsx("glass rounded-2xl p-6", className)}>
			{(title || subtitle) && (
				<div className="mb-4">
					{title && (
						<h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
							{title}
						</h3>
					)}
					{subtitle && (
						<p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
							{subtitle}
						</p>
					)}
				</div>
			)}
			{children}
		</div>
	);
}
