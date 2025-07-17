const express = require('express');
const router = express.Router();
const {
  agregarProcedimiento,
  obtenerHistorial,
} = require('../controladores/procedimientoController');
const { verificarToken } = require('../middleware/auth');

router.post('/', verificarToken, agregarProcedimiento);
router.get('/:id', verificarToken, obtenerHistorial);

module.exports = router;