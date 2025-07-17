const pool = require('../db/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Registro
const registrarUsuario = async (req, res) => {
  const { nombre, correo, contrasena, rol } = req.body;

  // Validación básica
  if (!nombre || !correo || !contrasena) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const hash = await bcrypt.hash(contrasena, 10);

    pool.query(
    'INSERT INTO usuarios (nombre, correo, contrasena_hashed, rol) VALUES (?, ?, ?, ?)',
    [nombre, correo, hash, rol || 'paciente'],
    (err) => {
      if (err) {
        console.error('❌ Error MySQL en registro:', err);

        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ error: 'El correo ya está registrado' });
        }

        const mensaje = typeof err.message === 'string' && err.message.trim() !== ''
          ? err.message
          : `Error MySQL sin mensaje definido (código: ${err.code || 'desconocido'})`;

        return res.status(500).json({ error: mensaje });
      }

      res.status(201).json({ mensaje: 'Usuario registrado correctamente' });
    }
  );

  } catch (error) {
    console.error('⚠️ ERROR en el registro (catch):', error);

    const mensaje = error.message && error.message.trim() !== ''
      ? error.message
      : 'Error inesperado en el servidor';

    res.status(500).json({ error: mensaje });
  }
};

// Login
const loginUsuario = (req, res) => {
  const { correo, contrasena } = req.body;

  pool.query(
    'SELECT * FROM usuarios WHERE correo = ?',
    [correo],
    async (err, resultados) => {
      if (err || resultados.length === 0) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const usuario = resultados[0];
      const coincide = await bcrypt.compare(contrasena, usuario.contrasena_hashed);

      if (!coincide) {
        return res.status(401).json({ error: 'Contraseña incorrecta' });
      }

      const token = jwt.sign(
        { id: usuario.id, rol: usuario.rol },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );

      res.json({ mensaje: 'Login exitoso', token });
    }
  );
};

const obtenerPerfilPaciente = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token faltante' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const idPaciente = decoded.id;

    pool.query(
      'SELECT nombre, correo, rol FROM usuarios WHERE id = ?',
      [idPaciente],
      (err, resultados) => {
        if (err || resultados.length === 0) {
          return res.status(404).json({ error: 'Paciente no encontrado' });
        }

        const paciente = resultados[0];

        pool.query(
          'SELECT nombre, descripcion, fecha FROM procedimientos WHERE paciente_id = ? ORDER BY fecha DESC',
          [idPaciente],
          (err2, procedimientos) => {
            if (err2) return res.status(500).json({ error: 'Error al obtener procedimientos' });

            res.json({ ...paciente, procedimientos });
          }
        );
      }
    );
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};


module.exports = {
  registrarUsuario,
  loginUsuario,
  obtenerPerfilPaciente
};
