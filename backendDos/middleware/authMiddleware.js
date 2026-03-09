const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // primero leemos el token del header (por convención se usa 'x-auth-token' o 'Authorization')
    const token = req.header('Authorization');

    // segundo revisamos si no hay token
    if (!token) {
        return res.status(401).json({ msg: 'No hay token, permiso no válido' });
    }

    try {
        // por tercer paso quitamos la palabra "Bearer " si el frontend la envía
        const tokenLimpio = token.split(' ')[1] || token;

        // aqui verificamos el token
        const cifrado = jwt.verify(tokenLimpio, process.env.JWT_SECRET);

        // aqui añadimos el usuario (id y rol) a la petición para que el controlador lo use
        req.user = cifrado;
        
        // aqui nos pasamos ya al otro paso (El controlador)
        next();
    } catch (error) {
        res.status(401).json({ msg: 'Token no es válido' });
    }
};