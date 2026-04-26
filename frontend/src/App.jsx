import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { Layout } from "./components/Layout.jsx";

const Login = lazy(() => import("./pages/Login.jsx"));
const Signup = lazy(() => import("./pages/Signup.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));

function PageFallback() {
	return (
		<div className="flex min-h-[40vh] items-center justify-center">
			<div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
		</div>
	);
}

export default function App() {
	return (
		<ThemeProvider>
			<Toaster richColors position="top-center" />
			<Suspense fallback={<PageFallback />}>
				<Routes>
					<Route path="/login" element={<Login />} />
					<Route path="/signup" element={<Signup />} />
					<Route element={<Layout />}>
						<Route path="/" element={<Navigate to="/dashboard" replace />} />
						<Route path="/dashboard" element={<Dashboard />} />
					</Route>
					<Route path="*" element={<Navigate to="/dashboard" replace />} />
				</Routes>
			</Suspense>
		</ThemeProvider>
	);
}
