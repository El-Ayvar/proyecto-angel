// middleware/rolMiddleware.js
const verificarRol = (...rolesPermitidos) => {
    return (req, res, next) => {
        // aqui req.user fue inyectado previamente por tu authMiddleware.js
        if (!req.user) {
            return res.status(401).json({ msg: 'No estás autenticado' });
        }

        //  aqui se verifica si el rol del usuario está dentro de los permitidos
        if (!rolesPermitidos.includes(req.user.rol)) {
            return res.status(403).json({ 
                msg: 'Acceso denegado: No tienes permisos de administrador o dentista' // aqui ponemos una de las resticciones para cuando tienen un rol de paciente
            });
        }

        // Si su rol coincide, lo dejamos pasar al controlador
        next();
    };
};

module.exports = verificarRol;