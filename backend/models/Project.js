const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true
  },
  projectName: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    required: false
  },
  rollNumber: {
    type: String,
    required: false
  },
  githubLink: {
    type: String,
    required: true
  },
  onedriveLink: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Project', ProjectSchema);
