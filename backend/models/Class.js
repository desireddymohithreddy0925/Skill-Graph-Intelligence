const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  year: { type: String, required: true },
  mentors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Class', classSchema);
