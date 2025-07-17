const db = require('../db/db');

const agregarProcedimiento = (req, res) => {
  const { paciente_id, tipo, fecha, notas, archivo_url } = req.body;
  db.query(
    'INSERT INTO procedimientos (paciente_id, tipo, fecha, notas, archivo_url) VALUES (?, ?, ?, ?, ?)',
    [paciente_id, tipo, fecha, notas, archivo_url],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ mensaje: 'Procedimiento registrado' });
    }
  );
};

const obtenerHistorial = (req, res) => {
  const { id } = req.params;
  db.query(
    'SELECT * FROM procedimientos WHERE paciente_id = ?',
    [id],
    (err, resultados) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(resultados);
    }
  );
};

module.exports = { agregarProcedimiento, obtenerHistorial };