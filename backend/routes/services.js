const express = require('express');
const Service = require('../models/Service');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Public
router.get('/', async (req, res) => {
  const filter = req.query.all === 'true' ? {} : { active: true };
  const services = await Service.find(filter).sort({ createdAt: 1 });
  res.json(services);
});

router.get('/:id', async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) return res.status(404).json({ message: 'Service not found' });
  res.json(service);
});

// Admin only
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const service = await Service.create(req.body);
  res.status(201).json(service);
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!service) return res.status(404).json({ message: 'Service not found' });
  res.json(service);
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  await Service.findByIdAndDelete(req.params.id);
  res.json({ message: 'Service deleted' });
});

module.exports = router;
