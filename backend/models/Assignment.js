const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: { type: String, maxLength: 5000, required: true },
  description: { type: String, maxLength: 5000 },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dueDate: { type: Date },
  isCompleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Assignment', assignmentSchema);
