const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  title: { type: String, maxLength: 5000, required: true },
  description: { type: String, maxLength: 5000 },
  type: { type: String, maxLength: 5000, enum: ['mcq', 'coding'], default: 'mcq' },
  timeLimit: { type: Number, default: 0 }, // in minutes, 0 means no limit
  questions: [{
    questionText: { type: String, maxLength: 5000, required: true },
    options: [{ type: String, maxLength: 5000 }], // Array of strings for MCQ options
    correctAnswer: { type: String, maxLength: 5000 } // String value of the correct option
  }],
  targetClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Assessment', assessmentSchema);
