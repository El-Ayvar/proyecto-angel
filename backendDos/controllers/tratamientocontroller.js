const Tratamiento = require('../models/tratamiento');
const Paciente = require('../models/paciente');

// Crear un nuevo tratamiento para un paciente
exports.crearTratamiento = async (req, res) => {
    try {
        const { paciente, nombre, diente, costo, notasClinicas } = req.body;

        // 1. Verificar que el paciente exista en la base de datos
        const existePaciente = await Paciente.findById(paciente);
        if (!existePaciente) {
            return res.status(404).json({ msg: "El paciente no existe" });
        }

        // 2. Crear el tratamiento
        const nuevoTratamiento = new Tratamiento({
            paciente,
            odontologo: req.user.id, // El ID viene del token del dentista
            nombre,
            diente,
            costo,
            notasClinicas
        });

        await nuevoTratamiento.save();

        res.status(201).json({
            msg: "Tratamiento registrado con éxito",
            tratamiento: nuevoTratamiento
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al registrar el tratamiento" });
    }
};

// Actualizar el estado (de planeado a completado)
exports.actualizarEstadoTratamiento = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        const tratamiento = await Tratamiento.findByIdAndUpdate(
            id,
            { estado },
            { new: true }
        );

        if (!tratamiento) {
            return res.status(404).json({ msg: "Tratamiento no encontrado" });
        }

        res.json({ msg: "Estado del tratamiento actualizado", tratamiento });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al actualizar tratamiento" });
    }
};