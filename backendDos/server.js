const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const citasRoutes = require('./routes/citaRoutes');
const pacienteRoutes = require('./routes/pacienteRoutes');
const tratamientoRoutes = require('./routes/tratamientoRoutes');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

connectDB();

// CORS explícito para aceptar requests desde cualquier origen
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: false
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/pacientes', pacienteRoutes);
app.use('/api/tratamientos', tratamientoRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {console.log(`Servidor corriendo en puerto ${PORT}`)});