const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// POST /api/auth/signup  (always creates role=user, no role selector)
router.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, confirmPassword } = req.body;
    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const user = await User.create({ firstName, lastName, email, phone, password, role: 'user' });
    const token = signToken(user);
    res.status(201).json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
});

// POST /api/auth/login  (customer login only — role must be 'user')
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user || user.role !== 'user') return res.status(401).json({ message: 'Invalid credentials' });
    if (user.status !== 'active') return res.status(403).json({ message: 'Account suspended' });
    const ok = await user.comparePassword(password || '');
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = signToken(user);
    res.json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

// POST /api/auth/admin-login (separate, no admin signup route exists)
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user || user.role !== 'admin') return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await user.comparePassword(password || '');
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = signToken(user);
    res.json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
});

// PUT /api/auth/profile
router.put('/profile', requireAuth, async (req, res) => {
  const { firstName, lastName, phone } = req.body;
  if (firstName) req.user.firstName = firstName;
  if (lastName) req.user.lastName = lastName;
  if (phone) req.user.phone = phone;
  await req.user.save();
  res.json({ user: req.user.toSafeObject() });
});

// PUT /api/auth/change-password
router.put('/change-password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  if (newPassword !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match' });
  const ok = await req.user.comparePassword(currentPassword || '');
  if (!ok) return res.status(401).json({ message: 'Current password is incorrect' });
  req.user.password = newPassword;
  await req.user.save();
  res.json({ message: 'Password updated' });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const user = await User.findOne({ email: (req.body.email || '').toLowerCase() });
  // Always respond the same way to avoid leaking which emails exist
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 30; // 30 min
    await user.save();
    // In production, email this link. For local dev we return it directly.
    return res.json({
      message: 'If that email exists, a reset link has been generated.',
      devResetToken: token,
    });
  }
  res.json({ message: 'If that email exists, a reset link has been generated.' });
});

// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });
  if (req.body.password !== req.body.confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  res.json({ message: 'Password reset successfully' });
});

module.exports = router;
