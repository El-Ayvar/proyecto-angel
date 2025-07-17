const express = require('express');
const router = express.Router();
const { agendarCita, listarCitas } = require('../controladores/citaController');
const { verificarToken } = require('../middleware/auth');

router.post('/', verificarToken, agendarCita);
router.get('/', verificarToken, listarCitas);

module.exports = router;