const Tratamiento = require('../models/tratamiento');
const Paciente = require('../models/paciente');

// Crear un nuevo tratamiento para un paciente
exports.crearTratamiento = async (req, res) => {
    try {
        const { paciente, nombre, diente, costo, notasClinicas } = req.body;

        // 1. Verificar que el paciente exista en la base de datos
        const existePaciente = await Paciente.findById(paciente); // question, sabre despues si era finId o finByID, actualizacion 08/03/26, aun no me genera conflicto :)
        if (!existePaciente) {
            return res.status(404).json({ msg: "El paciente no existe" });
        }

        // 2. Crear el tratamiento
        const nuevoTratamiento = new Tratamiento({
            paciente,
            odontologo: req.user.id, // aqui vi que se toma el ID que viene del token del dentista
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

// aqui se actualiza el estado actualizar el estado (de planeado a completado), actualizacion de 08/03/26, esto es junto con el modelo de tratamiento
// -------------------------------
// ¿SE OCUPA? ¡¡¡¡¡NO LO SEEE!!!!!
// -------------------------------
//-----------------------------------------
// ¿FUNCIONAA? ¡¡¡SIII, PERO NO SE OCUPA!!!
//-----------------------------------------
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