const express = require('express');
const router = express.Router();

const tratamientoController = require('../controllers/tratamientoController');
const auth = require('../middleware/authMiddleware');
const verificarRol = require('../middleware/rolMiddleware');

// POST /api/tratamientos
// El dentista registra una nueva limpieza, extracción, etc., a un paciente
router.post('/', [auth, verificarRol('odontologo', 'admin')], tratamientoController.crearTratamiento);

// PATCH /api/tratamientos/:id/estado
// El dentista marca un tratamiento que estaba "planeado" como "completado"
router.patch('/:id/estado', [auth, verificarRol('odontologo', 'admin')], tratamientoController.actualizarEstadoTratamiento);

module.exports = router;