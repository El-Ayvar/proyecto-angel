const db = require('../db/db');
const bcrypt = require('bcrypt');

const registrarUsuario = async (req, res) => {
  const { nombre, correo, contrasena } = req.body;

  try {
    const hash = await bcrypt.hash(contrasena, 10);

    db.query(
      'INSERT INTO usuarios (nombre, correo, contrasena_hashed) VALUES (?, ?, ?)',
      [nombre, correo, hash],
      (err, resultado) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: '✅ Usuario registrado correctamente' });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar' });
  }
};

module.exports = { registrarUsuario };