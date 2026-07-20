const mongoose = require('mongoose');

const assessmentSubmissionSchema = new mongoose.Schema({
  assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [{
    questionIndex: { type: Number, required: true },
    selectedOption: { type: String, maxLength: 5000 }
  }],
  score: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  tabSwitches: { type: Number, default: 0 },
  autoSubmitted: { type: Boolean, default: false },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AssessmentSubmission', assessmentSubmissionSchema);
