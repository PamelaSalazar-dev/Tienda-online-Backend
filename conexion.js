require('dotenv').config(); // Cargar las variables de entorno desde .env
const mongoose = require('mongoose');

// Construir la URI usando las variables del archivo .env
const dbURI = process.env.MONGODB_URI;

// Conectar a MongoDB sin las opciones obsoletas
mongoose.connect(dbURI)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error conectando a la base de datos:', err));

  




