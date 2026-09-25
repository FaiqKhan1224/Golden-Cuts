const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true },
  status: { type: String, enum: ['pending','approved','hidden'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
