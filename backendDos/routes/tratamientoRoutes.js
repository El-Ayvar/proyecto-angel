const express = require('express');
const router = express.Router();

const tratamientoController = require('../controllers/tratamientoController');
const auth = require('../middleware/authMiddleware');
const verificarRol = require('../middleware/rolMiddleware');

// aqui el dentista registra una nueva limpieza, extracción, etc., a un paciente
router.post('/', [auth, verificarRol('odontologo', 'admin')], tratamientoController.crearTratamiento);

// aqui el dentista marca un tratamiento que estaba "planeado" como "completado"
router.patch('/:id/estado', [auth, verificarRol('odontologo', 'admin')], tratamientoController.actualizarEstadoTratamiento);

module.exports = router;