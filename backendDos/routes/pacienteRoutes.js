const express = require('express');
const router = express.Router();
const pacienteController = require('../controllers/pacienteController');
const auth = require('../middleware/authMiddleware'); // Nuestro guardia de seguridad
const verificarRol = require('../middleware/rolMiddleware'); // Middleware para verificar rol
// ==========================================
// RUTAS PARA EL PACIENTE (Dueño de la cuenta)
// ==========================================

// 1. Obtener su propio perfil 
// No pasamos un ID en la URL (/perfil/:id) por seguridad. 
// El ID lo sacamos del Token adentro del controlador.
router.get('/mi-perfil', auth, pacienteController.obtenerMiPerfil);

// 2. Actualizar sus propios datos (teléfono, dirección)
router.put('/actualizar', auth, pacienteController.actualizarPerfil);


// ==========================================
// RUTAS PARA EL DENTISTA / RECEPCIÓN
// ==========================================

// 3. Obtener la lista de TODOS los pacientes
// ¡OJO! Aquí más adelante necesitaremos un middleware extra para 
// asegurar que solo el 'odontologo' pueda usar esta ruta.
router.get('/', auth, pacienteController.obtenerTodosLosPacientes);

// 4. Ver el expediente/historial clínico de un paciente específico
router.get('/:id', auth, pacienteController.obtenerExpedienteCompleto);

// 5. Agregar notas al historial de un paciente
router.post('/:id/historial', auth, pacienteController.agregarNotaHistorial);

// Solo los dentistas o admins pueden ver a todos los pacientes
router.get('/', auth, verificarRol('odontologo', 'admin'), pacienteController.obtenerTodosLosPacientes);

// ==========================================
// ZONA DEL PACIENTE
// ==========================================

// GET /api/pacientes/mi-perfil
// El paciente consulta su propio expediente usando su token
router.get('/mi-perfil', auth, pacienteController.obtenerMiPerfil);


// ==========================================
// ZONA DEL PERSONAL MÉDICO (Protegida por Roles)
// ==========================================

// GET /api/pacientes
// El doctor o recepcionista ve la lista de todos los pacientes
router.get('/', [auth, verificarRol('odontologo', 'admin')], pacienteController.obtenerTodosLosPacientes);

// GET /api/pacientes/:idPaciente/expediente
// El doctor entra al detalle clínico de una persona específica
router.get('/:idPaciente/expediente', [auth, verificarRol('odontologo', 'admin')], pacienteController.obtenerExpedienteCompleto);

module.exports = router;