// API URL - Cambiar según el entorno
const API_URL = 'http://localhost:3000/api';

document.getElementById('formRegistro').addEventListener('submit', async (e) => {
    // 1. Evitamos que la página se recargue al enviar el formulario
    e.preventDefault();

    // 2. Obtenemos los valores de los inputs
    const nombre = document.getElementById('nombre').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const contrasena = document.getElementById('contrasena').value;
    const mensajeDiv = document.getElementById('mensaje');

    // Limpiamos mensajes anteriores
    mensajeDiv.textContent = "";
    mensajeDiv.className = '';

    // ==========================================
    // 3. VALIDACIONES DEL LADO DEL CLIENTE
    // ==========================================

    // Validar nombre (mínimo 8 caracteres)
    if (nombre.length < 8) {
        return mensajeDiv.textContent = "❌ El nombre debe tener al menos 8 caracteres.";
    }

    // Validar correo (solo @gmail.com)
    if (!correo.endsWith('@gmail.com')) {
        return mensajeDiv.textContent = "❌ El correo debe ser una cuenta de @gmail.com.";
    }

    // Validar contraseña (Mayúscula, minúscula, número, signo y min 8 caracteres)
    // Usamos una Expresión Regular (Regex) para revisar esto rápido
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(contrasena)) {
        return mensajeDiv.textContent = "❌ La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un signo especial (ej. @$!%*?&).";
    }

    // ==========================================
    // 4. ENVÍO DE DATOS AL BACKEND
    // ==========================================
    try {
        console.log('Enviando registro a:', `${API_URL}/auth/register`);
        
        // Hacemos la petición POST a tu servidor
        const respuesta = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // Convertimos los datos al formato que espera tu backend
            body: JSON.stringify({
                nombre: nombre,
                email: correo, // Tu backend espera "email", no "correo"
                password: contrasena // Tu backend espera "password", no "contrasena"
            })
        });

        // Convertimos la respuesta del backend a JSON
        const data = await respuesta.json();
        console.log('Respuesta del servidor:', data);

        // 5. EVALUAMOS LA RESPUESTA
        if (respuesta.ok) {
            mensajeDiv.classList.add('success');
            mensajeDiv.textContent = "✅ ¡Registro exitoso! Iniciando sesión...";

            // Guardamos el token en el navegador para que no tenga que volver a iniciar sesión
            localStorage.setItem('token', data.token);

            // Redirigimos al perfil del paciente después de 2 segundos
            setTimeout(() => {
                window.location.href = 'perfil.html';
            }, 2000);

        } else {
            // Si el backend manda error (ej. el correo ya existe)
            mensajeDiv.classList.add('error');
            mensajeDiv.textContent = `❌ Error: ${data.msg}`;
        }

    } catch (error) {
        console.error("Error en la petición:", error);
        mensajeDiv.classList.add('error');
        mensajeDiv.textContent = "❌ Error de conexión con el servidor. Asegúrate de que el backend esté encendido.";
    }
});