-- Crear base de datos
CREATE DATABASE IF NOT EXISTS ayvardent_db;
USE ayvardent_db;

-- Tabla de usuarios (para login o gestión del sistema)
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(150) UNIQUE NOT NULL,
  contrasena_hashed VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'asistente', 'paciente') DEFAULT 'paciente',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de pacientes (puede coincidir con usuarios o estar separada si hay múltiples registros por familia)
CREATE TABLE pacientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(150),
  telefono VARCHAR(20),
  fecha_registro DATE DEFAULT (CURRENT_DATE)
);

-- Historial clínico o procedimientos realizados
CREATE TABLE procedimientos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  paciente_id INT NOT NULL,
  tipo VARCHAR(100) NOT NULL,            -- Ej: 'Ortodoncia', 'Corona'
  fecha DATE NOT NULL,
  notas TEXT,
  archivo_url VARCHAR(255),              -- Radiografía, fotos antes/después
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
);

-- Tabla de citas programadas
CREATE TABLE citas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  paciente_id INT NOT NULL,
  fecha_cita DATETIME NOT NULL,
  motivo VARCHAR(255),
  estado ENUM('pendiente', 'completada', 'cancelada') DEFAULT 'pendiente',
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id)
);