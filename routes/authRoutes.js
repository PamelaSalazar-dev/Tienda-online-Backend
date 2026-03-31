const express = require('express')
const router = express.Router()
const {register, login,logout, getProfile, updateProfile, getUsers, verifyToken, addProduct, getProducts, removeProduct} = require('../controllers/authController')
const {Autorizacion} = require('../middlewares/validateToken')
const validateSchema = require('../middlewares/validator.middelware.js')
const {registerSchema, loginSchema} = require('../schemas/auth.schema.js')


router.post('/register',validateSchema(registerSchema), register)
router.post('/login',validateSchema(loginSchema), login)
router.post('/users/:userId/carrito', addProduct)
router.post('/logout', logout)
router.get('/users', getUsers)
router.get('/users/:userId/carrito', getProducts)
router.get('/perfil',Autorizacion, getProfile)
router.put('/perfil', Autorizacion, updateProfile)
router.get('/verifyToken', verifyToken)
router.put('/users/:userId/carrito', removeProduct)

module.exports = router
