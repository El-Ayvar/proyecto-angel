const validarCita = (req, res, next) => {
    const { fecha, motivo } = req.body;

    // 1. Verificar que los campos obligatorios existan (odontologo es opcional)
    if (!fecha || !motivo) {
        return res.status(400).json({ msg: "Faltan datos obligatorios (fecha y motivo son requeridos)" });
    }

    const fechaCita = new Date(fecha);
    const ahora = new Date();

    // 2. Validar que la fecha sea válida
    if (isNaN(fechaCita.getTime())) {
        return res.status(400).json({ msg: "Formato de fecha inválido" });
    }

    // 3. Validar que no sea en el pasado
    if (fechaCita < ahora) {
        return res.status(400).json({ msg: "No puedes agendar citas en el pasado" });
    }

    // 4. Validar horario de oficina (8:00 AM a 8:00 PM)
    const hora = fechaCita.getHours();
    if (hora < 8 || hora >= 20) {
        return res.status(400).json({ msg: "El consultorio solo atiende de 8:00 AM a 8:00 PM" });
    }

    // 5. Limpieza de texto (evitar inyecciones o scripts)
    req.body.motivo = motivo.trim().substring(0, 200); // Limitamos a 200 caracteres

    // Si todo está bien, pasamos al siguiente middleware o controlador
    next();
};

module.exports = validarCita;