const db = require('../db/db');

const crearPaciente = (req, res) => {
  const { nombre, correo, telefono } = req.body;
  db.query(
    'INSERT INTO pacientes (nombre, correo, telefono) VALUES (?, ?, ?)',
    [nombre, correo, telefono],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ mensaje: 'Paciente registrado' });
    }
  );
};

const listarPacientes = (req, res) => {
  db.query('SELECT * FROM pacientes', (err, resultados) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(resultados);
  });
};

module.exports = { crearPaciente, listarPacientes };