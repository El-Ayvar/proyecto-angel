const mongoose = require('mongoose');

const citaSchema = new mongoose.Schema({
    paciente: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Paciente', 
        required: true 
    },
    fecha: { 
        type: Date, 
        required: true 
    },
    motivo: { 
        type: String, 
        required: true 
    },
    // añadimos 'confirmada' al enum para que coincida con la acción del correo
    estado: { 
        type: String, 
        enum: ['pendiente', 'confirmada', 'completada', 'cancelada'], 
        default: 'pendiente' 
    },
    // esta seccion nueva: Aquí se guardará el Triage médico
    datosMedicos: {
        tipoSangre: { type: String, default: 'Desconocido' },
        alergias: { type: String, default: 'Ninguna' },
        enfermedadCronica: { type: String, default: 'Ninguna' },
        medicacion: { type: String, default: 'Ninguna' }
    }
}, { timestamps: true }); // esta opcion opcional vea jaja: añade fecha de creación y actualización automáticamente

module.exports = mongoose.model('cita', citaSchema);