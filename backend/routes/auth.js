const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const admin = require('../firebaseAdmin');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-dev';

// Strict email validation regex
const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

// Middleware to verify Firebase Token
const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const idToken = authHeader.split('Bearer ')[1];
    try {
      if (admin) {
        const decodedToken = await admin.verifyIdToken(idToken);
        req.user = decodedToken;
        return next();
      }
    } catch (error) {
      console.error('Firebase token verification error:', error);
      // Fall through to traditional auth if token is invalid or admin not init
    }
  }
  next();
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', verifyFirebaseToken, async (req, res) => {
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

    // Hardcode admin logic based on user request
    if (userEmail === 'mohith09250217@gmail.com') {
      user.role = 'admin';
    }

    // Set default username based on email
    user.personalInfo.username = userEmail.split('@')[0];

    await user.save();

    // Create token for local session
    const payload = { user: { id: user.id } };
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
router.post('/login', verifyFirebaseToken, async (req, res) => {
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
    const payload = { user: { id: user.id } };
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

module.exports = router;
