const express = require('express');
const router = express.Router();
const CodingProblem = require('../models/CodingProblem');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');
const { requireStaff } = require('../middleware/roles');

// Get all coding problems
router.get('/', verifyToken, async (req, res) => {
  try {
    let query = {};
    const user = await User.findById(req.user.id);
    if (user && user.role === 'student' && user.classId) {
      query.$or = [
        { targetClasses: { $size: 0 } },
        { targetClasses: user.classId }
      ];
    } else if (user && user.role === 'student' && !user.classId) {
      query.targetClasses = { $size: 0 };
    }

    const problems = await CodingProblem.find(query).sort({ createdAt: -1 });
    res.json(problems);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new coding problem (Staff only)
router.post('/', verifyToken, requireStaff, async (req, res) => {
  try {
    const { title, url, platform, difficulty, targetClasses } = req.body;
    const problem = new CodingProblem({ title, url, platform, difficulty, targetClasses, createdBy: req.user.id });
    await problem.save();
    res.status(201).json(problem);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a coding problem (Staff only)
router.delete('/:id', verifyToken, requireStaff, async (req, res) => {
  try {
    await CodingProblem.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
