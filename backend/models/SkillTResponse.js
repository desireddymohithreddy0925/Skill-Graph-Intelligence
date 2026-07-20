const mongoose = require('mongoose');

const skillTResponseSchema = new mongoose.Schema({
  userEmail: {
    type: String, maxLength: 5000,
    required: true
  },
  studentName: {
    type: String, maxLength: 5000,
    required: true
  },
  batch: {
    type: String, maxLength: 5000,
    required: true
  },
  word: {
    type: String, maxLength: 5000,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SkillTResponse', skillTResponseSchema);
