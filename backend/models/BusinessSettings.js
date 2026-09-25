const mongoose = require('mongoose');

const businessSettingsSchema = new mongoose.Schema({
  businessName: { type: String, default: 'Golden Cuts' },
  address: { type: String, default: '11402 NW 41st St #215, Doral, FL 33178, United States' },
  phone: { type: String, default: '+1 (305) 555-0198' },
  email: { type: String, default: 'hello@goldencuts.com' },
  openingHours: { type: String, default: '9:00 AM - 11:30 PM' },
  openTime: { type: String, default: '09:00' },
  closeTime: { type: String, default: '23:30' },
  mapLocation: {
    lat: { type: Number, default: 25.8145 },
    lng: { type: Number, default: -80.3550 },
  },
  socialLinks: {
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
  },
  heroImage: { type: String, default: '' },
  logo: { type: String, default: '' },
  description: { type: String, default: 'Premium grooming and barbering crafted for you.' },
}, { timestamps: true });

module.exports = mongoose.model('BusinessSettings', businessSettingsSchema);
