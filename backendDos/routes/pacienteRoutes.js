const express = require('express');
const router = express.Router();
const pacienteController = require('../controllers/pacienteController');
const auth = require('../middleware/authMiddleware'); 
const verificarRol = require('../middleware/rolMiddleware'); 

// --- RUTAS DE BÚSQUEDA Y PERFIL PROPIO (Prioridad Alta) ---
router.get('/mi-perfil', auth, pacienteController.obtenerMiPerfil);
router.get('/buscar', auth, pacienteController.buscarPacientes);

// --- RUTAS DE GESTIÓN (Solo Odontólogo/Admin) ---
// Esta es la ruta que usa el botón "Ver Todos"
router.get('/', [auth, verificarRol('odontologo', 'admin')], pacienteController.obtenerTodosLosPacientes);

// --- RUTAS POR ID (Deben ir al final) ---
router.get('/:idPaciente/expediente', [auth, verificarRol('odontologo', 'admin')], pacienteController.obtenerExpedienteCompleto);
router.post('/:id/notas', auth, pacienteController.agregarNotaHistorial);
router.put('/actualizar', auth, pacienteController.actualizarPerfil);

// Ruta para eliminar un paciente (admin u odontologo)
router.delete('/:id', [auth, verificarRol('odontologo', 'admin')], pacienteController.eliminarPaciente);
// esos comentarios los vi en otro codigo y seveian chidos

module.exports = router;