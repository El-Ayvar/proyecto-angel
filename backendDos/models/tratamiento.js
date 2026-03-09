const mongoose = require('mongoose');

const tratamientoSchema = new mongoose.Schema({
    paciente: { type: mongoose.Schema.Types.ObjectId, ref: 'paciente', required: true },
    odontologo: { type: mongoose.Schema.Types.ObjectId, ref: 'usuario', required: true },
    // aqui agregamos el nombre del procedimiento (ej. "Endodoncia", "Limpieza", "Extracción")
    nombre: { type: String, required: true },
    // aqui ponemos el número de diente según el sistema FDI (11 al 48 para adultos). 
    // esto lo dejamos opcional porque una "Limpieza general" no es de un solo diente.
    diente: { type: Number, min: 11, max: 85 }, 
    costo: { type: Number, required: true },
    estado: { 
        type: String, 
        enum: ['planeado', 'en curso', 'completado'], // esto aparece en los procedimientos del paciente y esto como lo hagarro, aqui ya encontre un error, no tengo donde escojer esto, actualizacion del dia 8/03/26, creo que lo dejare asi, no lo ocupo, al final el doctor agregara el precio y el diente cuando ya fue realizado
        default: 'planeado' 
    },
    notasClinicas: { type: String } //las notas que aparecen salen de aqui
}, { timestamps: true });

module.exports = mongoose.model('Tratamiento', tratamientoSchema);