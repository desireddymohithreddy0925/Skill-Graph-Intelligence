const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const User = require('../models/User');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const upload = multer({ dest: 'uploads/' });

// GET all classes
router.get('/', async (req, res) => {
  try {
    const classes = await Class.find().populate('mentors', 'email personalInfo.username');
    // We also want to return student count for each class
    const classesWithCounts = await Promise.all(classes.map(async (c) => {
      const studentCount = await User.countDocuments({ classId: c._id });
      return { ...c.toObject(), studentCount };
    }));
    res.json(classesWithCounts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// CREATE class
router.post('/', async (req, res) => {
  try {
    const { name, year } = req.body;
    const newClass = new Class({ name, year });
    await newClass.save();
    res.status(201).json(newClass);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// UPDATE class (name/year)
router.put('/:id', async (req, res) => {
  try {
    const { name, year } = req.body;
    const updatedClass = await Class.findByIdAndUpdate(req.params.id, { name, year }, { new: true });
    res.json(updatedClass);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE class
router.delete('/:id', async (req, res) => {
  try {
    // Unassign class from all users
    await User.updateMany({ classId: req.params.id }, { classId: null });
    await Class.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ASSIGN Mentors
router.put('/:id/mentors', async (req, res) => {
  try {
    const { mentorIds } = req.body; // array of User ObjectIds
    const updatedClass = await Class.findByIdAndUpdate(req.params.id, { mentors: mentorIds }, { new: true });
    res.json(updatedClass);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET students in class
router.get('/:id/students', async (req, res) => {
  try {
    const students = await User.find({ classId: req.params.id });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// UPLOAD CSV and assign students to class
router.post('/:id/upload-csv', upload.single('file'), async (req, res) => {
  try {
    const classId = req.params.id;
    const results = [];
    
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        // Expected CSV headers: email, username
        for (const row of results) {
          const email = row.email ? row.email.trim().toLowerCase() : null;
          const username = row.username ? row.username.trim() : 'Student';
          
          if (!email) continue; // skip invalid rows

          let user = await User.findOne({ email });
          if (!user) {
            // Create new user
            const hashedPassword = await bcrypt.hash('password123', 10);
            user = new User({
              email,
              password: hashedPassword,
              role: 'student',
              personalInfo: { username }
            });
          }
          
          // Assign to class
          user.classId = classId;
          await user.save();
        }
        
        // Remove temp file
        fs.unlinkSync(req.file.path);
        
        res.json({ message: 'Students uploaded and assigned successfully!' });
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error processing file' });
  }
});

// ADD student manually to class
router.post('/:id/add-student-manual', async (req, res) => {
  try {
    const classId = req.params.id;
    const { email, username } = req.body;
    
    if (!email) return res.status(400).json({ error: 'Email is required' });
    
    const formattedEmail = email.trim().toLowerCase();
    const formattedUsername = username ? username.trim() : 'Student';
    
    let user = await User.findOne({ email: formattedEmail });
    if (!user) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      user = new User({
        email: formattedEmail,
        password: hashedPassword,
        role: 'student',
        personalInfo: { username: formattedUsername }
      });
    }
    
    user.classId = classId;
    await user.save();
    
    res.json({ message: 'Student added successfully!', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
