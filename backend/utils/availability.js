/**
 * Core availability engine used by BOTH the booking UI endpoints and the
 * AI Assistant, so real-time slot data is always identical everywhere.
 */
const Appointment = require('../models/Appointment');
const Barber = require('../models/Barber');
const BusinessSettings = require('../models/BusinessSettings');

const DAY_KEYS = ['sun','mon','tue','wed','thu','fri','sat'];
const SLOT_STEP = 15; // minutes

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}
function toHHMM(mins) {
  const h = Math.floor(mins / 60).toString().padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}
function dateKeyToDayIdx(dateStr) {
  // dateStr = YYYY-MM-DD, avoid TZ bugs by constructing UTC noon
  const d = new Date(`${dateStr}T12:00:00Z`);
  return d.getUTCDay();
}
function isPastDate(dateStr) {
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  return dateStr < todayKey;
}
function isSameOrFutureDate(dateStr) {
  return !isPastDate(dateStr);
}

async function getBusinessHours() {
  let settings = await BusinessSettings.findOne();
  if (!settings) settings = await BusinessSettings.create({});
  return { open: settings.openTime, close: settings.closeTime, settings };
}

/**
 * Returns available start times (HH:mm array) for a barber on a given date,
 * for a service of the given duration (minutes).
 */
async function getAvailableTimeSlots(barberId, date, durationMinutes) {
  const barber = await Barber.findById(barberId);
  if (!barber || !barber.active) return [];
  if (!isSameOrFutureDate(date)) return [];

  const dayIdx = dateKeyToDayIdx(date);
  const dayKey = DAY_KEYS[dayIdx];
  const dayRule = barber.workingHours.find(w => w.day === dayKey);
  if (!dayRule || dayRule.isOff) return [];

  // specific day off?
  const isDayOff = (barber.daysOff || []).some(d => d.toISOString().slice(0, 10) === date);
  if (isDayOff) return [];

  const { open, close } = await getBusinessHours();
  const dayStart = Math.max(toMinutes(dayRule.start), toMinutes(open));
  const dayEnd = Math.min(toMinutes(dayRule.end), toMinutes(close));
  if (dayEnd <= dayStart) return [];

  const breakStart = dayRule.breakStart ? toMinutes(dayRule.breakStart) : null;
  const breakEnd = dayRule.breakEnd ? toMinutes(dayRule.breakEnd) : null;

  const existing = await Appointment.find({
    barber: barberId,
    date,
    status: { $in: ['pending', 'confirmed'] },
  });

  const busyRanges = existing.map(a => {
    const start = toMinutes(a.time);
    return [start, start + a.duration];
  });

  const now = new Date();
  const isToday = date === now.toISOString().slice(0, 10);
  const nowMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();

  const slots = [];
  for (let t = dayStart; t + durationMinutes <= dayEnd; t += SLOT_STEP) {
    const slotEnd = t + durationMinutes;

    // block if inside break
    if (breakStart !== null && breakEnd !== null) {
      if (t < breakEnd && slotEnd > breakStart) continue;
    }
    // block if overlapping an existing appointment
    const overlaps = busyRanges.some(([bStart, bEnd]) => t < bEnd && slotEnd > bStart);
    if (overlaps) continue;
    // block if in the past for today
    if (isToday && t <= nowMinutes) continue;

    slots.push(toHHMM(t));
  }
  return slots;
}

/** Available dates (next N days) for a barber+service that have >=1 open slot */
async function getAvailableDates(barberId, durationMinutes, daysAhead = 14) {
  const results = [];
  const today = new Date();
  for (let i = 0; i < daysAhead; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const slots = await getAvailableTimeSlots(barberId, dateStr, durationMinutes);
    if (slots.length > 0) results.push({ date: dateStr, slotCount: slots.length });
  }
  return results;
}

/** Authoritative check used right before creating a booking (double-booking protection) */
async function checkAvailability(barberId, date, time, durationMinutes) {
  const slots = await getAvailableTimeSlots(barberId, date, durationMinutes);
  return slots.includes(time);
}

module.exports = {
  getAvailableTimeSlots,
  getAvailableDates,
  checkAvailability,
  getBusinessHours,
  isPastDate,
  toMinutes,
  toHHMM,
  DAY_KEYS,
};
