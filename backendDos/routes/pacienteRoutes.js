const express = require('express');
const router = express.Router();
const pacienteController = require('../controllers/pacienteController');
const auth = require('../middleware/authMiddleware'); 
const verificarRol = require('../middleware/rolMiddleware'); 

// --- RUTAS DE BÚSQUEDA Y PERFIL PROPIO ---
router.get('/mi-perfil', auth, pacienteController.obtenerMiPerfil);
router.get('/buscar', auth, pacienteController.buscarPacientes);

// --- RUTAS DE GESTIÓN (Lista y Papelera) ---
router.get('/', [auth, verificarRol('odontologo', 'admin', 'asistente')], pacienteController.obtenerTodosLosPacientes);
router.post('/papelera/:id', [auth, verificarRol('admin')], pacienteController.accionPapelera);

// --- RUTAS POR ID Y EXPEDIENTE ---
router.get('/:idPaciente/expediente', [auth, verificarRol('odontologo', 'admin', 'asistente')], pacienteController.obtenerExpedienteCompleto);
router.post('/:id/notas', auth, pacienteController.agregarNotaHistorial);
router.put('/actualizar', auth, pacienteController.actualizarPerfil);

// --- ELIMINAR PACIENTE ---
router.delete('/:id', [auth, verificarRol('odontologo', 'admin')], pacienteController.eliminarPaciente);

module.exports = router;