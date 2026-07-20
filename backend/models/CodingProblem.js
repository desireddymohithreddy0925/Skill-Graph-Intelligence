const mongoose = require('mongoose');

const codingProblemSchema = new mongoose.Schema({
  title: { type: String, maxLength: 5000, required: true },
  url: { type: String, maxLength: 5000, required: true },
  platform: { 
    type: String, maxLength: 5000, 
    required: true,
    enum: ['LeetCode', 'CodeChef', 'Codeforces', 'HackerRank', 'AtCoder', 'Other'] 
  },
  difficulty: { 
    type: String, maxLength: 5000, 
    enum: ['Easy', 'Medium', 'Hard'], 
    default: 'Medium' 
  },
  targetClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CodingProblem', codingProblemSchema);
