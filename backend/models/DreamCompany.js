const mongoose = require('mongoose');

const DreamCompanySchema = new mongoose.Schema({
  name: { type: String, maxLength: 5000, required: true, unique: true },
  requiredSkills: [{ type: String, maxLength: 5000 }],
  description: { type: String, maxLength: 5000, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('DreamCompany', DreamCompanySchema);
