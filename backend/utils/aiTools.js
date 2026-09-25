/**
 * Real backend functions the AI Assistant uses (never invents data).
 * Mirrors the function list requested in the spec: getServices, getBarbers,
 * getBarberSchedule, getAvailableDates, getAvailableTimeSlots,
 * checkAppointmentAvailability, getBusinessHours, getBusinessLocation,
 * getUserAppointments, createAppointment, cancelAppointment, rescheduleAppointment.
 */
const Service = require('../models/Service');
const Barber = require('../models/Barber');
const Appointment = require('../models/Appointment');
const BusinessSettings = require('../models/BusinessSettings');
const {
  getAvailableTimeSlots, getAvailableDates, checkAvailability, isPastDate,
} = require('./availability');

async function getServices() {
  const services = await Service.find({ active: true }).lean();
  return services.map(s => ({
    id: s._id, name: s.name, description: s.description, price: s.price, duration: s.duration, category: s.category,
  }));
}

async function getServiceByName(name) {
  const services = await Service.find({ active: true });
  const lower = name.toLowerCase();
  return services.find(s => s.name.toLowerCase().includes(lower)) || null;
}

async function getBarbers() {
  const barbers = await Barber.find({ active: true }).lean();
  return barbers.map(b => ({
    id: b._id, name: b.name, title: b.title, bio: b.bio, specialties: b.specialties,
    experience: b.experience, rating: b.rating, workingHours: b.workingHours,
  }));
}

async function getBarberByName(name) {
  const barbers = await Barber.find({ active: true });
  const lower = name.toLowerCase();
  return barbers.find(b => b.name.toLowerCase().includes(lower)) || null;
}

async function getBarberSchedule(barberId) {
  const barber = await Barber.findById(barberId).lean();
  if (!barber) return null;
  return { name: barber.name, workingHours: barber.workingHours, daysOff: barber.daysOff, active: barber.active };
}

async function getBusinessHours() {
  let s = await BusinessSettings.findOne();
  if (!s) s = await BusinessSettings.create({});
  return { openingHours: s.openingHours, openTime: s.openTime, closeTime: s.closeTime };
}

async function getBusinessLocation() {
  let s = await BusinessSettings.findOne();
  if (!s) s = await BusinessSettings.create({});
  return { businessName: s.businessName, address: s.address, phone: s.phone, email: s.email, mapLocation: s.mapLocation };
}

async function getUserAppointments(userId) {
  const appts = await Appointment.find({ user: userId }).populate('service').populate('barber').sort({ date: -1, time: -1 });
  return appts.map(a => ({
    id: a._id, service: a.service?.name, barber: a.barber?.name, date: a.date, time: a.time,
    duration: a.duration, price: a.price, status: a.status,
  }));
}

async function createAppointmentTool(userId, { serviceId, barberId, date, time }) {
  const service = await Service.findById(serviceId);
  if (!service || !service.active) return { error: 'Service not available' };
  const barber = await Barber.findById(barberId);
  if (!barber || !barber.active) return { error: 'Barber not available' };
  if (isPastDate(date)) return { error: 'Cannot book a past date' };

  const available = await checkAvailability(barberId, date, time, service.duration);
  if (!available) return { error: 'That time was just booked by another customer or is unavailable.' };

  const appt = await Appointment.create({
    user: userId, service: service._id, barber: barber._id, date, time,
    duration: service.duration, price: service.price, status: 'confirmed',
  });
  return {
    id: appt._id, service: service.name, barber: barber.name, date, time,
    duration: service.duration, price: service.price, status: appt.status,
  };
}

async function cancelAppointmentTool(userId, appointmentId) {
  const appt = await Appointment.findById(appointmentId);
  if (!appt || String(appt.user) !== String(userId)) return { error: 'Appointment not found' };
  appt.status = 'cancelled';
  await appt.save();
  return { id: appt._id, status: 'cancelled' };
}

async function rescheduleAppointmentTool(userId, appointmentId, date, time) {
  const appt = await Appointment.findById(appointmentId).populate('service');
  if (!appt || String(appt.user) !== String(userId)) return { error: 'Appointment not found' };
  if (isPastDate(date)) return { error: 'Cannot reschedule to a past date' };
  const available = await checkAvailability(appt.barber, date, time, appt.duration);
  if (!available) return { error: 'That time is unavailable' };
  appt.date = date; appt.time = time; appt.status = 'confirmed';
  await appt.save();
  return { id: appt._id, date, time, status: appt.status };
}

module.exports = {
  getServices, getServiceByName, getBarbers, getBarberByName, getBarberSchedule,
  getAvailableDates, getAvailableTimeSlots, checkAvailability, getBusinessHours,
  getBusinessLocation, getUserAppointments, createAppointmentTool, cancelAppointmentTool,
  rescheduleAppointmentTool,
};
