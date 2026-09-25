const express = require('express');
const ContactMessage = require('../models/ContactMessage');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const router = express.Router();

router.post('/', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ message: 'Name, email and message are required' });
  const msg = await ContactMessage.create({ name, email, phone, subject, message });
  res.status(201).json(msg);
});

router.get('/', requireAuth, requireAdmin, async (req, res) => {
  const messages = await ContactMessage.find().sort({ createdAt: -1 });
  res.json(messages);
});

router.put('/:id/read', requireAuth, requireAdmin, async (req, res) => {
  const msg = await ContactMessage.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
  res.json(msg);
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  await ContactMessage.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;
