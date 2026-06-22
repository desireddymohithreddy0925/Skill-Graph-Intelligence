const mongoose = require('mongoose');

const skillTResponseSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  batch: {
    type: String,
    required: true
  },
  word: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SkillTResponse', skillTResponseSchema);
