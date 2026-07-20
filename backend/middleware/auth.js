const jwt = require('jsonwebtoken');
const admin = require('../firebaseAdmin');
const User = require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    // Try to verify as standard JWT
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Enforce Token Versioning
    if (decoded.user && decoded.user.id) {
      const dbUser = await User.findById(decoded.user.id).select('tokenVersion');
      if (!dbUser || dbUser.tokenVersion !== decoded.user.tokenVersion) {
        return res.status(401).json({ error: 'Token has been revoked or expired' });
      }
    }
    
    req.user = decoded.user;
    return next();
  } catch (err) {
    // If standard JWT fails, try Firebase token
    try {
      if (admin) {
        const decodedToken = await admin.verifyIdToken(token);
        // Map Firebase uid to id for compatibility across routes
        req.user = { id: decodedToken.uid, email: decodedToken.email };
        return next();
      }
    } catch (firebaseErr) {
      console.error('Token verification failed (JWT & Firebase):', firebaseErr.message);
      return res.status(401).json({ error: 'Token is not valid' });
    }
  }
  
  return res.status(401).json({ error: 'Token verification failed' });
};

// Also export a non-strict version for Login/Register routes where we just want to parse the token if it exists
const parseTokenIfExists = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1];
    try {
      if (admin) {
        const decodedToken = await admin.verifyIdToken(token);
        req.user = { id: decodedToken.uid, email: decodedToken.email };
      }
    } catch (error) {
      // Ignore errors for optional parsing
    }
  }
  next();
};

module.exports = { verifyToken, parseTokenIfExists };
