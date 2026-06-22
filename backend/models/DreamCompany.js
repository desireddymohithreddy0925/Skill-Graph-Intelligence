const mongoose = require('mongoose');

const DreamCompanySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  requiredSkills: [{ type: String }],
  description: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('DreamCompany', DreamCompanySchema);
