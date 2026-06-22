const mongoose = require('mongoose');

const UserProgressSchema = new mongoose.Schema({
  userId: { type: String, default: 'default_user' },
  gpsTasks: {
    dsa: { type: Boolean, default: false },
    dbms: { type: Boolean, default: false },
    oop: { type: Boolean, default: false }
  },
  completedTopics: {
    type: Map,
    of: Boolean,
    default: {}
  },
  dreamCompany: { type: String, default: 'Google' },
  currentSkills: [{ type: String }],
  skillRoadmap: [{
    id: { type: String }, // Can be node ID or title
    title: { type: String },
    status: { type: String, default: 'locked' }, // 'completed', 'in-progress', 'locked'
    color: { type: String, default: 'var(--text-tertiary)' }
  }]
});

module.exports = mongoose.model('UserProgress', UserProgressSchema);
