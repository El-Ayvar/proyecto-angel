const mongoose = require('mongoose');

const tratamientoSchema = new mongoose.Schema({
    paciente: { type: mongoose.Schema.Types.ObjectId, ref: 'paciente', required: true },
    odontologo: { type: mongoose.Schema.Types.ObjectId, ref: 'usuario', required: true },
    // El nombre del procedimiento (ej. "Endodoncia", "Limpieza", "Extracción")
    nombre: { type: String, required: true },
    // Número de diente según el sistema FDI (11 al 48 para adultos). 
    // Lo dejamos opcional porque una "Limpieza general" no es de un solo diente.
    diente: { type: Number, min: 11, max: 85 }, 
    costo: { type: Number, required: true },
    estado: { 
        type: String, 
        enum: ['planeado', 'en curso', 'completado'], 
        default: 'planeado' 
    },
    notasClinicas: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Tratamiento', tratamientoSchema);