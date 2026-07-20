const defaultDashboardData = {
  stats: {
    xp: 0,
    streak: 0
  },
  placementReadiness: {
    overall: 50,
    technical: 50,
    communication: 50,
    consistency: 50,
    projects: 50
  },
  todaysMission: [
    { id: 'm1', title: 'Complete your first Coding Problem', completed: false },
    { id: 'm2', title: 'Take a Viva Assessment', completed: false }
  ],
  aiSkillGap: {
    targetSkill: 'Programming Basics',
    overallMastery: 0,
    roadmapChecklist: [
      { title: 'Programming Basics', status: 'missing' }
    ],
    aiStrategy: {
      hoursToMaster: 20,
      path: ['Programming Basics']
    }
  },
  competencyGraph: {
    logic: 50,
    system: 50,
    database: 50,
    frontend: 50,
    behavioral: 50,
    structures: 50,
    peerRank: 'Top 99%',
    percentile: 1
  },
  gamification: {
    xpVelocity: [0, 0, 0, 0, 0, 0, 0],
    milestones: {
      level: 1,
      progressPercent: 0,
      xpToNext: 100,
      upcomingReward: 'Beginner Badge'
    }
  },
  performanceIntelligence: {
    accuracy: 0,
    focusArea: 'General Programming'
  },
  skillRoadmap: [
    { id: 1, title: 'Programming Basics', status: 'in-progress', color: 'var(--warning)' },
    { id: 2, title: 'Arrays', status: 'locked', color: 'var(--error)' },
    { id: 3, title: 'Sorting', status: 'locked', color: 'var(--error)' },
    { id: 4, title: 'Trees', status: 'locked', color: 'var(--error)' },
    { id: 5, title: 'Graphs', status: 'locked', color: 'var(--error)' },
    { id: 6, title: 'Dynamic Programming', status: 'locked', color: 'var(--error)' }
  ]
};

const defaultUserProgress = {
  gpsTasks: {
    dsa: false,
    dbms: false,
    oop: false
  },
  completedTopics: {}
};

module.exports = { defaultDashboardData, defaultUserProgress };
