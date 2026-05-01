const Usuario = require('../models/usuario');
const Paciente = require('../models/paciente');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.registrarPaciente = async (req, res) => {
    try {
        const { nombre, email, password, rol } = req.body;

        // 1. Verificar si el email ya existe
        let usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) {
            return res.status(400).json({ msg: "El correo ya está registrado" });
        }

        // 2. Crear el nuevo usuario (la encriptación ocurre en el modelo automáticamente)
        // Validar rol entrante y usar 'paciente' como valor por defecto
        const rolesPermitidos = ['paciente', 'odontologo', 'asistente', 'admin'];
        const rolASalvar = rolesPermitidos.includes(rol) ? rol : 'paciente';
        // Si se intenta crear un odontólogo, verificar que la petición venga de un odontólogo autenticado
        // AQUI SE LO AGREGUE DESDE EL PANEL AL ODONTOLOGO
        if (rolASalvar === 'odontologo') {
            const authHeader = req.header('Authorization');
            if (!authHeader) return res.status(401).json({ msg: 'Token requerido para crear odontólogos' });

            try {
                const tokenLimpio = authHeader.split(' ')[1] || authHeader;
                const cifrado = jwt.verify(tokenLimpio, process.env.JWT_SECRET);
                if (!cifrado || cifrado.rol !== 'odontologo') {
                    return res.status(403).json({ msg: 'Solo odontólogos pueden crear odontólogos' });
                }
            } catch (err) {
                return res.status(401).json({ msg: 'Token no válido' });
            }
        }

        const nuevoUsuario = new Usuario({ nombre, email, password, rol: rolASalvar });
        await nuevoUsuario.save();

        // Si el usuario es paciente, crear automáticamente su expediente clínico
        if (rolASalvar === 'paciente') {
            const nuevoPaciente = new Paciente({
                usuario: nuevoUsuario._id,
                fechaNacimiento: new Date(), // este es unvalor por defecto, se actualizará después
                telefono: "",
                direccion: "",
                alergias: [],
                enfermedadesCronicas: [],
                medicacionActual: "Ninguna"
            });
            await nuevoPaciente.save();
        }

        // 3. (Opcional pero recomendado) Generar un Token para que entre directo
        const token = jwt.sign({ id: nuevoUsuario._id, rol: nuevoUsuario.rol }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({
            msg: "Usuario registrado con éxito",
            token,
            usuario: { nombre: nuevoUsuario.nombre, email: nuevoUsuario.email },
            rol: nuevoUsuario.rol
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Hubo un error al registrar al usuario" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Buscar si el usuario existe
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(400).json({ msg: "Credenciales inválidas" });
        }

        // 2. Comparar la contraseña ingresada con la encriptada
        // aqui hacemos la utilizacion de bcrypt.compare devuelve un booleano (true/false)
        const esCorrecta = await bcrypt.compare(password, usuario.password);
        if (!esCorrecta) {
            return res.status(400).json({ msg: "Credenciales inválidas" });
        }

        // 3. Si todo es correcto, crear el Token JWT
        const payload = {
            id: usuario._id,
            rol: usuario.rol
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '8h' // le puse que paciente tendrá 8 horas de sesión
        });

        res.json({
            msg: "Bienvenido al consultorio",
            token,
            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,
                rol: usuario.rol
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error en el servidor" });
    }
};