const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Usuario = require('./models/usuario.js'); // Asegúrate de que esta ruta apunte a tu modelo de usuarios

async function crear() {
    await mongoose.connect('mongodb://localhost:27017/ayvardent_db'); // Pon el nombre de tu base de datos real
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('Admin123.', salt);
    
    await new Usuario({
        nombre: "admin",
        email: "admin@gmail.com",
        password: password,
        rol: "odontologo" // <- ¡Esto es lo que te dará el acceso!
    }).save();
    
    console.log("¡Doctor creado!");
    process.exit();
}
crear();