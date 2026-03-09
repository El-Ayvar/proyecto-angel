// URL de la API utilizada en este módulo; ajústala si cambias de entorno
const API_URL = 'http://localhost:3000/api';

// añadimos listener al formulario de registro para manejarlo con JS
document.getElementById('formRegistro').addEventListener('submit', async (e) => {
    // 1. evitar que el form recargue la página
    e.preventDefault();

    // 2. leer los valores ingresados por el usuario
    const nombre = document.getElementById('nombre').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const contrasena = document.getElementById('contrasena').value;
    const mensajeDiv = document.getElementById('mensaje');

    // limpiar cualquier mensaje anterior
    mensajeDiv.textContent = "";
    mensajeDiv.className = '';

    // ==========================================
    // 3. VALIDACIONES DEL LADO DEL CLIENTE
    // ==========================================

    // nombre debe tener al menos 8 caracteres
    if (nombre.length < 8) {
        return mensajeDiv.textContent = "❌ El nombre debe tener al menos 8 caracteres.";
    }

    // el correo debe ser de gmail (ejemplo de validación simple)
    if (!correo.endsWith('@gmail.com')) {
        return mensajeDiv.textContent = "❌ El correo debe ser una cuenta de @gmail.com.";
    }

    // la contraseña requiere mayúscula, minúscula, número y carácter especial
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(contrasena)) {
        return mensajeDiv.textContent = "❌ La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un signo especial (ej. @$!%*?&).";
    }

    // ==========================================
    // 4. ENVÍO DE DATOS AL BACKEND
    // ==========================================
    try {
        console.log('Enviando registro a:', `${API_URL}/auth/register`);
        
        // llamamos al endpoint de registro con POST
        const respuesta = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre: nombre,                // campo "nombre"
                email: correo,                 // backend espera "email"
                password: contrasena          // backend espera "password"
            })
        });

        // parseo de la respuesta
        const data = await respuesta.json();
        console.log('Respuesta del servidor:', data);

        // 5. procesar la respuesta
        if (respuesta.ok) {
            mensajeDiv.classList.add('success');
            mensajeDiv.textContent = "✅ ¡Registro exitoso! Iniciando sesión...";

            // guardamos token para mantener sesión abierta
            localStorage.setItem('token', data.token);

            // redirigir al perfil del paciente tras un par de segundos
            setTimeout(() => {
                window.location.href = 'perfil.html';
            }, 2000);

        } else {
            // mensaje de error provisto por el servidor
            mensajeDiv.classList.add('error');
            mensajeDiv.textContent = `❌ Error: ${data.msg}`;
        }

    } catch (error) {
        console.error("Error en la petición:", error);
        mensajeDiv.classList.add('error');
        mensajeDiv.textContent = "❌ Error de conexión con el servidor. Asegúrate de que el backend esté encendido.";
    }
});