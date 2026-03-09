const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// registro: POST /api/auth/register
router.post('/register', authController.registrarPaciente);

// login: POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;