require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

// Routes
const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const barberRoutes = require('./routes/barbers');
const appointmentRoutes = require('./routes/appointments');
const galleryRoutes = require('./routes/gallery');
const reviewRoutes = require('./routes/reviews');
const contactRoutes = require('./routes/contact');
const businessRoutes = require('./routes/business');
const adminRoutes = require('./routes/admin');
const aiRoutes = require('./routes/ai');

const app = express();

/* =========================================================
   CORS CONFIGURATION
   Allow Vite development ports 5173 and 5174
   ========================================================= */

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an Origin header
      // such as curl/Postman/server-to-server requests.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log(`CORS blocked origin: ${origin}`);

      return callback(
        new Error(`CORS blocked origin: ${origin}`)
      );
    },

    credentials: true,

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
    ],
  })
);

/* =========================================================
   BODY PARSING
   ========================================================= */

app.use(
  express.json({
    limit: '5mb',
  })
);

/* =========================================================
   REQUEST LOGGER
   ========================================================= */

app.use(morgan('dev'));

/* =========================================================
   HEALTH CHECK
   ========================================================= */

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
  });
});

/* =========================================================
   API ROUTES
   ========================================================= */

app.use('/api/auth', authRoutes);

app.use('/api/services', serviceRoutes);

app.use('/api/barbers', barberRoutes);

app.use('/api/appointments', appointmentRoutes);

app.use('/api/gallery', galleryRoutes);

app.use('/api/reviews', reviewRoutes);

app.use('/api/contact', contactRoutes);

app.use('/api/business', businessRoutes);

app.use('/api/admin', adminRoutes);

app.use('/api/ai', aiRoutes);

/* =========================================================
   404 HANDLER
   ========================================================= */

app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
  });
});

/* =========================================================
   ERROR HANDLER
   ========================================================= */

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Server error:', err);

  // Handle CORS errors cleanly
  if (err.message && err.message.startsWith('CORS blocked')) {
    return res.status(403).json({
      message: err.message,
    });
  }

  res.status(500).json({
    message: 'Internal server error',
  });
});

/* =========================================================
   SERVER + DATABASE
   ========================================================= */

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');

    app.listen(PORT, () => {
      console.log(
        `Golden Cuts API running on port ${PORT}`
      );
    });
  })
  .catch((err) => {
    console.error(
      'MongoDB connection error:',
      err.message
    );

    process.exit(1);
  });