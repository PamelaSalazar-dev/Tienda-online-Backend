const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    userName:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password:{
        type: String,
        required: true
    },
    productos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Producto'
    }],
    carrito: [{
       product:{type: mongoose.Schema.Types.ObjectId, ref: 'Producto'} 
    }]

})

module.exports = mongoose.model('User', UserSchema)
