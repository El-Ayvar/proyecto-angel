const Paciente = require('../models/paciente');
const Tratamiento = require('../models/tratamiento');
const Usuario = require('../models/usuario');

// ====================================================
// VISTA DEL PACIENTE
// ====================================================

// 1. Obtener su propio perfil médico
exports.obtenerMiPerfil = async (req, res) => {
    try {
        // req.user.id viene del token. Buscamos el expediente que coincida.
        const expediente = await Paciente.findOne({ usuario: req.user.id })
            .populate('usuario', 'nombre email'); // Traemos el nombre y correo

        if (!expediente) {
            return res.status(404).json({ msg: "Expediente no encontrado" });
        }

        res.json(expediente);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener el perfil" });
    }
};

// ====================================================
// VISTAS DEL DOCTOR / ADMIN
// ====================================================

// 2. Obtener la lista de todos los pacientes (Para la agenda/recepción)
exports.obtenerTodosLosPacientes = async (req, res) => {
    try {
        const pacientes = await Paciente.find()
            .populate('usuario', 'nombre email')
            .sort({ createdAt: -1 }); // Los más recientes primero

        res.json(pacientes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener la lista de pacientes" });
    }
};

// 3. Obtener el expediente completo + tratamientos (La vista principal del consultorio)
exports.obtenerExpedienteCompleto = async (req, res) => {
    try {
        const { idPaciente } = req.params;

        // Buscamos el expediente base
        const paciente = await Paciente.findById(idPaciente)
            .populate('usuario', 'nombre email');

        if (!paciente) {
            return res.status(404).json({ msg: "Paciente no encontrado" });
        }

        // Buscamos todos los tratamientos que se le han hecho a este paciente
        const tratamientos = await Tratamiento.find({ paciente: idPaciente })
            .populate('odontologo', 'nombre') // Traemos el nombre del doctor que lo atendió
            .sort({ createdAt: -1 });

        // Devolvemos un JSON unificado al frontend
        res.json({
            datosPersonales: paciente.usuario,
            historialMedico: paciente,
            tratamientos: tratamientos
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener el expediente" });
    }
};

// Actualizar datos del perfil del paciente
exports.actualizarPerfil = async (req, res) => {
    try {
        const { telefono, direccion, fechaNacimiento, alergias, tipoSangre } = req.body;
        
        // Buscamos el expediente usando el ID del usuario que viene en el token
        const paciente = await Paciente.findOneAndUpdate(
            { usuario: req.user.id },
            { 
                $set: { 
                    telefono, 
                    direccion, 
                    fechaNacimiento, 
                    alergias,
                    tipoSangre,
                    enfermedadesCronicas: req.body.enfermedadesCronicas || paciente.enfermedadesCronicas, // Si no envían enfermedades, mantenemos las que ya tenía
                    medicacionActual: req.body.medicacionActual || paciente.medicacionActual} 
            },
            { new: true, runValidators: true }
        )
        .populate('usuario', 'nombre email');

        if (!paciente) {
            return res.status(404).json({ msg: "No se encontró el expediente del paciente" });
        }

        res.json({ msg: "Perfil actualizado correctamente", paciente });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al actualizar el perfil" });
    }
};

exports.agregarNotaHistorial = async (req, res) => {
    try {
        res.json({ msg: "Función de notas aún en construcción" });
    } catch (error) {
        res.status(500).json({ msg: "Error de servidor" });
    }
};

// Asegúrate de que esta también esté (por si la línea 29 fallaba antes)
exports.obtenerExpediente = async (req, res) => {
    try {
        res.json({ msg: "Función de expediente aún en construcción" });
    } catch (error) {
        res.status(500).json({ msg: "Error de servidor" });
    }
};