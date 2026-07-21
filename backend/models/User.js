const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, maxLength: 255 },
  password: { type: String, required: true, maxLength: 1024 },
  tokenVersion: { type: Number, default: 0 },
  role: { type: String, default: 'student' },
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastActivityDate: { type: Date, default: null },
  activityHistory: [{ type: Date }], // To track the exact days for the streak calendar
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', default: null },
  
  // Password Reset
  resetPasswordOtp: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
  
  // Personal Info
  personalInfo: {
    username: { type: String, default: '', maxLength: 255 },
    institute: { type: String, default: '', maxLength: 255 },
    rollNumber: { type: String, default: '', maxLength: 100 },
    phoneNumber: { type: String, default: '', maxLength: 20 },
    department: { type: String, default: '', maxLength: 255 },
    passoutYear: { type: String, default: '', maxLength: 10 },
    gender: { type: String, default: '', maxLength: 50 },
  },

  // Social Profile
  socialProfile: {
    githubUrl: { type: String, default: '', maxLength: 1000 },
    linkedInUrl: { type: String, default: '', maxLength: 1000 },
  },

  // Coding Platforms
  codingProfiles: {
    leetcode: { type: String, default: '', maxLength: 255 },
    hackerrank: { type: String, default: '', maxLength: 255 },
    codechef: { type: String, default: '', maxLength: 255 },
    codeforces: { type: String, default: '', maxLength: 255 },
    atcoder: { type: String, default: '', maxLength: 255 },
  },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
