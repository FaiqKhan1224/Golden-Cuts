const express = require('express');
const BusinessSettings = require('../models/BusinessSettings');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
  let settings = await BusinessSettings.findOne();
  if (!settings) settings = await BusinessSettings.create({});
  res.json(settings);
});

router.put('/', requireAuth, requireAdmin, async (req, res) => {
  let settings = await BusinessSettings.findOne();
  if (!settings) settings = new BusinessSettings();
  Object.assign(settings, req.body);
  await settings.save();
  res.json(settings);
});

module.exports = router;
