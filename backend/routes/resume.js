const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const Joi = require('joi');
const { validateBody } = require('../middleware/validate');

const resumeAnalysisSchema = Joi.object({
  pastFileName: Joi.string().max(200).required(),
  presentFileName: Joi.string().max(200).required()
});

// @route   POST /api/resume/analyze
// @desc    Mock endpoint to analyze resumes and give suggestions
router.post('/analyze', verifyToken, validateBody(resumeAnalysisSchema), async (req, res) => {
  try {
    const { pastFileName, presentFileName } = req.body;

    const analysis = {
      changes: [
        "Update the objective statement to be more targeted towards your dream company's requirements.",
        "Reformat the experience section to highlight quantifiable achievements (e.g., 'Improved performance by 20% instead of 'Worked on performance').",
        "Remove outdated high school details to save space for recent technical projects.",
        "Ensure action verbs are used consistently across all bullet points."
      ],
      additions: [
        "Add the 'System Design' and 'Advanced Data Structures' skills you recently acquired.",
        "Include your latest 'E-Commerce Backend' project and link to the source code.",
        "Add a direct link to your active GitHub and LinkedIn profiles in the header.",
        "Consider adding a short 'Certifications' section for your recent achievements."
      ]
    };

    setTimeout(() => {
      res.status(200).json({ 
        message: 'Analysis complete',
        analysis 
      });
    }, 1500);

  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

module.exports = router;
