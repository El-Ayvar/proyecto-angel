const db = require('../db/db');

const agendarCita = (req, res) => {
  const { paciente_id, fecha_cita, motivo } = req.body;
  db.query(
    'INSERT INTO citas (paciente_id, fecha_cita, motivo) VALUES (?, ?, ?)',
    [paciente_id, fecha_cita, motivo],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ mensaje: 'Cita agendada' });
    }
  );
};

const listarCitas = (req, res) => {
  db.query('SELECT * FROM citas', (err, resultados) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(resultados);
  });
};

module.exports = { agendarCita, listarCitas };