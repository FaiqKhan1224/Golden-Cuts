/**
 * Seeds demo data so the site is never empty on first run.
 * Run: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Service = require('./models/Service');
const Barber = require('./models/Barber');
const Gallery = require('./models/Gallery');
const Review = require('./models/Review');
const Appointment = require('./models/Appointment');
const BusinessSettings = require('./models/BusinessSettings');

const IMG = {
  hero: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1600&q=80',
  barber1: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=600&q=80',
  barber2: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&q=80',
  barber3: 'https://images.unsplash.com/photo-1567894340315-735d7c361db0?w=600&q=80',
  barber4: 'https://images.unsplash.com/photo-1622296089863-eb7fc530daa8?w=600&q=80',
  barber5: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&q=80',
  service1: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&q=80',
  service2: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&q=80',
  service3: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80',
  gallery1: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80',
  gallery2: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=800&q=80',
  gallery3: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80',
};

function fullWeek(overrides = {}) {
  return ['sun','mon','tue','wed','thu','fri','sat'].map(day => ({
    day, isOff: false, start: '09:00', end: '23:30', breakStart: '14:00', breakEnd: '14:30',
    ...(overrides[day] || {}),
  }));
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Seeding...');

  await Promise.all([
    User.deleteMany({}), Service.deleteMany({}), Barber.deleteMany({}),
    Gallery.deleteMany({}), Review.deleteMany({}), Appointment.deleteMany({}),
    BusinessSettings.deleteMany({}),
  ]);

  await BusinessSettings.create({
    businessName: 'Golden Cuts',
    address: '11402 NW 41st St #215, Doral, FL 33178, United States',
    phone: '+1 (305) 555-0198',
    email: 'hello@goldencuts.com',
    openingHours: '9:00 AM - 11:30 PM',
    openTime: '09:00',
    closeTime: '23:30',
    mapLocation: { lat: 25.8145, lng: -80.3550 },
    heroImage: IMG.hero,
    description: 'Expert cuts, precision grooming, and premium barbering crafted for you.',
  });

  const admin = await User.create({
    firstName: 'Admin', lastName: 'Owner', email: 'admin@goldencuts.com',
    phone: '+1 (305) 555-0100', password: 'Admin123!', role: 'admin',
  });

  const customers = await User.insertMany([
    { firstName: 'James', lastName: 'Miller', email: 'james@example.com', phone: '+1 305 555 0111', password: await hash('Customer123!'), role: 'user' },
    { firstName: 'Sarah', lastName: 'Lopez', email: 'sarah@example.com', phone: '+1 305 555 0112', password: await hash('Customer123!'), role: 'user' },
    { firstName: 'Omar', lastName: 'Khan', email: 'omar@example.com', phone: '+1 305 555 0113', password: await hash('Customer123!'), role: 'user' },
  ]);

  async function hash(pw) {
    const bcrypt = require('bcryptjs');
    return bcrypt.hash(pw, 10);
  }

  const services = await Service.insertMany([
    { name: 'Classic Haircut', description: 'A timeless precision haircut tailored to your style.', price: 30, duration: 30, image: IMG.service1, category: 'Haircut' },
    { name: 'Premium Haircut', description: 'Includes consultation, wash, precision cut and styling.', price: 45, duration: 45, image: IMG.service2, category: 'Haircut' },
    { name: 'Beard Styling', description: 'Sharp beard shaping and edge-up with hot towel finish.', price: 20, duration: 20, image: IMG.service3, category: 'Beard' },
    { name: 'Hair + Beard', description: 'Full haircut paired with a complete beard styling.', price: 55, duration: 60, image: IMG.service1, category: 'Combo' },
    { name: 'Hot Towel Shave', description: 'A traditional straight-razor hot towel shave.', price: 35, duration: 30, image: IMG.service2, category: 'Shave' },
    { name: 'Facial', description: 'Deep cleansing facial treatment for a refreshed look.', price: 40, duration: 30, image: IMG.service3, category: 'Facial' },
    { name: 'Executive Package', description: 'Premium haircut, beard styling, hot towel shave and facial.', price: 110, duration: 90, image: IMG.service1, category: 'Combo' },
  ]);

  const byName = n => services.find(s => s.name === n);

  const barbers = await Barber.insertMany([
    {
      name: 'James Carter', image: IMG.barber1, title: 'Master Barber',
      bio: 'James has spent over a decade perfecting fades and precision cuts for a premium clientele.',
      specialties: ['Fades', 'Classic Cuts'], experience: 10, rating: 4.9,
      services: services.map(s => s._id), workingHours: fullWeek(),
    },
    {
      name: 'Marcus Bell', image: IMG.barber2, title: 'Senior Barber',
      bio: 'Marcus is known for his sharp beard styling and hot towel shave technique.',
      specialties: ['Beard Styling', 'Hot Towel Shave'], experience: 7, rating: 4.8,
      services: services.map(s => s._id), workingHours: fullWeek({ sun: { isOff: true } }),
    },
    {
      name: 'Diego Ramirez', image: IMG.barber3, title: 'Barber',
      bio: 'Diego blends modern techniques with classic barbering fundamentals.',
      specialties: ['Modern Fades', 'Hair + Beard Combos'], experience: 5, rating: 4.7,
      services: services.map(s => s._id), workingHours: fullWeek(),
    },
    {
      name: 'Anthony Reed', image: IMG.barber4, title: 'Master Barber',
      bio: 'Anthony specializes in executive grooming packages for busy professionals.',
      specialties: ['Executive Packages', 'Facials'], experience: 12, rating: 5,
      services: services.map(s => s._id), workingHours: fullWeek({ mon: { isOff: true } }),
    },
    {
      name: 'Leo Thompson', image: IMG.barber5, title: 'Barber',
      bio: 'Leo is a rising talent with a sharp eye for detail in classic cuts.',
      specialties: ['Classic Cuts', 'Beard Styling'], experience: 3, rating: 4.6,
      services: services.map(s => s._id), workingHours: fullWeek(),
    },
  ]);

  await Gallery.insertMany([
    { image: IMG.gallery1, category: 'Fades', caption: 'Clean skin fade', featured: true },
    { image: IMG.gallery2, category: 'Haircuts', caption: 'Classic textured crop', featured: true },
    { image: IMG.gallery3, category: 'Beards', caption: 'Sharp beard line-up', featured: false },
    { image: IMG.barber1, category: 'Shop', caption: 'Inside Golden Cuts', featured: false },
    { image: IMG.barber2, category: 'Styling', caption: 'Pompadour styling', featured: false },
    { image: IMG.barber3, category: 'Fades', caption: 'Mid fade with design', featured: false },
  ]);

  const reviewTexts = [
    'Best haircut I\'ve had in years, James really knows fades.',
    'Marcus gave me the cleanest beard line up ever.',
    'Premium experience from start to finish. Highly recommend.',
    'The hot towel shave was incredibly relaxing.',
    'Diego nailed exactly what I asked for.',
    'Anthony\'s executive package is worth every penny.',
    'Clean shop, great music, even better cuts.',
    'Leo is young but seriously talented.',
    'Booking online was seamless and the AI assistant helped me pick a slot.',
    'Consistently great service every single visit.',
    'They really care about the details here.',
    'My go-to barbershop from now on.',
  ];
  await Review.insertMany(reviewTexts.map((comment, i) => ({
    user: customers[i % customers.length]._id,
    rating: 4 + (i % 2),
    comment,
    status: 'approved',
  })));

  const today = new Date();
  const in3 = new Date(today); in3.setDate(in3.getDate() + 3);
  await Appointment.insertMany([
    {
      user: customers[0]._id, service: byName('Premium Haircut')._id, barber: barbers[0]._id,
      date: in3.toISOString().slice(0, 10), time: '15:00', duration: 45, price: 45, status: 'confirmed',
    },
  ]);

  console.log('Seed complete.');
  console.log('Admin login -> email: admin@goldencuts.com  password: Admin123!');
  console.log('Customer login -> email: james@example.com  password: Customer123!');
  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
