const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // 1. Leer el token del header (por convención se usa 'x-auth-token' o 'Authorization')
    const token = req.header('Authorization');

    // 2. Revisar si no hay token
    if (!token) {
        return res.status(401).json({ msg: 'No hay token, permiso no válido' });
    }

    try {
        // 3. Quitar la palabra "Bearer " si el frontend la envía
        const tokenLimpio = token.split(' ')[1] || token;

        // 4. Verificar el token
        const cifrado = jwt.verify(tokenLimpio, process.env.JWT_SECRET);

        // 5. Añadir el usuario (id y rol) a la petición para que el controlador lo use
        req.user = cifrado;
        
        // 6. ¡Pasa al siguiente paso! (El controlador)
        next();
    } catch (error) {
        res.status(401).json({ msg: 'Token no es válido' });
    }
};