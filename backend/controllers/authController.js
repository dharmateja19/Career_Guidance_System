const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

exports.signup = async (req, res) => {
	try {
		const { name, email, password } = req.body;

		const existing = await User.findOne({ email });
		if (existing)
			return res.status(400).json({ msg: "Email already registered" });

		const hashed = await bcrypt.hash(password, 10);
		const user = new User({ name, email, password: hashed });
		await user.save();

		const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
			expiresIn: "7d",
		});

		res.json({ message: "Signup successful", token, userId: user._id });
	} catch (err) {
		console.error(err);
		res.status(500).json({ msg: "Server error" });
	}
};

exports.login = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });
		if (!user) return res.status(400).json({ msg: "User not found" });

		const match = await bcrypt.compare(password, user.password);
		if (!match) return res.status(400).json({ msg: "Wrong password" });

		const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
			expiresIn: "7d",
		});

		res.json({ message: "Login successful", token, userId: user._id });
	} catch (err) {
		console.error(err);
		res.status(500).json({ msg: "Server error" });
	}
};
