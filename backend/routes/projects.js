const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

// @route   GET /api/projects
// @desc    Get all projects (for admin) or projects for a specific user
// @access  Private
router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    let projects;
    if (['admin', 'sub admin', 'manager', 'mentor'].includes(user.role)) {
      // Staff sees all projects
      projects = await Project.find().sort({ createdAt: -1 });
    } else {
      // Student sees only their projects
      projects = await Project.find({ userEmail: req.user.email }).sort({ createdAt: -1 });
    }
    
    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/projects
// @desc    Add a new project
// @access  Private
router.post('/', verifyToken, async (req, res) => {
  try {
    const { projectName, studentName, rollNumber, githubLink, onedriveLink } = req.body;
    
    if (!projectName || !githubLink || !onedriveLink) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }
    
    const newProject = new Project({
      userEmail: req.user.email,
      projectName,
      studentName,
      rollNumber,
      githubLink,
      onedriveLink
    });
    
    const project = await newProject.save();
    res.json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete a project
// @access  Private
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const user = await User.findById(req.user.id);
    // Allow deletion only if the user owns it, or if they are staff
    if (project.userEmail !== req.user.email && !['admin', 'sub admin', 'manager', 'mentor'].includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden: Cannot delete other projects' });
    }
    
    await project.deleteOne();
    res.json({ message: 'Project removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
