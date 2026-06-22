const mongoose = require('mongoose');

const importantLinkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  targetClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ImportantLink', importantLinkSchema);
