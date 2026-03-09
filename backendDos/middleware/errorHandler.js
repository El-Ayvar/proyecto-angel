// middleware/errorHandler.js

const errorHandler = (err, req, res, next) => {
    // imprimimos el error en la consola del backend para verlo
    console.error(err.stack);

    // creamos una respuesta amigable para el frontend
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    res.status(statusCode).json({
        msg: "Ha ocurrido un error en el servidor",
        // aqui solo mostramos el detalle técnico si estamos en desarrollo, no en producción
        error: process.env.NODE_ENV === 'development' ? err.message : null
    });
};

module.exports = errorHandler;