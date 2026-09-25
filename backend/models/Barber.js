const mongoose = require('mongoose');

const workingHoursSchema = new mongoose.Schema({
  day: { type: String, enum: ['sun','mon','tue','wed','thu','fri','sat'], required: true },
  isOff: { type: Boolean, default: false },
  start: { type: String, default: '09:00' },
  end: { type: String, default: '23:30' },
  breakStart: { type: String, default: '' },
  breakEnd: { type: String, default: '' },
}, { _id: false });

function defaultWorkingHours() {
  return ['sun','mon','tue','wed','thu','fri','sat'].map(day => ({
    day, isOff: false, start: '09:00', end: '23:30', breakStart: '', breakEnd: ''
  }));
}

const barberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, default: '' },
  title: { type: String, default: 'Barber' },
  bio: { type: String, default: '' },
  specialties: [{ type: String }],
  experience: { type: Number, default: 0 },
  rating: { type: Number, default: 5 },
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  workingHours: { type: [workingHoursSchema], default: defaultWorkingHours },
  daysOff: [{ type: Date }],
  active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Barber', barberSchema);
