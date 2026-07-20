const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const UserProgress = require('../models/UserProgress');
const DashboardData = require('../models/DashboardData');
const { defaultDashboardData, defaultUserProgress } = require('../utils/defaultData');

const admin = require('../firebaseAdmin');

const JWT_SECRET = process.env.JWT_SECRET;

// Strict email validation regex
const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

const { parseTokenIfExists } = require('../middleware/auth');

// Throttle auth requests to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', authLimiter, parseTokenIfExists, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Use Firebase email if verified token exists, else use body
    const userEmail = req.user ? req.user.email : email;

    if (!userEmail) {
      return res.status(400).json({ error: 'Please provide an email' });
    }

    if (!validateEmail(userEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if user already exists
    let user = await User.findOne({ email: userEmail });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user
    user = new User({ email: userEmail, password: password || 'firebase_auth' });

    if (!req.user && password) {
      // Hash password if not using Firebase
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    // Assign admin role if email is in the ADMIN_EMAILS environment variable
    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase()) : [];
    const isAdminEmail = adminEmails.includes(userEmail.toLowerCase());

    if (isAdminEmail) {
      if (req.user) {
        user.role = 'admin'; // Verified via Firebase
      } else {
        return res.status(403).json({ error: 'Administrator accounts must be registered using a verified SSO provider.' });
      }
    }

    // Set default username based on email
    user.personalInfo.username = userEmail.split('@')[0];

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await user.save({ session });
      await UserProgress.create([{ ...defaultUserProgress, userId: user.id }], { session });
      await DashboardData.create([{ ...defaultDashboardData, userId: user.id }], { session });
      await session.commitTransaction();
    } catch (transactionError) {
      await session.abortTransaction();
      throw transactionError; // will be caught by outer catch block
    } finally {
      session.endSession();
    }

    // Create token for local session
    const payload = { 
      user: { 
        id: user.id,
        tokenVersion: user.tokenVersion
      } 
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        username: user.personalInfo.username
      }
    });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user & get token
// @access  Public
router.post('/login', authLimiter, parseTokenIfExists, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const userEmail = req.user ? req.user.email : email;

    if (!userEmail) {
      return res.status(400).json({ error: 'Please provide an email' });
    }

    // Find user
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials. Please create an account.' });
    }

    // Validate password only if not authenticated via Firebase
    if (!req.user && password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
    }

    // Create token
    const payload = { 
      user: { 
        id: user.id,
        tokenVersion: user.tokenVersion
      } 
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        username: user.personalInfo.username
      }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user by incrementing token version
// @access  Private
router.post('/logout', verifyToken, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $inc: { tokenVersion: 1 } });
    res.json({ message: 'Successfully logged out across all devices.' });
  } catch (err) {
    console.error('Logout error:', err.message);
    res.status(500).json({ error: 'Server error during logout' });
  }
});

module.exports = router;
