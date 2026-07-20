const express = require('express');
const router = express.Router();
const Assessment = require('../models/Assessment');
const AssessmentSubmission = require('../models/AssessmentSubmission');
const User = require('../models/User');
const multer = require('multer');
const pdf = require('pdf-parse');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../middleware/auth');
const { requireStaff } = require('../middleware/roles');
const Joi = require('joi');
const { validateBody } = require('../middleware/validate');

const assessmentSchema = Joi.object({
  title: Joi.string().max(150).required(),
  description: Joi.string().max(2000).required(),
  type: Joi.string().valid('mcq', 'coding', 'mixed').required(),
  timeLimit: Joi.number().min(1).max(300).required(),
  questions: Joi.array().items(
    Joi.object({
      questionText: Joi.string().required(),
      options: Joi.array().items(Joi.string()).optional(),
      correctAnswer: Joi.string().required()
    })
  ).required(),
  targetClasses: Joi.array().items(Joi.string()).optional(),
  createdBy: Joi.string().required()
});

const upload = multer({ dest: 'uploads/' });

// Get all active assessments
router.get('/', verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Assessment.countDocuments({ isActive: true });
    const assessments = await Assessment.find({ isActive: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    // Remove correct answers from the list payload to prevent cheating via API inspection
    const sanitized = assessments.map(a => {
      const aObj = a.toObject();
      if (aObj.questions) {
        aObj.questions.forEach(q => delete q.correctAnswer);
      }
      return aObj;
    });
    res.json({ data: sanitized, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all assessments (Staff view) - includes correct answers
router.get('/admin', verifyToken, requireStaff, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Assessment.countDocuments();
    const assessments = await Assessment.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ data: assessments, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create an assessment (Staff only)
router.post('/', verifyToken, requireStaff, validateBody(assessmentSchema), async (req, res) => {
  try {
    const { title, description, type, timeLimit, questions, targetClasses, createdBy } = req.body;
    const assessment = new Assessment({ title, description, type, timeLimit, questions, targetClasses, createdBy });
    await assessment.save();
    res.status(201).json(assessment);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload and Parse PDF for Assessment Questions
router.post('/upload-pdf', verifyToken, requireStaff, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const dataBuffer = fs.readFileSync(req.file.path);
    const data = await pdf(dataBuffer);
    
    // Remove temp file
    fs.unlinkSync(req.file.path);

    const text = data.text;
    const questions = [];
    
    const questionBlocks = text.split(/(?=\n\d+\.\s)/).filter(b => b.trim().length > 0);
    
    questionBlocks.forEach(block => {
      const q = { questionText: '', options: [], correctAnswer: '' };
      
      const qMatch = block.match(/\d+\.\s([^\n]+)/);
      if (qMatch) q.questionText = qMatch[1].trim();

      const optRegex = /([A-D][\)\.])\s*([^\n]+)/gi;
      let optMatch;
      while ((optMatch = optRegex.exec(block)) !== null) {
        q.options.push(optMatch[2].trim());
      }

      const ansMatch = block.match(/Answer:\s*([A-D])/i);
      if (ansMatch && ansMatch[1] && q.options.length >= 4) {
        const index = ansMatch[1].toUpperCase().charCodeAt(0) - 65; 
        if (q.options[index]) {
          q.correctAnswer = q.options[index];
        }
      }

      if (q.questionText && q.options.length > 0) {
        while (q.options.length < 4) q.options.push('');
        questions.push(q);
      }
    });

    res.json({ questions });
  } catch (err) {
    console.error('PDF Parse Error:', err);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Failed to parse PDF' });
  }
});

// Get specific assessment details (for taking it)
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) return res.status(404).json({ error: 'Not found' });
    
    // Remove correct answer
    const aObj = assessment.toObject();
    aObj.questions.forEach(q => delete q.correctAnswer);
    
    const assessmentToken = jwt.sign(
      { assessmentId: req.params.id, studentId: req.user.id, startTime: Date.now() },
      process.env.JWT_SECRET || 'fallback-secret-key-for-dev',
      { expiresIn: '24h' }
    );
    
    res.json({ ...aObj, _at: assessmentToken });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit an assessment
router.post('/:id/submit', verifyToken, async (req, res) => {
  try {
    // We expect _vId and _at to obfuscate the frontend payload
    const { studentId, answers, _vId, autoSubmitted, _at } = req.body;
    const tabSwitches = _vId || 0;
    
    // IDOR protection
    if (studentId !== req.user.id) {
       return res.status(403).json({ error: 'Forbidden: Cannot submit for another user' });
    }
    
    // Anomaly detection using the assessment token
    if (!_at) {
      return res.status(400).json({ error: 'Missing assessment session token' });
    }
    
    let decodedAt;
    try {
      decodedAt = jwt.verify(_at, process.env.JWT_SECRET || 'fallback-secret-key-for-dev');
    } catch (e) {
      return res.status(400).json({ error: 'Invalid or expired assessment session' });
    }
    
    if (decodedAt.assessmentId !== req.params.id || decodedAt.studentId !== req.user.id) {
      return res.status(400).json({ error: 'Assessment session mismatch' });
    }
    
    const timeTakenMs = Date.now() - decodedAt.startTime;
    
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

    let score = 0;
    
    // Calculate score
    answers.forEach(ans => {
      const question = assessment.questions[ans.questionIndex];
      if (question && question.correctAnswer === ans.selectedOption) {
        score += 1;
      }
    });

    // Check for "perfect score in 2 seconds" anomaly (less than 10 seconds for > 2 questions)
    if (assessment.questions.length > 2 && timeTakenMs < 10000 && score === assessment.questions.length) {
       return res.status(400).json({ error: 'Anomaly detected: Assessment completed impossibly fast.' });
    }

    const submission = new AssessmentSubmission({
      assessmentId: assessment._id,
      studentId: req.user.id,
      answers,
      score,
      totalQuestions: assessment.questions.length,
      tabSwitches,
      autoSubmitted
    });

    await submission.save();

    res.status(201).json({ success: true, score, totalQuestions: assessment.questions.length, submission });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get class-wise leaderboard for an assessment
router.get('/:id/leaderboard', verifyToken, async (req, res) => {
  try {
    const { classId } = req.query;
    const filter = { assessmentId: req.params.id };
    
    const submissions = await AssessmentSubmission.find(filter)
      .populate('studentId', 'personalInfo.username email classId')
      .lean();

    let leaderboard = submissions.map(sub => ({
      userId: sub.studentId?._id,
      name: sub.studentId?.personalInfo?.username || 'Unknown',
      email: sub.studentId?.email || 'Unknown',
      classId: sub.studentId?.classId,
      score: sub.score,
      totalQuestions: sub.totalQuestions,
      submittedAt: sub.submittedAt
    }));

    if (classId) {
      leaderboard = leaderboard.filter(l => l.classId && l.classId.toString() === classId);
    }

    leaderboard.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(a.submittedAt) - new Date(b.submittedAt);
    });

    leaderboard = leaderboard.map((l, index) => ({ ...l, rank: index + 1 }));

    res.json(leaderboard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
