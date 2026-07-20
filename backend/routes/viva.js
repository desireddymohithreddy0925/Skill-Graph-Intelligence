const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const UserProgress = require('../models/UserProgress');
const InterviewReport = require('../models/InterviewReport');
const { verifyToken } = require('../middleware/auth');

// Helper
const getUserProgress = async (userId) => {
  let progress = await UserProgress.findOne({ userId });
  if (!progress) {
    progress = await UserProgress.create({ userId });
  }
  return progress;
};

// @route   GET /api/viva/subjects
// @desc    Get all subjects and chapters
// @access  Private
router.get('/subjects', verifyToken, async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.status(200).json({ message: 'Subjects retrieved perfectly', subjects });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// @route   GET /api/viva/topics/status
// @desc    Get status of completed topics
// @access  Private
router.get('/topics/status', verifyToken, async (req, res) => {
  try {
    const progress = await getUserProgress(req.user.id);
    res.status(200).json({
      message: 'Topic statuses retrieved perfectly',
      completedTopics: progress ? progress.completedTopics : {}
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// @route   POST /api/viva/topics/complete
// @desc    Mark a topic as completed
// @access  Private
router.post('/topics/complete', verifyToken, async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required' });
    
    const progress = await getUserProgress(req.user.id);
    
    progress.completedTopics.set(topic, true);
    await progress.save();
    
    res.status(200).json({
      message: 'Topic marked as completed perfectly',
      completedTopics: progress.completedTopics
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// @route   POST /api/viva/start
// @desc    Initialize a viva interview
// @access  Private
router.post('/start', verifyToken, async (req, res) => {
  const { subject, unit } = req.body;
  if (!subject || !unit) {
    return res.status(400).json({ error: 'Subject and unit are required' });
  }

  // Returning the seeded session ID so the report fetching works properly!
  res.status(200).json({
    message: 'Interview session started perfectly',
    sessionId: `mock_session_1`, 
    questions: [
      "Explain the difference between a process and a thread.",
      "What is virtual memory and how does it work?",
      "Describe the concept of deadlocks. What are the necessary conditions for a deadlock?"
    ]
  });
});

// @route   POST /api/viva/evaluate
// @desc    Evaluate a candidate's answer
// @access  Private
router.post('/evaluate', verifyToken, (req, res) => {
  const { sessionId, answer } = req.body;
  
  // Mock LLM evaluation
  res.status(200).json({
    message: 'Answer evaluated perfectly',
    feedback: 'Excellent explanation with good examples.',
    score: Math.floor(Math.random() * 20) + 80 // Random score between 80 and 100
  });
});

// @route   GET /api/viva/report/:sessionId
// @desc    Get final interview report
// @access  Private
router.get('/report/:sessionId', verifyToken, async (req, res) => {
  try {
    const report = await InterviewReport.findOne({ sessionId: req.params.sessionId });
    if (!report) return res.status(404).json({ error: 'Report not found' });
    
    res.status(200).json({
      message: 'Report retrieved perfectly',
      report
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
