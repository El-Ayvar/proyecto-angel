const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const validarCita = require('../middleware/validarCita');
const verificarRol = require('../middleware/rolMiddleware');
const citaController = require('../controllers/citaController');

// ruta para que el paciente obtenga SOLO SUS CITAS
router.get('/mis-citas', auth, citaController.obtenerMisCitas);

// ruta para crear cita
router.post('/agendar', [auth, validarCita], citaController.crearCita);

// ruta para confirmar/cancelar desde correo (sin autenticación)
router.get('/confirmar/:id', citaController.confirmarCitaDesdeCorreo);

// ruta para que doctor actualice estado de cita
router.patch('/estado/:id', [auth, verificarRol('odontologo', 'admin')], citaController.actualizarEstadoCita);

// ruta para que doctor vea todas las citas
router.get('/', [auth, verificarRol('odontologo')], citaController.obtenerCitas);

module.exports = router;