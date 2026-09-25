const express = require('express');
const Barber = require('../models/Barber');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { getAvailableTimeSlots, getAvailableDates } = require('../utils/availability');
const router = express.Router();

router.get('/', async (req, res) => {
  const filter = req.query.all === 'true' ? {} : { active: true };
  const barbers = await Barber.find(filter).populate('services').sort({ createdAt: 1 });
  res.json(barbers);
});

router.get('/:id', async (req, res) => {
  const barber = await Barber.findById(req.params.id).populate('services');
  if (!barber) return res.status(404).json({ message: 'Barber not found' });
  res.json(barber);
});

// GET /api/barbers/:id/slots?date=YYYY-MM-DD&duration=45
router.get('/:id/slots', async (req, res) => {
  const { date, duration } = req.query;
  if (!date || !duration) return res.status(400).json({ message: 'date and duration are required' });
  const slots = await getAvailableTimeSlots(req.params.id, date, Number(duration));
  res.json({ date, slots });
});

// GET /api/barbers/:id/available-dates?duration=45&daysAhead=14
router.get('/:id/available-dates', async (req, res) => {
  const duration = Number(req.query.duration || 30);
  const daysAhead = Number(req.query.daysAhead || 14);
  const dates = await getAvailableDates(req.params.id, duration, daysAhead);
  res.json(dates);
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const barber = await Barber.create(req.body);
  res.status(201).json(barber);
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const barber = await Barber.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!barber) return res.status(404).json({ message: 'Barber not found' });
  res.json(barber);
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  await Barber.findByIdAndDelete(req.params.id);
  res.json({ message: 'Barber deleted' });
});

module.exports = router;
