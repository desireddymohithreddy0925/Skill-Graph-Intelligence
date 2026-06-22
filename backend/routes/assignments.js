const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const { updateStreak } = require('../utils/streakManager');

// Create a new assignment
router.post('/', async (req, res) => {
  try {
    const { mentorId, studentId, title, description, dueDate } = req.body;
    const assignment = new Assignment({ mentorId, studentId, title, description, dueDate });
    await assignment.save();
    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get assignments for a student
router.get('/student/:id', async (req, res) => {
  try {
    const assignments = await Assignment.find({ studentId: req.params.id }).populate('mentorId', 'personalInfo.username email').sort({ createdAt: -1 });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark assignment as completed
router.put('/:id/complete', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Not found' });
    
    assignment.isCompleted = true;
    await assignment.save();
    
    // Update streak for completing an assignment
    const streakInfo = await updateStreak(assignment.studentId);
    
    res.json({ assignment, streakInfo });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
