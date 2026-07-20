const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  tokenVersion: { type: Number, default: 0 },
  role: { type: String, default: 'student' },
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastActivityDate: { type: Date, default: null },
  activityHistory: [{ type: Date }], // To track the exact days for the streak calendar
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', default: null },
  
  // Personal Info
  personalInfo: {
    username: { type: String, default: '' },
    institute: { type: String, default: '' },
    rollNumber: { type: String, default: '' },
    phoneNumber: { type: String, default: '' },
    department: { type: String, default: '' },
    passoutYear: { type: String, default: '' },
    gender: { type: String, default: '' },
  },

  // Social Profile
  socialProfile: {
    githubUrl: { type: String, default: '' },
    linkedInUrl: { type: String, default: '' },
  },

  // Coding Platforms
  codingProfiles: {
    leetcode: { type: String, default: '' },
    hackerrank: { type: String, default: '' },
    codechef: { type: String, default: '' },
    codeforces: { type: String, default: '' },
    atcoder: { type: String, default: '' },
  },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
