const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema({
	name: String,
	createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Skill", skillSchema);
