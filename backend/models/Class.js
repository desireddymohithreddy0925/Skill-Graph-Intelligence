const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: { type: String, maxLength: 5000, required: true },
  year: { type: String, maxLength: 5000, required: true },
  mentors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

classSchema.index({ students: 1 });

module.exports = mongoose.model('Class', classSchema);
