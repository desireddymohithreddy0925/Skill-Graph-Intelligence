const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const Class = require('../models/Class');

// Student submits a complaint
router.post('/', async (req, res) => {
  try {
    const { title, description, studentId } = req.body;
    
    // Find if student belongs to a class
    const studentClass = await Class.findOne({ students: studentId });
    
    const complaint = new Complaint({
      title,
      description,
      studentId,
      classId: studentClass ? studentClass._id : null
    });
    
    await complaint.save();
    res.status(201).json(complaint);
  } catch (err) {
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
});

// Student fetches their complaints
router.get('/student/:studentId', async (req, res) => {
  try {
    const complaints = await Complaint.find({ studentId: req.params.studentId }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Support Team fetches all complaints
router.get('/', async (req, res) => {
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
router.put('/:id/resolve', async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, { status: 'resolved' }, { new: true });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
