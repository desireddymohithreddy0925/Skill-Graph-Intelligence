const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// @route   GET /api/projects
// @desc    Get all projects (for admin) or projects for a specific user
// @access  Public (mocking auth with query params for simplicity)
router.get('/', async (req, res) => {
  try {
    const { email, role } = req.query;
    
    let projects;
    if (['admin', 'sub admin', 'manager'].includes(role)) {
      // Admin sees all projects
      projects = await Project.find().sort({ createdAt: -1 });
    } else if (email) {
      // Student sees only their projects
      projects = await Project.find({ userEmail: email }).sort({ createdAt: -1 });
    } else {
      return res.status(400).json({ error: 'Please provide email and role' });
    }
    
    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/projects
// @desc    Add a new project
// @access  Public (mocking auth)
router.post('/', async (req, res) => {
  try {
    const { userEmail, projectName, studentName, rollNumber, githubLink, onedriveLink } = req.body;
    
    if (!userEmail || !projectName || !githubLink || !onedriveLink) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }
    
    const newProject = new Project({
      userEmail,
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
// @access  Public (mocking auth)
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
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
