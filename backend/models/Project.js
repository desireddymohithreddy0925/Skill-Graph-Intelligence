const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  userEmail: {
    type: String, maxLength: 5000,
    required: true
  },
  projectName: {
    type: String, maxLength: 5000,
    required: true
  },
  studentName: {
    type: String, maxLength: 5000,
    required: false
  },
  rollNumber: {
    type: String, maxLength: 5000,
    required: false
  },
  githubLink: {
    type: String, maxLength: 5000,
    required: true
  },
  onedriveLink: {
    type: String, maxLength: 5000,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Project', ProjectSchema);
