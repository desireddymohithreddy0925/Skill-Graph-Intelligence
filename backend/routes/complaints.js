const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const Class = require('../models/Class');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');
const { requireStaff } = require('../middleware/roles');
const Joi = require('joi');
const { validateBody } = require('../middleware/validate');

const complaintSchema = Joi.object({
  title: Joi.string().max(100).required(),
  description: Joi.string().max(2000).required()
});

// Student submits a complaint
router.post('/', verifyToken, validateBody(complaintSchema), async (req, res) => {
  try {
    const { title, description } = req.body;
    
    // Find if student belongs to a class
    const studentClass = await Class.findOne({ students: req.user.id });
    
    const complaint = new Complaint({
      title,
      description,
      studentId: req.user.id,
      classId: studentClass ? studentClass._id : null
    });
    
    await complaint.save();
    res.status(201).json(complaint);
  } catch (err) {
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
});

// Student fetches their complaints
router.get('/student/:studentId', verifyToken, async (req, res) => {
  try {
    // IDOR protection
    if (req.user.id !== req.params.studentId) {
       const user = await User.findById(req.user.id);
       if (!user || !['admin', 'sub admin', 'manager', 'mentor'].includes(user.role)) {
         return res.status(403).json({ error: 'Forbidden' });
       }
    }

    const complaints = await Complaint.find({ studentId: req.params.studentId }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Support Team fetches all complaints
router.get('/', verifyToken, requireStaff, async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('studentId', 'personalInfo.username email')
      .populate('classId', 'name year')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Resolve a complaint
router.put('/:id/resolve', verifyToken, requireStaff, async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, { status: 'resolved' }, { new: true });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
