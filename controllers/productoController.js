const Producto = require('../models/producto.js');
const User = require('../models/user.js');
const fs = require('fs');
const cloudinary = require('../middlewares/cloudinary.js');

// Controlador para obtener productos con filtros de categoria, precio y usuario
const obtenerProductos = async (req, res) => {
    try {
        const { categoria, precioMin, precioMax, usuarioId } = req.query;
        const filtros = {};

        if (categoria) {
            filtros.categoria = categoria;
        }

        if (usuarioId) {
            filtros.usuario = usuarioId;
        }

        if (precioMin || precioMax) {
            filtros.precio = {};
            if (precioMin) filtros.precio.$gte = parseFloat(precioMin);
            if (precioMax) filtros.precio.$lte = parseFloat(precioMax);
        }

        const productos = await Producto.find(filtros).populate('usuario', 'userName email');
        res.status(200).json(productos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obteniendo productos" });
    }
};

const obtenerProducto = async (req, res) => {
    const id = req.params.id;
    try {
        const producto = await Producto.findById(id).populate('usuario', 'userName email');
        res.status(200).json(producto);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obteniendo productos" });
    }
};

// Controlador para crear un producto
const crearProducto = async (req, res) => {
    const { nombre, categoria, descripcion, precio, stock } = req.body;

    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Usuario no autorizado" });
        }

        const usuario = await User.findById(req.user.id);
        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const imagenes = [];
        const archivos = req.files || [];

        if (archivos.length > 0) {
            for (let i = 0; i < archivos.length; i++) {
                try {
                    const result = await cloudinary.uploader.upload(archivos[i].path, { folder: 'productos_tienda' });
                    imagenes.push(result.public_id);
                } catch (uploadError) {
                    console.error(`Error subiendo imagen ${i + 1}:`, uploadError);
                    return res.status(500).json({ message: "Error subiendo imagenes" });
                }
            }
        }

        const nuevoProducto = new Producto({
            nombre,
            usuario: usuario._id,
            precio,
            categoria,
            stock,
            descripcion,
            imagenes,
        });

        for (let i = 0; i < archivos.length; i++) {
            fs.unlinkSync(archivos[i].path);
        }

        await nuevoProducto.save();
        usuario.productos.push(nuevoProducto._id);
        await usuario.save();

        const productoCreado = await Producto.findById(nuevoProducto._id).populate('usuario', 'userName email');

        res.status(201).json({ message: "Producto creado", producto: productoCreado });
    } catch (error) {
        console.error("Error de base de datos:", error);
        res.status(500).json({ message: "Error creando producto" });
    }
};

// Controlador para actualizar un producto
const actualizarProducto = async (req, res) => {
    const { id } = req.params;
    try {
        const producto = await Producto.findById(id);
        if (!producto) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        if (!producto.usuario || producto.usuario.toString() !== req.user.id) {
            return res.status(403).json({ message: "No tienes permisos para editar este producto" });
        }

        const datosActualizados = { ...req.body };
        delete datosActualizados.usuario;
        let imagenesAEliminar = [];

        if (req.body.imagenesAEliminar) {
            try {
                imagenesAEliminar = JSON.parse(req.body.imagenesAEliminar);
            } catch (error) {
                imagenesAEliminar = [];
            }
        }

        if (!Array.isArray(imagenesAEliminar)) {
            imagenesAEliminar = [];
        }

        if (imagenesAEliminar.length > 0) {
            for (const publicId of imagenesAEliminar) {
                if (producto.imagenes.includes(publicId)) {
                    try {
                        await cloudinary.uploader.destroy(publicId);
                    } catch (error) {
                        console.error(`Error al eliminar imagen con ID ${publicId}:`, error.message);
                    }
                }
            }
        }

        let imagenesActualizadas = producto.imagenes.filter(
            (imagen) => !imagenesAEliminar.includes(imagen)
        );

        const archivos = req.files || [];
        const cupoDisponible = 5 - imagenesActualizadas.length;

        if (archivos.length > cupoDisponible) {
            for (const archivo of archivos) {
                if (archivo?.path && fs.existsSync(archivo.path)) {
                    fs.unlinkSync(archivo.path);
                }
            }
            return res.status(400).json({ message: "Solo puedes tener hasta 5 imagenes por producto" });
        }

        if (archivos.length > 0) {
            for (const archivo of archivos) {
                try {
                    const result = await cloudinary.uploader.upload(archivo.path, { folder: 'productos_tienda' });
                    imagenesActualizadas.push(result.public_id);
                } catch (uploadError) {
                    console.error("Error subiendo nuevas imagenes:", uploadError);
                    return res.status(500).json({ message: "Error subiendo imagenes" });
                } finally {
                    if (archivo?.path && fs.existsSync(archivo.path)) {
                        fs.unlinkSync(archivo.path);
                    }
                }
            }
        }

        datosActualizados.imagenes = imagenesActualizadas;

        const productoActualizado = await Producto.findByIdAndUpdate(id, datosActualizados, {
            new: true,
            runValidators: true
        }).populate('usuario', 'userName email');

        res.status(200).json({ message: "Producto actualizado", producto: productoActualizado });
    } catch (error) {
        console.error("Error de base de datos:", error);
        res.status(500).json({ message: "Error actualizando producto" });
    }
};

// Controlador para eliminar un producto
const eliminarProducto = async (req, res) => {
    const { id } = req.params;
    try {
        const productoEliminado = await Producto.findById(id);
        if (!productoEliminado) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        if (!productoEliminado.usuario || productoEliminado.usuario.toString() !== req.user.id) {
            return res.status(403).json({ message: "No tienes permisos para eliminar este producto" });
        }

        const imagenes = productoEliminado.imagenes;

        if (imagenes && imagenes.length > 0) {
            for (const publicId of imagenes) {
                try {
                    await cloudinary.uploader.destroy(publicId);
                    console.log(`Imagen con ID ${publicId} eliminada de Cloudinary`);
                } catch (error) {
                    console.error(`Error al eliminar imagen con ID ${publicId}:`, error.message);
                }
            }
        }

        await User.updateMany(
            { "carrito.product": id },
            { $pull: { carrito: { product: id } } }
        );

        await User.findByIdAndUpdate(
            productoEliminado.usuario,
            { $pull: { productos: productoEliminado._id } }
        );

        await productoEliminado.deleteOne();

        res.status(200).json({ message: "Producto eliminado", producto: productoEliminado });
    } catch (error) {
        console.error("Error de base de datos:", error);
        res.status(500).json({ message: "Error eliminando producto" });
    }
};

module.exports = {
    obtenerProductos,
    obtenerProducto,
    crearProducto,
    actualizarProducto,
    eliminarProducto
};
