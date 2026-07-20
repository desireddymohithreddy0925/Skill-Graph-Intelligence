const express = require('express');
const router = express.Router();
const ImportantLink = require('../models/ImportantLink');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');
const { requireStaff } = require('../middleware/roles');

// Get all important links
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

    const links = await ImportantLink.find(query).sort({ createdAt: -1 }).populate('createdBy', 'personalInfo.username email');
    res.json(links);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new important link (Staff only)
router.post('/', verifyToken, requireStaff, async (req, res) => {
  try {
    const { title, url, targetClasses } = req.body;
    const link = new ImportantLink({ title, url, targetClasses, createdBy: req.user.id });
    await link.save();
    res.status(201).json(link);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete an important link (Staff only)
router.delete('/:id', verifyToken, requireStaff, async (req, res) => {
  try {
    await ImportantLink.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
