const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const User = require('../models/User');
const { updateStreak } = require('../utils/streakManager');
const { verifyToken } = require('../middleware/auth');
const { requireStaff } = require('../middleware/roles');

// Create a new assignment (Staff only)
router.post('/', verifyToken, requireStaff, async (req, res) => {
  try {
    const { mentorId, studentId, title, description, dueDate } = req.body;
    // ensure mentor is the current user
    const assignment = new Assignment({ mentorId: req.user.id, studentId, title, description, dueDate });
    await assignment.save();
    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get assignments for a student
router.get('/student/:id', verifyToken, async (req, res) => {
  try {
    // IDOR protection
    if (req.user.id !== req.params.id) {
       const user = await User.findById(req.user.id);
       if (!user || !['admin', 'sub admin', 'manager', 'mentor'].includes(user.role)) {
         return res.status(403).json({ error: 'Forbidden' });
       }
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Assignment.countDocuments({ studentId: req.params.id });
    const assignments = await Assignment.find({ studentId: req.params.id })
      .populate('mentorId', 'personalInfo.username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ data: assignments, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark assignment as completed
router.put('/:id/complete', verifyToken, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Not found' });
    
    // IDOR protection
    if (assignment.studentId.toString() !== req.user.id) {
       return res.status(403).json({ error: 'Forbidden' });
    }
    
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
