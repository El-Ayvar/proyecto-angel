const Paciente = require('../models/paciente');
const Tratamiento = require('../models/tratamiento');
const Usuario = require('../models/usuario');
const Cita = require('../models/cita');

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

// OBTENER TODOS LOS PACIENTES (Con filtro de roles y status)
exports.obtenerTodosLosPacientes = async (req, res) => {
    try {
        const pacientes = await Paciente.find()
            .populate('usuario', 'nombre email rol status') 
            .sort({ createdAt: -1 });

        // Filtrado por seguridad y roles
        const filtrados = pacientes.filter(p => {
            if (!p.usuario) return false;
            
            // Manejo de datos antiguos: si no tiene status, es 'activo'
            const estado = p.usuario.status || 'activo';

            if (req.user.rol === 'admin') {
                return true; // El administrador ve todo, incluyendo la papelera
            } else {
                return estado === 'activo'; // Odontólogos y Asistentes solo ven los activos
            }
        });

        res.json(filtrados);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener la lista de pacientes" });
    }
};

// ELIMINAR PACIENTE (Soft Delete / Papelera)
exports.eliminarPaciente = async (req, res) => {
    try {
        const { id } = req.params;
        const paciente = await Paciente.findById(id).populate('usuario');
        
        if (!paciente) return res.status(404).json({ msg: "Paciente no encontrado" });

        // REGLA: Un odontólogo no puede eliminar a otro odontólogo
        if (req.user.rol === 'odontologo' && paciente.usuario.rol === 'odontologo') {
            return res.status(403).json({ msg: "No tienes permisos para eliminar a otro doctor" });
        }

        // En lugar de borrar, marcamos el usuario asociado como eliminado temporal
        await Usuario.findByIdAndUpdate(paciente.usuario._id, { status: 'eliminado_temporal' });

        res.json({ msg: "Paciente movido a la papelera (Solo el Admin puede verlo ahora)" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al procesar la eliminación" });
    }
};

// ACCIONES DE PAPELERA (Solo para Admin)
exports.accionPapelera = async (req, res) => {
    try {
        const { id } = req.params; // ID del Usuario asociado
        const { accion } = req.body; // 'restaurar' o 'borrar_definitivo'

        if (accion === 'restaurar') {
            await Usuario.findByIdAndUpdate(id, { status: 'activo' });
            res.json({ msg: "Registro restaurado con éxito" });
        } else if (accion === 'borrar_definitivo') {
            const paciente = await Paciente.findOne({ usuario: id });
            if (paciente) await Paciente.findByIdAndDelete(paciente._id);
            await Usuario.findByIdAndDelete(id);
            res.json({ msg: "Registro eliminado permanentemente de la base de datos" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error en la operación de papelera" });
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

        // Buscamos todos los tratamientos
        const tratamientos = await Tratamiento.find({ paciente: idPaciente })
            .populate('odontologo', 'nombre')
            .sort({ createdAt: -1 });

        // NUEVO: Buscamos todas las CITAS de este paciente
        const citas = await Cita.find({ paciente: idPaciente })
            .sort({ fecha: -1 }); // Las ordenamos de la más reciente a la más vieja

        // Devolvemos todo unificado
        res.json({
            datosPersonales: paciente.usuario,
            historialMedico: paciente,
            tratamientos: tratamientos,
            citas: citas // <-- Ahora mandamos las citas al frontend
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

// aqui obtenemos exapediente
exports.obtenerExpediente = async (req, res) => {
    try {
        res.json({ msg: "Función de expediente aún en construcción" });
    } catch (error) {
        res.status(500).json({ msg: "Error de servidor" });
    }
};

exports.buscarPacientes = async (req, res) => {
    try {
        const { term } = req.query;
        if (!term) return res.json([]);

        // Busca pacientes y trae los datos de 'usuario' para ver el nombre
        const pacientes = await Paciente.find().populate({
            path: 'usuario',
            match: { nombre: { $regex: term, $options: 'i' } }, // Búsqueda insensible a mayúsculas
            select: 'nombre email'
        });

        // Filtra los que no coincidieron
        const resultados = pacientes.filter(p => p.usuario !== null);
        res.json(resultados);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al buscar pacientes" });
    }
};

// 2. Agregar una nueva nota al expediente
exports.agregarNotaHistorial = async (req, res) => {
    try {
        const { id } = req.params; // ID del paciente
        const { nota, asistio } = req.body;

        const paciente = await Paciente.findById(id);
        if (!paciente) return res.status(404).json({ msg: "Paciente no encontrado" });

        // Empujamos la nueva nota al array del historial
        paciente.historialNotas.push({ nota, asistio });
        await paciente.save();

        res.json({ msg: "Nota agregada al expediente correctamente", historial: paciente.historialNotas });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al guardar la nota" });
    }
};

// Controlador para eliminar un paciente (admin u odontologo)
exports.eliminarPaciente = async (req, res) => {
    try {
        const { id } = req.params; // ID del paciente a eliminar

        // Primero, obtener el paciente para saber qué usuario eliminar
        const paciente = await Paciente.findById(id);
        if (!paciente) return res.status(404).json({ msg: "Paciente no encontrado" });

        const usuarioId = paciente.usuario; // Obtener el ID del usuario asociado

        // Eliminar el paciente
        await Paciente.findByIdAndDelete(id);

        // Eliminar el usuario asociado
        if (usuarioId) {
            await Usuario.findByIdAndDelete(usuarioId);
        }

        res.json({ msg: "Paciente y usuario eliminados correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al eliminar el paciente" });
    }
};

//============================================================================================
// aqui comentamos con ayuda de la ia, salio todo bien y agregamos y quitamos cosas que no son
//============================================================================================