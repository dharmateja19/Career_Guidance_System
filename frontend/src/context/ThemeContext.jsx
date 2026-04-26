import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({ dark: true, toggle: () => {} });

export function ThemeProvider({ children }) {
	const [dark, setDark] = useState(() => {
		try {
			return localStorage.getItem("theme") !== "light";
		} catch {
			return true;
		}
	});

	useEffect(() => {
		const root = document.documentElement;
		if (dark) {
			root.classList.add("dark");
			localStorage.setItem("theme", "dark");
		} else {
			root.classList.remove("dark");
			localStorage.setItem("theme", "light");
		}
	}, [dark]);

	const toggle = () => setDark((d) => !d);

	return (
		<ThemeContext.Provider value={{ dark, toggle }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	return useContext(ThemeContext);
}
