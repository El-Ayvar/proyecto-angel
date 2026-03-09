const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const usuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    rol: { type: String, enum: ['paciente', 'odontologo'], default: 'paciente' }
}, { timestamps: true });

// PUNTO CLAVE: Encriptar antes de guardar
usuarioSchema.pre('save', async function() {
    // si la contraseña no ha sido cambiada, saltamos este paso
    if (!this.isModified('password')) return;

    // Generamos un "salt" (una semilla de aleatoriedad)
    const salt = await bcrypt.genSalt(10); // Vi que servia para encripatar mejor una contraseña, por si era la misma contraseña no tengaan el mismo hsat, correcion del 8/03/26 se escribe hash, todo pdj el del pasado
    // reemplazamos la contraseña plana por la encriptada
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('usuario', usuarioSchema);