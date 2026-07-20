const mongoose = require('mongoose');

const presentationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  joinCode: { type: String, required: true, unique: true }, // 6-digit code
  isActive: { type: Boolean, default: true },
  currentSlideIndex: { type: Number, default: 0 },
  slideStartTime: { type: Date, default: null }, // Track when slide was shown
  slides: [{
    type: { type: String, enum: ['poll', 'wordcloud', 'qa'], required: true },
    question: { type: String, required: true },
    options: [{ type: String }], // For polls
    allowMultipleVotes: { type: Boolean, default: false }, // For wordcloud and polls
    timeLimit: { type: Number, default: 30 }, // Seconds
    correctOptionIndex: { type: Number, default: -1 }, // -1 means no correct answer
  }],
  // Store responses embedded or as separate refs. Embedded is easier for real-time.
  responses: {
    polls: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional for anonymous
      slideIndex: Number,
      optionIndex: Number,
      count: { type: Number, default: 0 },
      timeTakenMs: { type: Number, default: 0 },
      pointsEarned: { type: Number, default: 0 }
    }],
    wordCloud: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      slideIndex: Number,
      word: String,
      count: { type: Number, default: 0 },
      pointsEarned: { type: Number, default: 0 }
    }],
    qa: [{
      slideIndex: Number,
      questionText: String,
      author: { type: String, default: 'Anonymous' },
      upvotes: { type: Number, default: 0 },
      upvotedBy: [{ type: String }],
      isAnswered: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }]
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Presentation', presentationSchema);
