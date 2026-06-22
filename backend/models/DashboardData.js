const mongoose = require('mongoose');

const DashboardDataSchema = new mongoose.Schema({
  stats: {
    xp: { type: Number, default: 0 },
    streak: { type: Number, default: 0 }
  },
  placementReadiness: {
    overall: { type: Number, default: 0 },
    technical: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    consistency: { type: Number, default: 0 },
    projects: { type: Number, default: 0 }
  },
  todaysMission: [{
    id: String,
    title: String,
    completed: Boolean
  }],
  aiSkillGap: {
    targetSkill: String,
    overallMastery: Number,
    roadmapChecklist: [{
      title: String,
      status: String // 'completed', 'missing'
    }],
    aiStrategy: {
      hoursToMaster: Number,
      path: [String]
    }
  },
  competencyGraph: {
    logic: Number,
    system: Number,
    database: Number,
    frontend: Number,
    behavioral: Number,
    structures: Number,
    peerRank: String,
    percentile: Number
  },
  gamification: {
    xpVelocity: [Number],
    milestones: {
      level: Number,
      progressPercent: Number,
      xpToNext: Number,
      upcomingReward: String
    }
  },
  performanceIntelligence: {
    accuracy: Number,
    focusArea: String
  },
  skillRoadmap: [{
    id: Number,
    title: String,
    status: String, // 'completed', 'in-progress', 'locked'
    color: String
  }]
});

module.exports = mongoose.model('DashboardData', DashboardDataSchema);
