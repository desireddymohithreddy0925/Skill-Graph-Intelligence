const express = require('express');
const router = express.Router();
const Assessment = require('../models/Assessment');
const AssessmentSubmission = require('../models/AssessmentSubmission');
const User = require('../models/User');
const multer = require('multer');
const pdf = require('pdf-parse');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

// Get all active assessments
router.get('/', async (req, res) => {
  try {
    // If the request includes a role or staff indicator, we might return all.
    // For now, return all active ones
    const assessments = await Assessment.find({ isActive: true }).sort({ createdAt: -1 });
    // Remove correct answers from the list payload to prevent cheating via API inspection
    const sanitized = assessments.map(a => {
      const aObj = a.toObject();
      if (aObj.questions) {
        aObj.questions.forEach(q => delete q.correctAnswer);
      }
      return aObj;
    });
    res.json(sanitized);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all assessments (Staff view) - includes correct answers
router.get('/admin', async (req, res) => {
  try {
    const assessments = await Assessment.find().sort({ createdAt: -1 });
    res.json(assessments);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create an assessment (Staff only)
router.post('/', async (req, res) => {
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
router.post('/upload-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const dataBuffer = fs.readFileSync(req.file.path);
    const data = await pdf(dataBuffer);
    
    // Remove temp file
    fs.unlinkSync(req.file.path);

    const text = data.text;
    const questions = [];
    
    // Regex logic to parse text
    // Expected format:
    // 1. Question Text
    // A) Option 1
    // B) Option 2
    // C) Option 3
    // D) Option 4
    // Answer: A
    
    // Split by numbers followed by a dot (e.g. "1. ", "2. ")
    const questionBlocks = text.split(/(?=\n\d+\.\s)/).filter(b => b.trim().length > 0);
    
    questionBlocks.forEach(block => {
      const q = { questionText: '', options: [], correctAnswer: '' };
      
      // Extract Question Text
      const qMatch = block.match(/\d+\.\s([^\n]+)/);
      if (qMatch) q.questionText = qMatch[1].trim();

      // Extract Options (A), B), C), D)) or (a., b., c., d.)
      const optRegex = /([A-D][\)\.])\s*([^\n]+)/gi;
      let optMatch;
      while ((optMatch = optRegex.exec(block)) !== null) {
        q.options.push(optMatch[2].trim());
      }

      // Extract Correct Answer
      const ansMatch = block.match(/Answer:\s*([A-D])/i);
      if (ansMatch && ansMatch[1] && q.options.length >= 4) {
        const index = ansMatch[1].toUpperCase().charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
        if (q.options[index]) {
          q.correctAnswer = q.options[index];
        }
      }

      if (q.questionText && q.options.length > 0) {
        // Pad options to 4 if fewer than 4
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
router.get('/:id', async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) return res.status(404).json({ error: 'Not found' });
    
    // Remove correct answer
    const aObj = assessment.toObject();
    aObj.questions.forEach(q => delete q.correctAnswer);
    
    res.json(aObj);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit an assessment
router.post('/:id/submit', async (req, res) => {
  try {
    const { studentId, answers, tabSwitches, autoSubmitted } = req.body;
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

    const submission = new AssessmentSubmission({
      assessmentId: assessment._id,
      studentId,
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
router.get('/:id/leaderboard', async (req, res) => {
  try {
    const { classId } = req.query;
    const filter = { assessmentId: req.params.id };
    
    // Find submissions
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

    // Filter by classId if provided
    if (classId) {
      leaderboard = leaderboard.filter(l => l.classId && l.classId.toString() === classId);
    }

    // Sort by score descending, then by submittedAt ascending
    leaderboard.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(a.submittedAt) - new Date(b.submittedAt);
    });

    // Assign ranks
    leaderboard = leaderboard.map((l, index) => ({ ...l, rank: index + 1 }));

    res.json(leaderboard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
