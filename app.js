const express = require('express');
const cors = require('cors'); 
const cookieParser = require('cookie-parser');
const productoRoutes = require('./routes/productoRoutes');
const authRoutes = require('./routes/authRoutes.js');

const app = express();
const allowedOrigins = (process.env.FRONTEND_URLS || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Configurar CORS antes de las rutas
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origen no permitido por CORS'));
  },
  credentials: true, 
}));

// Middlewares importantes
app.use(express.json());  // 🚀 DEBE estar antes de las rutas
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rutas
app.use('/api/productos', productoRoutes);
app.use('/api', authRoutes);

module.exports = app;
