const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  },
  status: {
    type: String,
    enum: ['open', 'resolved'],
    default: 'open'
  }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', ComplaintSchema);
