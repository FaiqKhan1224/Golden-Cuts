const express = require('express');
const Gallery = require('../models/Gallery');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
  const filter = req.query.all === 'true' ? {} : { active: true };
  if (req.query.category && req.query.category !== 'All') filter.category = req.query.category;
  const images = await Gallery.find(filter).sort({ featured: -1, createdAt: -1 });
  res.json(images);
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const item = await Gallery.create(req.body);
  res.status(201).json(item);
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const item = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json(item);
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  await Gallery.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
