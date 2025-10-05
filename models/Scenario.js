// models/Scenario.js
const mongoose = require('mongoose');

const ScenarioSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g. "IT Project"
  summary: String,
  steps: [String],
  mapping: mongoose.Schema.Types.Mixed // optional mapping to standards
}, { timestamps: true });

module.exports = mongoose.model('Scenario', ScenarioSchema);
