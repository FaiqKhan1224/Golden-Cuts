const express = require('express');
const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const Barber = require('../models/Barber');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { checkAvailability, isPastDate } = require('../utils/availability');
const router = express.Router();

// GET /api/appointments/mine
router.get('/mine', requireAuth, async (req, res) => {
  const appointments = await Appointment.find({ user: req.user._id })
    .populate('service').populate('barber')
    .sort({ date: -1, time: -1 });
  res.json(appointments);
});

// POST /api/appointments  -> create booking (re-validates availability server-side)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { serviceId, barberId, date, time } = req.body;
    if (!serviceId || !barberId || !date || !time) {
      return res.status(400).json({ message: 'serviceId, barberId, date and time are required' });
    }
    if (isPastDate(date)) return res.status(400).json({ message: 'Cannot book a past date' });

    const service = await Service.findById(serviceId);
    if (!service || !service.active) return res.status(400).json({ message: 'Service is not available' });

    const barber = await Barber.findById(barberId);
    if (!barber || !barber.active) return res.status(400).json({ message: 'Barber is not available' });

    const available = await checkAvailability(barberId, date, time, service.duration);
    if (!available) {
      return res.status(409).json({ message: 'That time was just booked or is unavailable. Please choose another slot.' });
    }

    const appointment = await Appointment.create({
      user: req.user._id,
      service: service._id,
      barber: barber._id,
      date,
      time,
      duration: service.duration,
      price: service.price, // server-side snapshot price
      status: 'confirmed',
    });
    const populated = await appointment.populate(['service', 'barber']);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Booking failed', error: err.message });
  }
});

// PUT /api/appointments/:id/cancel
router.put('/:id/cancel', requireAuth, async (req, res) => {
  const appt = await Appointment.findById(req.params.id);
  if (!appt) return res.status(404).json({ message: 'Appointment not found' });
  if (String(appt.user) !== String(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not allowed' });
  }
  appt.status = 'cancelled';
  await appt.save();
  res.json(appt);
});

// PUT /api/appointments/:id/reschedule
router.put('/:id/reschedule', requireAuth, async (req, res) => {
  const { date, time } = req.body;
  const appt = await Appointment.findById(req.params.id).populate('service');
  if (!appt) return res.status(404).json({ message: 'Appointment not found' });
  if (String(appt.user) !== String(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not allowed' });
  }
  if (isPastDate(date)) return res.status(400).json({ message: 'Cannot reschedule to a past date' });

  const available = await checkAvailability(appt.barber, date, time, appt.duration);
  if (!available) return res.status(409).json({ message: 'That time is unavailable' });

  appt.date = date;
  appt.time = time;
  appt.status = 'confirmed';
  await appt.save();
  res.json(appt);
});

// ---- Admin ----
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  const { status, barber, service, date, customer } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (barber) filter.barber = barber;
  if (service) filter.service = service;
  if (date) filter.date = date;

  let query = Appointment.find(filter).populate('service').populate('barber').populate('user');
  const appointments = await query.sort({ date: -1, time: -1 });
  const filtered = customer
    ? appointments.filter(a => a.user && `${a.user.firstName} ${a.user.lastName}`.toLowerCase().includes(customer.toLowerCase()))
    : appointments;
  res.json(filtered);
});

router.put('/:id/status', requireAuth, requireAdmin, async (req, res) => {
  const { status } = req.body;
  const appt = await Appointment.findByIdAndUpdate(req.params.id, { status }, { new: true })
    .populate('service').populate('barber').populate('user');
  if (!appt) return res.status(404).json({ message: 'Appointment not found' });
  res.json(appt);
});

module.exports = router;
