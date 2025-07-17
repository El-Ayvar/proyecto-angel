const mysql = require('mysql2');
require('dotenv').config();
console.log('🔍 DB_PASS:', process.env.DB_PASS);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  connectionLimit: 10,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error al conectar a MySQL:', err.message);
  } else {
    console.log('✅ Conexión a MySQL establecida');
    connection.release();
  }
});

module.exports = pool;