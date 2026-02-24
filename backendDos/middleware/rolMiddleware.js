// middleware/rolMiddleware.js

const verificarRol = (...rolesPermitidos) => {
    return (req, res, next) => {
        // req.user fue inyectado previamente por tu authMiddleware.js
        if (!req.user) {
            return res.status(401).json({ msg: 'No estás autenticado' });
        }

        // Verificamos si el rol del usuario está dentro de los permitidos
        if (!rolesPermitidos.includes(req.user.rol)) {
            return res.status(403).json({ 
                msg: 'Acceso denegado: No tienes permisos de administrador o dentista' 
            });
        }

        // Si su rol coincide, lo dejamos pasar al controlador
        next();
    };
};

module.exports = verificarRol;