const mongoose = require('mongoose');

const UserProgressSchema = new mongoose.Schema({
  userId: { type: String, maxLength: 5000, default: 'default_user' },
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
  dreamCompany: { type: String, maxLength: 5000, default: 'Google' },
  currentSkills: [{ type: String, maxLength: 5000 }],
  skillRoadmap: [{
    id: { type: String, maxLength: 5000 }, // Can be node ID or title
    title: { type: String, maxLength: 5000 },
    status: { type: String, maxLength: 5000, default: 'locked' }, // 'completed', 'in-progress', 'locked'
    color: { type: String, maxLength: 5000, default: 'var(--text-tertiary)' }
  }]
});

module.exports = mongoose.model('UserProgress', UserProgressSchema);
