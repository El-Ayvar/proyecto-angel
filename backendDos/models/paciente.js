const mongoose = require('mongoose');

const pacienteSchema = new mongoose.Schema({
    // aqui hacemos una relación 1 a 1 con la cuenta de Usuario (para nombre, email, password)
    usuario: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'usuario', 
        required: true,
        unique: true // Un usuario solo puede tener un expediente clínico
    },
    fechaNacimiento: { type: Date, required: true },
    telefonoEmergencia: { type: String },
    telefono: { type: String }, //recuerda quitarlo, o no se si añadirlo, espues veo que le hago
    direccion: { type: String }, //este mismo caso que en telefono
    tipoSangre: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    alergias: [{ type: String }], // Array de textos: ["Penicilina", "Látex"]
    enfermedadesCronicas: [{ type: String }], // ["Diabetes", "Hipertensión"]
    medicacionActual: { type: String, default: "Ninguna" },
    historialNotas: [{
        fecha: { type: Date, default: Date.now },
        nota: { type: String, required: true },
        asistio: { type: Boolean, default: true }// para marcar si se realizó la cita o no
    }]
}, { timestamps: true });

module.exports = mongoose.model('Paciente', pacienteSchema);