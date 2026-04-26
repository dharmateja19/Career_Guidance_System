import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Sidebar } from "./Sidebar.jsx";
import { TopNav } from "./TopNav.jsx";
import { toast } from "sonner";

export function Layout() {
	const [collapsed, setCollapsed] = useState(false);
	const [token, setToken] = useState(() => localStorage.getItem("token"));
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		setToken(localStorage.getItem("token"));
	}, [location.pathname]);

	const logout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("userId");
		setToken(null);
		toast.success("Logged out");
		navigate("/login");
	};

	return (
		<div className="flex min-h-screen">
			<Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
			<div className="flex min-h-screen flex-1 flex-col gap-4 p-4 md:p-6">
				<TopNav token={token} onLogout={logout} />
				<motion.main
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.35 }}
					className="flex-1"
				>
					<Outlet />
				</motion.main>
			</div>
		</div>
	);
}
