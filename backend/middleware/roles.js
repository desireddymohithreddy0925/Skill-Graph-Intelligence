const User = require('../models/User');

const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
       return res.status(401).json({ error: 'Authorization denied' });
    }
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Server error verifying role' });
  }
};

const requireStaff = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
       return res.status(401).json({ error: 'Authorization denied' });
    }
    const user = await User.findById(req.user.id);
    const staffRoles = ['admin', 'sub admin', 'manager', 'mentor'];
    if (!user || !staffRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Access denied. Staff role required.' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Server error verifying role' });
  }
};

module.exports = { requireAdmin, requireStaff };
