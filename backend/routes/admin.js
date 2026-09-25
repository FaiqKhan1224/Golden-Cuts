const express = require('express');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const Barber = require('../models/Barber');
const Review = require('../models/Review');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const router = express.Router();

router.use(requireAuth, requireAdmin);

// GET /api/admin/dashboard - stats used by the admin dashboard home
router.get('/dashboard', async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = today.slice(0, 7) + '-01';

  const [todayCount, totalCustomers, pendingCount, monthlyAppts, recentBookings, popularServices, recentReviews] = await Promise.all([
    Appointment.countDocuments({ date: today, status: { $ne: 'cancelled' } }),
    User.countDocuments({ role: 'user' }),
    Appointment.countDocuments({ status: 'pending' }),
    Appointment.find({ date: { $gte: monthStart }, status: { $in: ['confirmed', 'completed'] } }),
    Appointment.find().populate('service').populate('barber').populate('user').sort({ createdAt: -1 }).limit(8),
    Appointment.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: '$service', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
    Review.find({ status: 'approved' }).populate('user').sort({ createdAt: -1 }).limit(5),
  ]);

  const monthlyRevenue = monthlyAppts.reduce((sum, a) => sum + (a.price || 0), 0);

  const serviceIds = popularServices.map(p => p._id).filter(Boolean);
  const services = await Service.find({ _id: { $in: serviceIds } });
  const popularServicesResolved = popularServices.map(p => ({
    service: services.find(s => String(s._id) === String(p._id)),
    count: p.count,
  }));

  const todaySchedule = await Appointment.find({ date: today, status: { $ne: 'cancelled' } })
    .populate('service').populate('barber').populate('user').sort({ time: 1 });

  res.json({
    todayCount, totalCustomers, monthlyRevenue, pendingCount,
    todaySchedule, recentBookings, popularServices: popularServicesResolved, recentReviews,
  });
});

// GET /api/admin/reports
router.get('/reports', async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const monthStart = today.slice(0, 7) + '-01';

  const [todayAppts, weeklyAppts, monthlyAppts, completed, cancelled, allAppts] = await Promise.all([
    Appointment.countDocuments({ date: today }),
    Appointment.countDocuments({ date: { $gte: weekAgo } }),
    Appointment.countDocuments({ date: { $gte: monthStart } }),
    Appointment.countDocuments({ status: 'completed' }),
    Appointment.countDocuments({ status: 'cancelled' }),
    Appointment.find({ status: { $in: ['confirmed', 'completed'] } }).populate('service').populate('barber'),
  ]);

  const revenue = allAppts.reduce((sum, a) => sum + (a.price || 0), 0);

  const serviceCounts = {};
  const barberCounts = {};
  allAppts.forEach(a => {
    if (a.service) serviceCounts[a.service.name] = (serviceCounts[a.service.name] || 0) + 1;
    if (a.barber) barberCounts[a.barber.name] = (barberCounts[a.barber.name] || 0) + 1;
  });

  const customerGrowth = await User.countDocuments({ role: 'user', createdAt: { $gte: monthStart } });

  res.json({
    todayAppts, weeklyAppts, monthlyAppts, completed, cancelled, revenue,
    popularServices: Object.entries(serviceCounts).sort((a, b) => b[1] - a[1]).slice(0, 5),
    mostBookedBarbers: Object.entries(barberCounts).sort((a, b) => b[1] - a[1]).slice(0, 5),
    customerGrowth,
  });
});

// GET /api/admin/customers
router.get('/customers', async (req, res) => {
  const customers = await User.find({ role: 'user' }).sort({ createdAt: -1 });
  const appts = await Appointment.find({ user: { $in: customers.map(c => c._id) } });

  const result = customers.map(c => {
    const own = appts.filter(a => String(a.user) === String(c._id));
    const last = own.sort((a, b) => (a.date < b.date ? 1 : -1))[0];
    return {
      ...c.toSafeObject(),
      totalAppointments: own.length,
      lastAppointment: last ? last.date : null,
    };
  });
  res.json(result);
});

router.put('/customers/:id/status', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!user) return res.status(404).json({ message: 'Customer not found' });
  res.json(user.toSafeObject());
});

module.exports = router;
