// URL base del backend; modifica si cambias la dirección o el puerto
const API_URL = 'http://localhost:3000/api';

// capturamos el formulario de inicio de sesión y le agregamos un "submit" listener
// para controlar el envío con JavaScript en lugar de permitir que el navegador
// recargue la página.
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // prevenir envío tradicional

    // obtenemos valores ingresados por el usuario
    const correo = document.getElementById('correo').value.trim();
    const contrasena = document.getElementById('contrasena').value;
    const mensajeDiv = document.getElementById('mensaje');
    mensajeDiv.textContent = ""; // limpiamos mensaje previo
    mensajeDiv.className = '';   // restablecemos clases

    // Validaciones básicas de presencia
    if (!correo || !contrasena) {
        return mensajeDiv.textContent = "❌ Por favor completa todos los campos.";
    }

    try {
        console.log('Enviando login a:', `${API_URL}/auth/login`);
        
        // petición POST al endpoint de autenticación
        const respuesta = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: correo,     // el backend espera campo "email"
                password: contrasena // y campo "password"
            })
        });

        const data = await respuesta.json(); // parsear JSON de respuesta
        console.log('Respuesta del servidor:', data);

        if (respuesta.ok) {
            mensajeDiv.classList.add('success');
            mensajeDiv.textContent = "✅ ¡Bienvenido! Redirigiendo...";

            // guardar token y usuario en localStorage para mantener sesión
            localStorage.setItem('token', data.token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));

            // si existe función global para actualizar menús, llamarla
            if (typeof actualizarVisibilidadMenus === 'function') {
                actualizarVisibilidadMenus();
            }

            // redirección según rol después de un breve retraso
            setTimeout(() => {
                const rol = data.usuario.rol;
                if (rol === 'odontologo') {
                    window.location.href = '../views/panel.html'; // panel de doctores
                } else {
                    window.location.href = '../index.html'; // perfil de paciente
                }
            }, 1500);

        } else {
            // si la respuesta no es ok mostramos error devuelto
            mensajeDiv.classList.add('error');
            mensajeDiv.textContent = `❌ Error: ${data.msg || 'Credenciales inválidas'}`;
        }

    } catch (error) {
        // capturar problemas de red o excepciones inesperadas
        console.error("Error en la petición:", error);
        mensajeDiv.classList.add('error');
        mensajeDiv.textContent = "❌ Error de conexión con el servidor. Asegúrate de que el backend esté encendido.";
    }
});