//const API_URL = 'http://localhost:3000/api';
//
//const perfilDiv = document.getElementById('perfil');
//const procedimientosDiv = document.getElementById('procedimientos');
//const saludoP = document.getElementById('saludo');
//
//function cerrarSesion() {
//	localStorage.removeItem('token');
//	localStorage.removeItem('usuario');
//	window.location.href = './iniciar-sesion.html';
//}
//
//async function cargarPanel() {
//	const token = localStorage.getItem('token');
//	const usuarioLocal = localStorage.getItem('usuario');
//
//	if (!token || !usuarioLocal) {
//		// No logueado
//		window.location.href = './iniciar-sesion.html';
//		return;
//	}
//
//	const usuario = JSON.parse(usuarioLocal);
//
//	saludoP.textContent = `Hola, ${usuario.nombre}`;
//
//	try {
//		// 1) Obtener expediente del paciente
//		const perfilRes = await fetch(`${API_URL}/pacientes/mi-perfil`, {
//			headers: { Authorization: 'Bearer ' + token }
//		});
//
//		if (!perfilRes.ok) {
//			throw new Error('No se pudo obtener el perfil');
//		}
//
//		const expediente = await perfilRes.json();
//
//		// Mostrar datos básicos
//		perfilDiv.innerHTML = `
//			<h3>Datos personales</h3>
//			<p><strong>Nombre:</strong> ${expediente.usuario?.nombre || usuario.nombre}</p>
//			<p><strong>Email:</strong> ${expediente.usuario?.email || ''}</p>
//			<p><strong>Teléfono:</strong> ${expediente.telefono || expediente.telefonoEmergencia || '—'}</p>
//			<p><strong>Dirección:</strong> ${expediente.direccion || '—'}</p>
//			<p><strong>Fecha de nacimiento:</strong> ${expediente.fechaNacimiento ? new Date(expediente.fechaNacimiento).toLocaleDateString() : '—'}</p>
//			<p><strong>Tipo de sangre:</strong> ${expediente.tipoSangre || '—'}</p>
//			<p><strong>Alergias:</strong> ${expediente.alergias?.length ? expediente.alergias.join(', ') : '—'}</p>
//			<p><strong>Enfermedades crónicas:</strong> ${expediente.enfermedadesCronicas?.length ? expediente.enfermedadesCronicas.join(', ') : '—'}</p>
//		`;
//
//		// 2) Obtener citas y filtrar las que pertenezcan a este paciente
//		const citasRes = await fetch(`${API_URL}/citas`, {
//			headers: { Authorization: 'Bearer ' + token }
//		});
//
//		if (!citasRes.ok) {
//			throw new Error('No se pudieron obtener las citas');
//		}
//
//		const citas = await citasRes.json();
//
//		// Filtrar por paciente: comparar con _id del expediente
//		const misCitas = citas.filter(c => {
//			// c.paciente puede ser objeto (poblado) o id
//			if (typeof c.paciente === 'string') return c.paciente === expediente._id;
//			if (c.paciente && c.paciente._id) return c.paciente._id === expediente._id;
//			// Si está poblado hasta usuario: c.paciente.usuario._id
//			if (c.paciente && c.paciente.usuario && c.paciente.usuario._id) return c.paciente.usuario._id === usuario.id || c.paciente.usuario._id === usuario.id;
//			return false;
//		});
//
//		if (misCitas.length === 0) {
//			procedimientosDiv.innerHTML = '<h3>Próximas citas</h3><p>No tienes citas agendadas.</p><p><a href="./agendar-cita.html">Agendar una cita</a></p>';
//		} else {
//			procedimientosDiv.innerHTML = '<h3>Próximas citas</h3>' + misCitas.map(c => {
//				const fecha = new Date(c.fecha);
//				return `
//					<div class="cita">
//						<p><strong>Motivo:</strong> ${c.motivo || '—'}</p>
//						<p><strong>Fecha:</strong> ${fecha.toLocaleString()}</p>
//						<p><strong>Estado:</strong> ${c.estado}</p>
//					</div>
//				`;
//			}).join('') + '<p><a href="./agendar-cita.html">Agendar otra cita</a></p>';
//		}
//
//	} catch (error) {
//		console.error('Error cargando panel:', error);
//		saludoP.textContent = 'No se pudieron cargar los datos. Intenta recargar.';
//	}
//}
//
//// Ejecutar al cargar
//document.addEventListener('DOMContentLoaded', cargarPanel);
//


const API_URL = 'http://localhost:3000/api';

// 1. Candado de Seguridad: Se ejecuta apenas carga la página
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const usuarioStr = localStorage.getItem('usuario');

    // Si no hay token o usuario, lo pateamos al login
    if (!token || !usuarioStr) {
        window.location.href = 'iniciar-sesion.html';
        return;
    }

    // Convertimos el string guardado a un objeto de JS
    const usuario = JSON.parse(usuarioStr);

    // Si es un paciente intentando entrar al panel del doctor... ¡Pa' fuera!
    if (usuario.rol !== 'odontologo') {
        alert('⛔ Acceso denegado. Esta área es exclusiva para el personal médico.');
        window.location.href = 'perfil.html';
        return;
    }

    // Si pasó las pruebas, le damos la bienvenida y cargamos los datos
    document.getElementById('nombreDoctor').textContent = `Dr(a). ${usuario.nombre}`;
    cargarCitas();
});


// 2. Función para obtener las citas del backend
async function cargarCitas() {
    try {
        const token = localStorage.getItem('token');
        
        // Suponiendo que tienes una ruta GET /api/citas en tu backend
        const respuesta = await fetch(`${API_URL}/citas`, {
            method: 'GET',
            headers: {
                // Así se manda el token para las rutas protegidas con 'auth'
                'x-auth-token': token, 
                'Content-Type': 'application/json'
            }
        });

        if (respuesta.ok) {
            const citas = await respuesta.json();
            renderizarTabla(citas);
        } else {
            console.error("Error al obtener las citas");
        }
    } catch (error) {
        console.error("Error de conexión:", error);
    }
}

// 3. Función para dibujar las citas en el HTML
function renderizarTabla(citas) {
    const tbody = document.getElementById('tablaCitas');
    tbody.innerHTML = ''; // Limpiamos la tabla antes de llenarla

    if (citas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">No hay citas agendadas para hoy.</td></tr>';
        return;
    }

    citas.forEach(cita => {
        const fila = document.createElement('tr');
        
        // Asumiendo que cita tiene motivo, fecha y un paciente poblado
        fila.innerHTML = `
            <td>${new Date(cita.fecha).toLocaleDateString()} - ${new Date(cita.fecha).toLocaleTimeString()}</td>
            <td>${cita.paciente ? cita.paciente.nombre : 'Paciente Desconocido'}</td>
            <td>${cita.motivo}</td>
            <td>
                <button onclick="verExpediente('${cita.paciente._id}')">Ver Expediente</button>
            </td>
        `;
        tbody.appendChild(fila);
    });
}

// 4. Cerrar sesión
function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = 'iniciar-sesion.html';
}