//const authRoutes = require('./routes/authRoutes');
//app.use('/api', authRoutes);
//
//
//// server.js
//require('dotenv').config();
//const express = require('express');
//const cors = require('cors');
//const db = require('./db/db');
//
//const app = express();
//app.use(cors());
//app.use(express.json());
//
//// Ruta de prueba
//app.get('/', (req, res) => {
//  res.send('🦷 AyvarDent está vivo y listo');
//});
//
//// Servidor
//const PORT = process.env.PORT || 3000;
//app.listen(PORT, () => {
//  console.log(`✅ Servidor clínico en http://localhost:${PORT}`);
//});
//
//const { registrarUsuario } = require('./controllers/authController');
//
//app.post('/api/registro', registrarUsuario);



require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Rutas
const authRoutes = require('./rutas/authRoutes');
const pacienteRoutes = require('./rutas/pacienteRoutes');
const procedimientoRoutes = require('./rutas/procedimientoRoutes');
const citaRoutes = require('./rutas/citaRoutes');

app.use('/api', authRoutes);
app.use('/api/pacientes', pacienteRoutes);
app.use('/api/procedimientos', procedimientoRoutes);
app.use('/api/citas', citaRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.send('🦷 AyvarDent Backend activo');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor clínico en http://localhost:${PORT}`);
});