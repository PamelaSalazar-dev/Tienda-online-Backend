const express = require('express');
const router = express.Router();
// para Cloudinary
const upload = require('../middlewares/multerConfig'); // Importar Multer
const { Autorizacion } = require('../middlewares/validateToken');
const {
    obtenerProductos,
    obtenerProducto,
    crearProducto,
    actualizarProducto,
    eliminarProducto
} = require('../controllers/productoController');

// Definir las rutas
router.get('/', obtenerProductos); // Ruta para obtener todos los productos
router.get('/:id', obtenerProducto)
router.post('/', Autorizacion, upload.array('imagenes', 5), crearProducto); // Ruta para crear un nuevo producto
router.put('/:id', Autorizacion, upload.array('imagenes', 5), actualizarProducto); // Ruta para actualizar un producto existente
router.delete('/:id', Autorizacion, eliminarProducto); // Ruta para eliminar un producto


module.exports = router;




