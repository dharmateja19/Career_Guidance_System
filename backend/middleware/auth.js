const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

module.exports = function (req, res, next) {
	const auth = req.headers["authorization"] || req.headers["Authorization"];
	if (!auth) return next(); // allow anonymous

	const parts = String(auth).split(" ");
	if (parts.length !== 2) return next();

	const token = parts[1];
	try {
		const payload = jwt.verify(token, JWT_SECRET);
		req.user = { id: payload.userId };
	} catch (err) {
		// invalid token -> ignore
		req.user = null;
	}
	next();
};
