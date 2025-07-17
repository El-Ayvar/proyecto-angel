const express = require('express');
const router = express.Router();
const { registrarUsuario, loginUsuario, obtenerPerfilPaciente } = require('../controladores/authController');

router.post('/registro', registrarUsuario);
router.post('/login', loginUsuario);
router.get('/paciente/perfil', obtenerPerfilPaciente);

module.exports = router;