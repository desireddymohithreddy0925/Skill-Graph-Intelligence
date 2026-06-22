const mongoose = require('mongoose');

const codingProblemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  platform: { 
    type: String, 
    required: true,
    enum: ['LeetCode', 'CodeChef', 'Codeforces', 'HackerRank', 'AtCoder', 'Other'] 
  },
  difficulty: { 
    type: String, 
    enum: ['Easy', 'Medium', 'Hard'], 
    default: 'Medium' 
  },
  targetClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CodingProblem', codingProblemSchema);
