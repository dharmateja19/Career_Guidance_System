const headers = (json = true) => {
	const h = {};
	if (json) h["Content-Type"] = "application/json";
	const token = localStorage.getItem("token");
	if (token) h.Authorization = `Bearer ${token}`;
	return h;
};

export async function loginRequest(email, password) {
	const res = await fetch("/api/auth/login", {
		method: "POST",
		headers: headers(),
		body: JSON.stringify({ email, password }),
	});
	const data = await res.json().catch(() => ({}));
	if (!res.ok) throw new Error(data.msg || data.message || "Login failed");
	return data;
}

export async function signupRequest(name, email, password) {
	const res = await fetch("/api/auth/signup", {
		method: "POST",
		headers: headers(),
		body: JSON.stringify({ name, email, password }),
	});
	const data = await res.json().catch(() => ({}));
	if (!res.ok) throw new Error(data.msg || data.message || "Signup failed");
	return data;
}

export async function analyzeCareer(body) {
	const res = await fetch("/api/career/analyze", {
		method: "POST",
		headers: headers(),
		body: JSON.stringify(body),
	});
	const data = await res.json().catch(() => ({}));
	if (!res.ok) throw new Error(data.msg || data.message || "Analysis failed");
	return data;
}

export async function fetchHistory() {
	const res = await fetch("/api/career/history", { headers: headers(false) });
	const data = await res.json().catch(() => ({}));
	if (!res.ok) throw new Error(data.msg || "Failed to load history");
	return data;
}
