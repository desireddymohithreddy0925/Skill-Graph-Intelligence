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
const sendEmail = require('../utils/sendEmail');

// Strict email validation regex
const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

const { parseTokenIfExists, verifyToken } = require('../middleware/auth');

// Throttle auth requests to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 100, // 100 requests per IP for local dev
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
      const salt = await bcrypt.genSalt(12);
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

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      message: 'User registered successfully',
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
    const { email: rawEmail, password } = req.body;
    const userEmail = rawEmail ? rawEmail.toLowerCase().trim() : (req.user ? req.user.email : undefined);
    console.log(`[LOGIN ATTEMPT] Email: ${userEmail}, HasPassword: ${!!password}, HasReqUser: ${!!req.user}`);
    
    // Validate request
    if (!userEmail || (!password && !req.user)) {
      console.log(`[LOGIN FAILED] Missing credentials for ${userEmail}`);
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Find user
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      console.log(`[LOGIN FAILED] User not found: ${userEmail}`);
      return res.status(400).json({ error: 'Invalid credentials. Please create an account.' });
    }

    // Validate password only if not authenticated via Firebase
    if (!req.user && password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log(`[LOGIN FAILED] Invalid password for: ${userEmail}`);
        return res.status(400).json({ error: 'Invalid credentials' });
      }
    }

    // Generate JWT (ensure JWT_SECRET is available)
    if (!process.env.JWT_SECRET) {
      console.error('[LOGIN CRITICAL] JWT_SECRET is not set in environment variables');
      return res.status(500).json({ error: 'Server configuration error: JWT_SECRET missing' });
    };

    const payload = { 
      user: { 
        id: user.id,
        tokenVersion: user.tokenVersion
      } 
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    console.log(`[LOGIN SUCCESS] Sending response for ${userEmail}`);
    res.status(200).json({
      message: 'Logged in successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        username: user.personalInfo.username
      }
    });
  } catch (err) {
    console.error('[LOGIN ERROR] Server error during login:', err.message);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user by incrementing token version
// @access  Private
router.post('/logout', verifyToken, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $inc: { tokenVersion: 1 } });
    res.clearCookie('token');
    res.json({ message: 'Successfully logged out across all devices.' });
  } catch (err) {
    console.error('Logout error:', err.message);
    res.status(500).json({ error: 'Server error during logout' });
  }
});
// @route   POST /api/auth/forgot-password
// @desc    Send OTP for password reset
// @access  Public
router.post('/forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Please provide an email' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'No account found with that email' });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save to user
    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    // Send email
    const message = `You requested a password reset. Your OTP is: ${otp}. It will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.`;
    await sendEmail({
      email: user.email,
      subject: 'Skill Graph Intelligence - Password Reset OTP',
      message
    });

    res.status(200).json({ message: 'OTP sent to email successfully' });
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ error: 'Failed to send reset email' });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password using OTP
// @access  Public
router.post('/reset-password', authLimiter, async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    console.log(`[RESET PASSWORD ATTEMPT] Email: ${email}, OTP: ${otp}`);
    
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Please provide email, OTP, and new password' });
    }

    const user = await User.findOne({
      email,
      resetPasswordOtp: otp,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Clear OTP fields and update tokenVersion to log out other devices
    user.resetPasswordOtp = null;
    user.resetPasswordExpires = null;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    console.log(`[RESET PASSWORD SUCCESS] Password reset for ${user.email}`);
    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(500).json({ error: 'Server error during password reset' });
  }
});

module.exports = router;
