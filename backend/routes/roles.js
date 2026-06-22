const express = require('express');
const router = express.Router();
const Role = require('../models/Role');
const User = require('../models/User');

// Get all dynamic roles
router.get('/', async (req, res) => {
  try {
    const roles = await Role.find().sort({ createdAt: -1 });
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new dynamic role
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    const role = new Role({ name: name.toLowerCase(), description });
    await role.save();
    res.status(201).json(role);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'Role already exists' });
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a dynamic role
router.delete('/:id', async (req, res) => {
  try {
    await Role.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Assign a role to a user by email
router.put('/assign', async (req, res) => {
  try {
    const { email, roleName } = req.body;
    
    // Convert roleName to lowercase to match typical role strings
    const roleToAssign = roleName.toLowerCase();
    
    // Make sure role exists (either dynamic or core 'admin' / 'mentor')
    const dynamicRole = await Role.findOne({ name: roleToAssign });
    if (!dynamicRole && !['admin', 'mentor', 'student'].includes(roleToAssign)) {
      return res.status(404).json({ error: 'Role not found' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.role = roleToAssign;
    await user.save();
    
    res.json({ success: true, message: `Assigned role ${roleToAssign} to ${email}`, user: { email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
