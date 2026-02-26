const API_URL = 'http://localhost:3000/api';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const correo = document.getElementById('correo').value.trim();
    const contrasena = document.getElementById('contrasena').value;
    const mensajeDiv = document.getElementById('mensaje');
    mensajeDiv.textContent = "";
    mensajeDiv.className = '';

    // Validaciones básicas
    if (!correo || !contrasena) {
        return mensajeDiv.textContent = "❌ Por favor completa todos los campos.";
    }

    try {
        console.log('Enviando login a:', `${API_URL}/auth/login`);
        
        const respuesta = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: correo,
                password: contrasena
            })
        });

        const data = await respuesta.json();
        console.log('Respuesta del servidor:', data);

        if (respuesta.ok) {
            mensajeDiv.classList.add('success');
            mensajeDiv.textContent = "✅ ¡Bienvenido! Redirigiendo...";

            // Guardar token y datos del usuario
            localStorage.setItem('token', data.token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));

            // Actualizar visibilidad de menús inmediatamente
            if (typeof actualizarVisibilidadMenus === 'function') {
                actualizarVisibilidadMenus();
            }

            // Redirigir al perfil después de 1.5 segundos
            setTimeout(() => {
                const rol = data.usuario.rol;
                if (rol === 'odontologo') {
                    window.location.href = '../views/panel.html'; // Lo mandamos a su panel
                } else {
                    window.location.href = '../index.html'; // Lo mandamos a su perfil clínico
                }
            }, 1500);

        } else {
            mensajeDiv.classList.add('error');
            mensajeDiv.textContent = `❌ Error: ${data.msg || 'Credenciales inválidas'}`;
        }

    } catch (error) {
        console.error("Error en la petición:", error);
        mensajeDiv.classList.add('error');
        mensajeDiv.textContent = "❌ Error de conexión con el servidor. Asegúrate de que el backend esté encendido.";
    }
});