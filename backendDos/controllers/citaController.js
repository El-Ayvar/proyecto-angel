const Cita = require('../models/cita.js');
const Paciente = require('../models/paciente.js');
const Usuario = require('../models/usuario.js');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // de aqui saco el correo del .env
        pass: process.env.EMAIL_PASS // aqui como el correo pero con la ontraseña
    },
    tls: {
        rejectUnauthorized: false
    }
});

// 1. Crear una nueva cita (Paciente agendando)
exports.crearCita = async (req, res) => {
    try {
        let { fecha, motivo, odontologo, datosMedicosPreventivos } = req.body;
        const usuarioId = req.user.id; 

        // Obtener datos del usuario (nombre para el correo)
        const usuario = await Usuario.findById(usuarioId);
        const nombrePaciente = usuario?.nombre || 'Paciente';

        // Si no se proporciona odontólogo, asignar al único doctor disponible
        if (!odontologo) {
            const primerDoctor = await Usuario.findOne({ rol: 'odontologo' });
            if (!primerDoctor) {
                return res.status(400).json({ msg: "No hay odontólogos disponibles en este momento" });
            }
            odontologo = primerDoctor._id;
        }

        // Verificación de disponibilidad
        const citaOcupada = await Cita.findOne({ fecha, odontologo });
        if (citaOcupada) {
            return res.status(400).json({ 
                msg: "El odontólogo ya tiene una cita programada para esa hora." 
            });
        }

        // Validación segura de datos médicos por si llegan vacíos desde el frontend
        const infoMedica = datosMedicosPreventivos || {
            tipoSangre: 'No especificado',
            alergias: 'Ninguna',
            enfermedadCronica: 'Ninguna',
            medicacion: 'Ninguna'
        };

        // Encontrar el expediente de paciente para guardar su _id (la referencia en Cita es a Paciente)
        const pacienteDoc = await Paciente.findOne({ usuario: usuarioId });
        if (!pacienteDoc) {
            return res.status(400).json({ msg: 'No existe expediente de paciente para este usuario' });
        }

        // Crear instancia y guardar (referenciando al documento Paciente)
        const nuevaCita = new Cita({
            paciente: pacienteDoc._id,
            fecha,
            motivo,
            odontologo,
            estado: 'pendiente',
            datosMedicos: infoMedica 
        });

        await nuevaCita.save();

        // Enlaces para el correo (Verifica que el puerto 3000 sea el de tu backend)
        const urlAceptar = `http://localhost:3000/api/citas/confirmar/${nuevaCita._id}?accion=confirmada`;
        const urlRechazar = `http://localhost:3000/api/citas/confirmar/${nuevaCita._id}?accion=cancelada`;

//===============================================================================================================================================================================
//  AQUI ESTOY HACIENDO UTILIZACION DE LOS ESTILOS EN EL JS, YA QUE NO CUENTA CON SU PROPCIO SCSS, CLARO QUE LE HARIA PERO ME DA UNA HUEVA, Y ASI LO VI EN CODIGO DE UN PORTUGUES
//===============================================================================================================================================================================


        const mailOptions = {
            from: `AyvarDent <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: `Nueva Solicitud de Cita: ${motivo}`,
            html: `
                <style>
                    .button-container {
                        display: flex;
                        justify-content: center;
                        gap: 10px;
                        margin-top: 30px;
                    }
                    @media (max-width: 600px) {
                        .button-container {
                            flex-direction: column;
                            align-items: center;
                        }
                    }
                </style>
                <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px;">
                    <h2 style="color: #2c3e50;">🦷 Nueva Solicitud de Cita</h2>
                    <p><strong>Paciente:</strong> ${nombrePaciente}</p>
                    <p><strong>Procedimiento:</strong> ${motivo}</p>
                    <p><strong>Fecha solicitada:</strong> ${new Date(fecha).toLocaleString()}</p>
                    <hr>
                    <h3 style="color: #e67e22;">⚠️ Ficha Médica de Triage:</h3>
                    <ul style="list-style: none; padding: 0;">
                        <li><strong>🩸 Tipo de Sangre:</strong> ${infoMedica.tipoSangre}</li>
                        <li><strong>🚫 Alergias:</strong> ${infoMedica.alergias}</li>
                        <li><strong>🏥 Enf. Crónicas:</strong> ${infoMedica.enfermedadCronica}</li>
                        <li><strong>💊 Medicación:</strong> ${infoMedica.medicacion}</li>
                    </ul>
                    <div class="button-container">
                        <a href="${urlAceptar}" style="background-color: #27ae60; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">ACEPTAR CITA</a>
                        <a href="${urlRechazar}" style="background-color: #c0392b; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">RECHAZAR</a>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(201).json({ msg: "Solicitud enviada. El doctor revisará tu ficha médica.", cita: nuevaCita });

    } catch (error) {
        console.error("Error en crearCita:", error);
        res.status(500).json({ msg: "Error al procesar la cita" });
    }
};

// 2. Obtener SOLO las citas del paciente logueado
exports.obtenerMisCitas = async (req, res) => {
    try {
        const usuarioId = req.user.id;

        // Encontrar el paciente asociado a este usuario
        const paciente = await Paciente.findOne({ usuario: usuarioId });
        if (!paciente) {
            return res.status(404).json({ msg: "Expediente de paciente no encontrado" });
        }

        // Obtener citas de este paciente
        const citas = await Cita.find({ paciente: paciente._id })
            .populate({
                path: 'paciente',
                populate: { path: 'usuario', select: 'nombre email' }
            })
            .sort({ fecha: -1 }); // Más recientes primero

        res.json(citas);
    } catch (error) {
        console.error("Error en obtenerMisCitas:", error);
        res.status(500).json({ msg: "Error al obtener las citas" });
    }
};

// 3. Obtener citas (Vista general para el Doctor)
exports.obtenerCitas = async (req, res) => {
    try {
        const citas = await Cita.find()
            .populate({
                path: 'paciente',
                populate: { path: 'usuario', select: 'nombre email' }
            })
            .sort({ fecha: 1 }); 

        res.json(citas);
    } catch (error) {
        console.error("Error en obtenerCitas:", error);
        res.status(500).json({ msg: "Error al obtener las citas" });
    }
};

// 3. Actualizar estado de la cita (Confirmar/Cancelar)
exports.actualizarEstadoCita = async (req, res) => {
    try {
        const { id } = req.params; 
        const { nuevoEstado } = req.body; 

        const estadosValidos = ['confirmada', 'cancelada', 'completada'];
        if (!estadosValidos.includes(nuevoEstado)) {
            return res.status(400).json({ msg: "Estado no válido" });
        }

        const cita = await Cita.findByIdAndUpdate(
            id, 
            { estado: nuevoEstado }, 
            { new: true } 
        )
        .populate({
            path: 'paciente',
            populate: { path: 'usuario', select: 'nombre email' }
        });

        if (!cita) {
            return res.status(404).json({ msg: "Cita no encontrada" });
        }

        res.json({
            msg: `La cita ha sido ${nuevoEstado} correctamente`,
            cita
        });

    } catch (error) {
        console.error("Error en actualizarEstadoCita:", error);
        res.status(500).json({ msg: "Error al actualizar el estado" });
    }
};

// Función para procesar el clic desde el correo (Aceptar/Rechazar)
exports.confirmarCitaDesdeCorreo = async (req, res) => {
    try {
        const { id } = req.params; // El ID de la cita
        const { accion } = req.query; // 'confirmada' o 'cancelada'

        // Buscamos la cita y actualizamos su estado
        const citaActualizada = await Cita.findByIdAndUpdate(
            id,
            { estado: accion },
            { new: true }
        );

        if (!citaActualizada) {
            return res.status(404).send('<h1>Error: Cita no encontrada</h1>');
        }

        // Enviamos una respuesta visual al doctor
        res.send(`
            <div style="text-align:center; font-family:sans-serif; margin-top:50px;">
                <h1 style="color: #2c3e50;">¡Acción Procesada!</h1>
                <p>La cita ha sido marcada como: <strong>${accion.toUpperCase()}</strong></p>
                <p>Ya puedes cerrar esta pestaña.</p>
            </div>
        `);
    } catch (error) {
        console.error(error);
        res.status(500).send('<h1>Error al procesar la respuesta</h1>');
    }
};

//HICIMIOS UTILIZACION DE IA PARA COMENTAR, IGUAL BORRE COMENTARIOSDE MAS Y ACTUALICE UNOS QUE SI ETSBAN BIEN, TODO NICE