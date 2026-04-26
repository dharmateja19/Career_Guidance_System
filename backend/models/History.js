const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
	userId: String,
	skills: Array,
	result: Object,
	source: { type: String, enum: ["prolog", "gemini"], default: "prolog" },
	skillGapAnalysis: String,
	roadmap: [String],
	summary: String,
	createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("History", historySchema);
