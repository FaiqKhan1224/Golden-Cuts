const express = require('express');
const Review = require('../models/Review');
const Appointment = require('../models/Appointment');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Public - approved only
router.get('/', async (req, res) => {
  const reviews = await Review.find({ status: 'approved' }).populate('user').sort({ createdAt: -1 }).limit(20);
  res.json(reviews);
});

// Authenticated user leaves a review for a completed appointment
router.post('/', requireAuth, async (req, res) => {
  const { appointmentId, rating, comment } = req.body;
  if (appointmentId) {
    const appt = await Appointment.findById(appointmentId);
    if (!appt || String(appt.user) !== String(req.user._id) || appt.status !== 'completed') {
      return res.status(400).json({ message: 'You can only review your own completed appointments' });
    }
  }
  const review = await Review.create({
    user: req.user._id,
    appointment: appointmentId || undefined,
    rating, comment,
    status: 'pending',
  });
  res.status(201).json(review);
});

// Admin
router.get('/all', requireAuth, requireAdmin, async (req, res) => {
  const reviews = await Review.find().populate('user').sort({ createdAt: -1 });
  res.json(reviews);
});

router.put('/:id/status', requireAuth, requireAdmin, async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json(review);
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  await Review.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
