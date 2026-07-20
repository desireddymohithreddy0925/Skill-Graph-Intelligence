const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { type: String, maxLength: 5000, required: true, unique: true },
  description: { type: String, maxLength: 5000 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Role', roleSchema);
