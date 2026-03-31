const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
    },
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    categoria:{
        type: String,
    },
    precio: {
        type: Number,
        required: true,
    },
    descripcion: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    imagenes: [{
        type: String, // Array para almacenar múltiples URLs de imágenes
    }]
});

module.exports = mongoose.model('Producto', ProductoSchema);

