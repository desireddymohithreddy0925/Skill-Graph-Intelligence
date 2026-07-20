const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');
const { requireStaff } = require('../middleware/roles');

// @route   GET /api/profile/all
// @desc    Get all users (for Admin/Mentor dashboard) - Excludes Admins to keep them anonymous
router.get('/all', verifyToken, requireStaff, async (req, res) => {
  try {
    const users = await User.find({ role: { $nin: ['admin', 'sub admin', 'manager'] } }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('Fetch all users error:', err);
    res.status(500).json({ error: 'Server error fetching all users' });
  }
});

// @route   GET /api/profile/search
// @desc    Admin search for users
// @access  Private
router.get('/search', verifyToken, requireStaff, async (req, res) => {
  try {
    const { query } = req.query;
    
    // Find users where username or rollNumber matches the query (case insensitive)
    const users = await User.find({
      role: 'student',
      $or: [
        { 'personalInfo.username': { $regex: query, $options: 'i' } },
        { 'personalInfo.rollNumber': { $regex: query, $options: 'i' } }
      ]
    }).select('-password'); // Don't return passwords
    
    res.json(users);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Server error during search' });
  }
});

// @route   GET /api/profile/:email
// @desc    Get user profile by email
// @access  Private
router.get('/:email', verifyToken, async (req, res) => {
  try {
    // IDOR protection: only allow users to fetch their own profile, or staff can fetch any
    if (req.user.email !== req.params.email) {
      const userReq = await User.findById(req.user.id);
      if (!userReq || !['admin', 'sub admin', 'manager', 'mentor'].includes(userReq.role)) {
        return res.status(403).json({ error: 'Forbidden: Cannot access other profiles' });
      }
    }
    
    const user = await User.findOne({ email: req.params.email }).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

// @route   PUT /api/profile/:email
// @desc    Update user profile
// @access  Private
router.put('/:email', verifyToken, async (req, res) => {
  try {
    if (req.user.email !== req.params.email) {
      return res.status(403).json({ error: 'Forbidden: Cannot modify other profiles' });
    }

    const { section, data } = req.body;
    // section should be 'personalInfo', 'socialProfile', or 'codingProfiles'
    
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (section === 'personalInfo') {
      if (data.email && data.email !== user.email) {
        // Check if new email is already in use
        const existing = await User.findOne({ email: data.email });
        if (existing) {
          return res.status(400).json({ error: 'Email already in use' });
        }
        user.email = data.email;
      }
      user.personalInfo = { ...user.personalInfo, ...data };
    } else if (section === 'socialProfile') {
      user.socialProfile = { ...user.socialProfile, ...data };
    } else if (section === 'codingProfiles') {
      user.codingProfiles = { ...user.codingProfiles, ...data };
    }

    await user.save();
    
    res.json(user);
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

module.exports = router;
