const express = require('express');
const router = express.Router();
const DashboardData = require('../models/DashboardData');
const UserProgress = require('../models/UserProgress');
const User = require('../models/User');
const DreamCompany = require('../models/DreamCompany');
const AssessmentSubmission = require('../models/AssessmentSubmission');
const Assignment = require('../models/Assignment');
const { evaluateCurrentStreak, updateStreak } = require('../utils/streakManager');

// Helper to get the single mock dashboard data
const getDashboardData = async () => {
  let data = await DashboardData.findOne();
  return data;
};

// @route   GET /api/dashboard/full
// @desc    Get complete dynamic dashboard data
router.get('/full', async (req, res) => {
  try {
    const userId = req.query.userId || 'default_user';
    let user = null;
    let progress = null;
    let submissions = [];
    let assignments = [];
    
    // Fallback static data
    const mockData = await getDashboardData();
    if (!mockData) return res.status(404).json({ error: 'Dashboard data not found' });
    const data = mockData.toObject();

    if (userId !== 'default_user') {
      user = await User.findById(userId);
      if (user) {
        await updateStreak(userId);
        user = await User.findById(userId);
      }
      progress = await UserProgress.findOne({ userId });
      submissions = await AssessmentSubmission.find({ studentId: userId });
      assignments = await Assignment.find({ studentId: userId });
    } else {
      progress = await UserProgress.findOne({ userId: 'default_user' });
    }

    if (!progress) {
      progress = { currentSkills: [], skillRoadmap: [], dreamCompany: 'Google' };
    }

    // 1. Competency Graph Dynamic Update
    let avgScore = 0;
    if (submissions.length > 0) {
      const totalScore = submissions.reduce((acc, sub) => acc + (sub.score || 0), 0);
      const totalPossible = submissions.reduce((acc, sub) => acc + ((sub.totalQuestions || 10) * 10), 0);
      avgScore = totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;
    }
    // We blend actual average with a baseline to ensure UI doesn't look empty for new users
    data.competencyGraph = {
      logic: Math.min(100, (avgScore * 0.8) + 20),
      system: Math.min(100, (avgScore * 0.7) + 30),
      database: Math.min(100, (avgScore * 0.9) + 10),
      frontend: Math.min(100, (avgScore * 0.85) + 15),
      behavioral: Math.min(100, (avgScore * 0.6) + 40),
      structures: Math.min(100, (avgScore * 0.9) + 20),
      peerRank: avgScore > 80 ? 'Top 10%' : avgScore > 50 ? 'Top 30%' : 'Top 50%',
      percentile: Math.min(99, Math.floor(avgScore) || 50)
    };

    // 2. AI Skill Gap based on Mentor Skill Roadmap
    let roadmapNodes = progress.skillRoadmap || [];
    let missingOrProgress = roadmapNodes.filter(n => n.status === 'locked' || n.status === 'in-progress');
    let completedNodes = roadmapNodes.filter(n => n.status === 'completed');
    
    if (roadmapNodes.length > 0) {
      data.aiSkillGap.overallMastery = Math.round((completedNodes.length / roadmapNodes.length) * 100);
      data.aiSkillGap.roadmapChecklist = missingOrProgress.map(n => ({
        title: n.title,
        status: n.status === 'locked' ? 'missing' : 'in-progress'
      }));
      data.aiSkillGap.targetSkill = missingOrProgress.length > 0 ? missingOrProgress[0].title : 'All Mastered';
    }

    // 3. Placement Readiness Update
    let dc = await DreamCompany.findOne({ name: progress.dreamCompany || 'Google' });
    if (dc && dc.requiredSkills) {
      const required = dc.requiredSkills;
      const current = progress.currentSkills || [];
      const hasCount = required.filter(skill => current.includes(skill)).length;
      const overall = required.length > 0 ? Math.round((hasCount / required.length) * 100) : 100;
      data.placementReadiness.overall = overall;
      data.placementReadiness.technical = overall;
      data.placementReadiness.consistency = user ? Math.min(100, user.streak * 5) : 10;
      data.placementReadiness.projects = assignments.filter(a => a.isCompleted).length * 10;
    }

    // 4. Gamification Dynamic Update
    const compAssn = assignments.filter(a => a.isCompleted).length;
    data.gamification.milestones.progressPercent = Math.min(100, (compAssn * 20));
    data.performanceIntelligence.accuracy = Math.round(avgScore || 75);

    // Apply User Stats
    data.stats = {
      ...data.stats,
      xp: user?.xp ?? data.stats.xp,
      streak: user?.streak ?? data.stats.streak,
      activityHistory: user?.activityHistory ?? []
    };
    
    res.status(200).json({ message: 'Dashboard data retrieved perfectly', data });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// @route   POST /api/dashboard/mission/complete
// @desc    Toggle a mission item in Today's Mission and award XP if all are complete
router.post('/mission/complete', async (req, res) => {
  try {
    const { id } = req.body;
    const data = await getDashboardData();
    if (!data) return res.status(404).json({ error: 'Dashboard data not found' });
    
    let mission = data.todaysMission.find(m => m.id === id);
    if (!mission) return res.status(404).json({ error: 'Mission not found' });

    // Toggle completion
    mission.completed = !mission.completed;

    // Check if all are completed now
    const allCompleted = data.todaysMission.every(m => m.completed);
    let xpAwarded = 0;
    
    // Only award XP once when transitioning from not-all to all
    // Since this is mock data, we just check current state.
    // Let's add 50 XP if all are true. We won't remove XP if unchecked to keep it simple.
    if (allCompleted && mission.completed) {
       data.stats.xp += 50;
       xpAwarded = 50;
    }

    await data.save();
    
    res.status(200).json({ 
      message: 'Mission toggled perfectly', 
      todaysMission: data.todaysMission,
      xp: data.stats.xp,
      xpAwarded
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// @route   GET /api/dashboard/roadmap/:studentId
// @desc    Get student's roadmap
router.get('/roadmap/:studentId', async (req, res) => {
  try {
    let progress = await UserProgress.findOne({ userId: req.params.studentId });
    if (!progress) return res.status(200).json({ skillRoadmap: [] });
    res.status(200).json({ skillRoadmap: progress.skillRoadmap || [] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// @route   PUT /api/dashboard/roadmap/:studentId
// @desc    Update student's roadmap (for mentors)
router.put('/roadmap/:studentId', async (req, res) => {
  try {
    const { skillRoadmap } = req.body;
    let progress = await UserProgress.findOne({ userId: req.params.studentId });
    if (!progress) {
      progress = await UserProgress.create({ userId: req.params.studentId, skillRoadmap });
    } else {
      progress.skillRoadmap = skillRoadmap;
      await progress.save();
    }
    res.status(200).json({ message: 'Roadmap updated successfully', skillRoadmap: progress.skillRoadmap });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// @route   PUT /api/dashboard/roadmap/class/:classId
// @desc    Update roadmap for an entire class
router.put('/roadmap/class/:classId', async (req, res) => {
  try {
    const { skillRoadmap } = req.body;
    const students = await User.find({ classId: req.params.classId, role: 'student' });
    
    for (const student of students) {
      let progress = await UserProgress.findOne({ userId: student._id.toString() });
      if (!progress) {
        await UserProgress.create({ userId: student._id.toString(), skillRoadmap });
      } else {
        progress.skillRoadmap = skillRoadmap;
        await progress.save();
      }
    }
    res.status(200).json({ message: 'Class roadmaps updated successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// @route   POST /api/dashboard/roadmap/start
// @desc    Mark the current AI Skill gap module as 'in-progress' or 'completed'
router.post('/roadmap/start', async (req, res) => {
  // Legacy mock logic - removed or simulated
  res.status(200).json({ message: 'Module started successfully' });
});

// Old endpoints kept for backwards compatibility if needed
router.get('/overview', async (req, res) => {
  try {
    const data = await getDashboardData();
    res.status(200).json({ message: 'Dashboard data retrieved perfectly', data: data ? data.overview : {} });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// @route   GET /api/dashboard/dream-companies
// @route   GET /api/dashboard/dream-companies
// @desc    Get dynamic readiness data and AI match analysis for dream companies
router.get('/dream-companies', async (req, res) => {
  try {
    let progress = await UserProgress.findOne({ userId: 'default_user' });
    if (!progress) {
      progress = await UserProgress.create({ userId: 'default_user' });
    }
    const studentSkills = progress.currentSkills || [];
    const activeCompany = progress.dreamCompany || 'Google';

    // Fetch all companies from DB
    let companiesList = await DreamCompany.find();
    
    // Auto-seed if empty for demo purposes
    if (companiesList.length === 0) {
      const seedCompanies = [
        { name: 'Google', requiredSkills: ['Data Structures', 'Algorithms', 'System Design', 'Go', 'Python'] },
        { name: 'Microsoft', requiredSkills: ['C#', '.NET', 'System Design', 'Algorithms', 'Azure'] },
        { name: 'Amazon', requiredSkills: ['Leadership Principles', 'System Design', 'AWS', 'Java', 'Data Structures'] },
        { name: 'Apple', requiredSkills: ['Swift', 'Objective-C', 'iOS', 'Data Structures', 'System Design'] }
      ];
      await DreamCompany.insertMany(seedCompanies);
      companiesList = await DreamCompany.find();
    }

    const companiesData = {};
    
    companiesList.forEach(company => {
      const reqSkills = company.requiredSkills || [];
      const missing = reqSkills.filter(skill => !studentSkills.includes(skill));
      
      const hasCount = reqSkills.length - missing.length;
      let readiness = 0;
      if (reqSkills.length > 0) {
        readiness = Math.round((hasCount / reqSkills.length) * 100);
      } else {
        readiness = 100; // If no skills required, 100%
      }

      // Generate "AI" Insights
      let aiAnalysis = {
        laggingAreas: missing.length > 0 ? `You are currently lacking in ${missing.join(', ')}. Focus on building small projects or taking targeted assessments in these areas.` : `Great job! You possess all the core technical skills listed for ${company.name}.`,
        unknownFactors: "Behavioral traits, culture fit, and soft skills are currently unmeasured."
      };

      companiesData[company.name] = { 
        readiness, 
        missing, 
        requiredSkills: reqSkills,
        aiAnalysis 
      };
    });

    res.status(200).json({ 
      companies: companiesData, 
      activeCompany,
      studentSkills
    });
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

// @route   POST /api/dashboard/student-skills
// @desc    Update the student's current skills
router.post('/student-skills', async (req, res) => {
  try {
    const { skills } = req.body;
    let progress = await UserProgress.findOne({ userId: 'default_user' });
    if (!progress) {
      progress = await UserProgress.create({ userId: 'default_user', currentSkills: skills });
    } else {
      progress.currentSkills = skills;
      await progress.save();
    }
    res.status(200).json({ message: 'Skills updated', currentSkills: progress.currentSkills });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/dashboard/dream-companies-admin
// @desc    Get all dream companies for admin management
router.get('/dream-companies-admin', async (req, res) => {
  try {
    const companies = await DreamCompany.find().sort({ name: 1 });
    res.status(200).json(companies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/dashboard/dream-companies-admin
// @desc    Create or update a dream company
router.post('/dream-companies-admin', async (req, res) => {
  try {
    const { name, requiredSkills } = req.body;
    let company = await DreamCompany.findOne({ name });
    if (company) {
      company.requiredSkills = requiredSkills;
      await company.save();
    } else {
      company = await DreamCompany.create({ name, requiredSkills });
    }
    res.status(200).json(company);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   DELETE /api/dashboard/dream-companies-admin/:id
// @desc    Delete a dream company
router.delete('/dream-companies-admin/:id', async (req, res) => {
  try {
    await DreamCompany.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Company deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/dashboard/career-gps
// @desc    Get the user's career GPS tasks
router.get('/career-gps', async (req, res) => {
  try {
    let progress = await UserProgress.findOne({ userId: 'default_user' });
    if (!progress) {
      progress = await UserProgress.create({ userId: 'default_user' });
    }
    res.status(200).json({ tasks: progress.gpsTasks, dreamCompany: progress.dreamCompany });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/dashboard/career-gps/toggle
// @desc    Toggle a specific GPS task
router.post('/career-gps/toggle', async (req, res) => {
  try {
    const { key } = req.body;
    let progress = await UserProgress.findOne({ userId: 'default_user' });
    if (!progress) return res.status(404).json({ error: 'User progress not found' });

    if (progress.gpsTasks && typeof progress.gpsTasks[key] !== 'undefined') {
      progress.gpsTasks[key] = !progress.gpsTasks[key];
      await progress.save();
    }
    
    res.status(200).json({ message: 'Task toggled', tasks: progress.gpsTasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/dashboard/dream-company
// @desc    Update the user's dream company
router.post('/dream-company', async (req, res) => {
  try {
    const { company } = req.body;
    let progress = await UserProgress.findOne({ userId: 'default_user' });
    if (!progress) {
      progress = await UserProgress.create({ userId: 'default_user', dreamCompany: company });
    } else {
      progress.dreamCompany = company;
      await progress.save();
    }
    res.status(200).json({ message: 'Dream company updated', company: progress.dreamCompany });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
