//const express = require('express');
//const router = express.Router();
//const { crearPaciente, listarPacientes } = require('../controladores/pacienteController');
//const { verificarToken } = require('../middleware/auth');
//
//router.post('/', verificarToken, crearPaciente);
//router.get('/', verificarToken, listarPacientes);
//
//module.exports = router;

const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/verificarToken');
const { obtenerPerfilPaciente } = require('../controllers/authController');

router.get('/perfil', verificarToken, obtenerPerfilPaciente);

module.exports = router;