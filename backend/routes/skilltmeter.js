const express = require('express');
const router = express.Router();
const Presentation = require('../models/Presentation');
const { verifyToken } = require('../middleware/auth');
const { requireStaff } = require('../middleware/roles');

const generateCode = async () => {
  let code;
  let exists = true;
  while (exists) {
    code = Math.floor(100000 + Math.random() * 900000).toString();
    const presentation = await Presentation.findOne({ joinCode: code });
    if (!presentation) {
      exists = false;
    }
  }
  return code;
};

router.post('/presentations', verifyToken, requireStaff, async (req, res) => {
  try {
    const { title, slides } = req.body;
    const joinCode = await generateCode();
    
    const newPresentation = new Presentation({
      title,
      createdBy: req.user.id,
      joinCode,
      slides,
      responses: { polls: [], wordCloud: [], qa: [] }
    });

    await newPresentation.save();
    res.status(201).json(newPresentation);
  } catch (error) {
    console.error('Error creating presentation:', error);
    res.status(500).json({ error: 'Server error creating presentation' });
  }
});

router.get('/presentations/user/:userId', verifyToken, requireStaff, async (req, res) => {
  try {
    if (req.user.id !== req.params.userId) {
       return res.status(403).json({ error: 'Forbidden' });
    }
    const presentations = await Presentation.find({ createdBy: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(presentations);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/join/:code', verifyToken, async (req, res) => {
  try {
    const presentation = await Presentation.findOne({ joinCode: req.params.code, isActive: true });
    if (!presentation) {
      return res.status(404).json({ error: 'Presentation not found or inactive' });
    }
    const currentSlide = presentation.slides[presentation.currentSlideIndex];
    res.status(200).json({
      title: presentation.title,
      joinCode: presentation.joinCode,
      currentSlideIndex: presentation.currentSlideIndex,
      currentSlide,
      qa: presentation.responses.qa
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/presentations/:id', verifyToken, requireStaff, async (req, res) => {
  try {
    const presentation = await Presentation.findById(req.params.id);
    if (!presentation) {
      return res.status(404).json({ error: 'Presentation not found' });
    }
    res.status(200).json(presentation);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/presentations/:id', verifyToken, requireStaff, async (req, res) => {
  try {
    const { title, slides } = req.body;
    const presentation = await Presentation.findById(req.params.id);
    if (!presentation) {
      return res.status(404).json({ error: 'Presentation not found' });
    }
    
    if (presentation.createdBy.toString() !== req.user.id) {
       return res.status(403).json({ error: 'Forbidden' });
    }
    
    presentation.title = title;
    presentation.slides = slides;
    await presentation.save();
    
    res.status(200).json(presentation);
  } catch (error) {
    res.status(500).json({ error: 'Server error editing presentation' });
  }
});

router.delete('/presentations/:id', verifyToken, requireStaff, async (req, res) => {
  try {
    const presentation = await Presentation.findById(req.params.id);
    if (!presentation) {
      return res.status(404).json({ error: 'Presentation not found' });
    }
    if (presentation.createdBy.toString() !== req.user.id) {
       return res.status(403).json({ error: 'Forbidden' });
    }
    await presentation.deleteOne();
    res.status(200).json({ message: 'Presentation deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error deleting presentation' });
  }
});

router.put('/presentations/:id/slide', verifyToken, requireStaff, async (req, res) => {
  try {
    const { slideIndex } = req.body;
    const presentation = await Presentation.findById(req.params.id);
    if (!presentation) return res.status(404).json({ error: 'Not found' });
    
    presentation.currentSlideIndex = slideIndex;
    presentation.slideStartTime = new Date(); // Start timer
    await presentation.save();
    
    if (req.io) {
      req.io.to(presentation.joinCode).emit('slideChanged', { 
        currentSlideIndex: slideIndex,
        currentSlide: presentation.slides[slideIndex],
        slideStartTime: presentation.slideStartTime
      });
    }

    res.status(200).json(presentation);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/presentations/:joinCode/submit', verifyToken, async (req, res) => {
  try {
    const { joinCode } = req.params;
    const { type, slideIndex, payload } = req.body;
    const userId = req.user.id;

    const presentation = await Presentation.findOne({ joinCode });
    if (!presentation) return res.status(404).json({ error: 'Not found' });

    const slide = presentation.slides[slideIndex];
    let pointsEarned = 0;
    const timeTakenMs = presentation.slideStartTime ? (new Date() - presentation.slideStartTime) : 0;

    if (type === 'poll') {
      if (slide.correctOptionIndex === -1 || slide.correctOptionIndex === payload.optionIndex) {
        pointsEarned = Math.max(10, Math.floor(1000 - (timeTakenMs / 30)));
      }

      const existingResponse = presentation.responses.polls.find(
        p => p.slideIndex === slideIndex && p.optionIndex === payload.optionIndex
      );
      if (existingResponse) {
        existingResponse.count += 1;
      } else {
        presentation.responses.polls.push({ slideIndex, optionIndex: payload.optionIndex, count: 1, userId, timeTakenMs, pointsEarned });
      }
      
      if (existingResponse && userId) {
         presentation.responses.polls.push({ slideIndex, optionIndex: payload.optionIndex, count: 0, userId, timeTakenMs, pointsEarned });
      }
    } else if (type === 'wordcloud') {
      pointsEarned = 100;
      const word = payload.word.trim().toLowerCase();
      const existingResponse = presentation.responses.wordCloud.find(
        w => w.slideIndex === slideIndex && w.word === word
      );
      if (existingResponse) {
        existingResponse.count += 1;
      } else {
        presentation.responses.wordCloud.push({ slideIndex, word, count: 1, userId, pointsEarned });
      }
      if (existingResponse && userId) {
         presentation.responses.wordCloud.push({ slideIndex, word, count: 0, userId, pointsEarned });
      }
    }

    await presentation.save();

    if (req.io) {
      req.io.to(joinCode).emit('newResponse', presentation.responses);
    }

    res.status(200).json({ success: true, pointsEarned });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/presentations/:joinCode/qa', verifyToken, async (req, res) => {
  try {
    const { joinCode } = req.params;
    const { questionText, author, slideIndex } = req.body;

    const presentation = await Presentation.findOne({ joinCode });
    if (!presentation) return res.status(404).json({ error: 'Not found' });

    const newQa = {
      slideIndex,
      questionText,
      author: author || 'Anonymous',
      upvotes: 0,
      isAnswered: false,
      createdAt: new Date()
    };
    presentation.responses.qa.push(newQa);
    await presentation.save();

    if (req.io) {
      req.io.to(joinCode).emit('newQa', presentation.responses.qa);
    }

    res.status(200).json(presentation.responses.qa);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/presentations/:joinCode/qa/:qaId/upvote', verifyToken, async (req, res) => {
  try {
    const { joinCode, qaId } = req.params;
    const presentation = await Presentation.findOne({ joinCode });
    if (!presentation) return res.status(404).json({ error: 'Not found' });

    const qa = presentation.responses.qa.id(qaId);
    if (qa) {
      if (!qa.upvotedBy.includes(req.user.id)) {
        qa.upvotes += 1;
        qa.upvotedBy.push(req.user.id);
        await presentation.save();
        
        if (req.io) {
          req.io.to(joinCode).emit('qaUpdated', presentation.responses.qa);
        }
      } else {
        return res.status(400).json({ error: 'You have already upvoted this question' });
      }
    }
    
    res.status(200).json(presentation.responses.qa);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/presentations/:joinCode/qa/:qaId/answer', verifyToken, requireStaff, async (req, res) => {
  try {
    const { joinCode, qaId } = req.params;
    const presentation = await Presentation.findOne({ joinCode });
    if (!presentation) return res.status(404).json({ error: 'Not found' });

    const qa = presentation.responses.qa.id(qaId);
    if (qa) {
      qa.isAnswered = true;
      await presentation.save();
      
      if (req.io) {
        req.io.to(joinCode).emit('qaUpdated', presentation.responses.qa);
      }
    }
    
    res.status(200).json(presentation.responses.qa);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/presentations/:id/end', verifyToken, requireStaff, async (req, res) => {
  try {
    const presentation = await Presentation.findById(req.params.id);
    if (!presentation || !presentation.isActive) return res.status(400).json({ error: 'Presentation already ended' });

    presentation.isActive = false;
    await presentation.save();

    const User = require('../models/User');
    const { updateStreak } = require('../utils/streakManager');
    
    const userPoints = {}; 
    const addToUser = (uId, pts) => {
      if (uId) {
        const idStr = uId.toString();
        userPoints[idStr] = (userPoints[idStr] || 0) + pts;
      }
    };

    presentation.responses.polls.forEach(p => addToUser(p.userId, p.pointsEarned));
    presentation.responses.wordCloud.forEach(w => addToUser(w.userId, w.pointsEarned));

    for (const [userId, pts] of Object.entries(userPoints)) {
      if (pts > 0) {
        await User.findByIdAndUpdate(userId, { $inc: { xp: pts } });
        await updateStreak(userId); 
      }
    }

    if (req.io) {
       req.io.to(presentation.joinCode).emit('presentationEnded');
    }

    res.status(200).json({ message: 'Ended successfully and points distributed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error ending presentation' });
  }
});

router.get('/presentations/:id/leaderboard', verifyToken, requireStaff, async (req, res) => {
  try {
    const presentation = await Presentation.findById(req.params.id);
    if (!presentation) return res.status(404).json({ error: 'Presentation not found' });

    const User = require('../models/User');
    const userPoints = {}; 

    const addToUser = (uId, pts) => {
      if (uId) {
        const idStr = uId.toString();
        userPoints[idStr] = (userPoints[idStr] || 0) + pts;
      }
    };

    presentation.responses.polls.forEach(p => addToUser(p.userId, p.pointsEarned));
    presentation.responses.wordCloud.forEach(w => addToUser(w.userId, w.pointsEarned));

    const leaderboard = [];
    for (const [userId, pts] of Object.entries(userPoints)) {
      if (pts > 0) {
        const user = await User.findById(userId).select('personalInfo.username email');
        leaderboard.push({
          userId,
          name: user?.personalInfo?.username || user?.email || 'Unknown',
          score: pts
        });
      }
    }

    leaderboard.sort((a, b) => b.score - a.score);

    res.status(200).json(leaderboard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching leaderboard' });
  }
});

module.exports = router;
