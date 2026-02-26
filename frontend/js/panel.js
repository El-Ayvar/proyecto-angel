const API_URL = 'http://localhost:3000/api';
let pacienteIdActual = null; 

// ==========================================
// 1. INICIALIZACIÓN Y SEGURIDAD
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const usuarioStr = localStorage.getItem('usuario');

    if (!token || !usuarioStr) {
        window.location.href = 'iniciar-sesion.html';
        return;
    }

    const usuario = JSON.parse(usuarioStr);
    if (usuario.rol !== 'odontologo') {
        mostrarAviso('⛔ Acceso denegado. Esta área es exclusiva para el personal médico.', 'error', () => {
            window.location.href = 'perfil.html';
        });
        return;
    }

    // Cargamos todos los pacientes al entrar al panel
    cargarTodosLosPacientes();

    // Listeners de botones
    document.getElementById('btn-buscar').addEventListener('click', manejarBusqueda);
    document.getElementById('btn-ver-todos').addEventListener('click', cargarTodosLosPacientes);
    document.getElementById('form-nueva-nota').addEventListener('submit', guardarNota);
    // Listener para registrar nuevos usuarios (solo odontólogos)
    const formRegistro = document.getElementById('form-registrar-usuario');
    if (formRegistro) {
        formRegistro.addEventListener('submit', registrarUsuario);
    }
});

// ==========================================
// 2. GESTIÓN DE PACIENTES (Lista y Búsqueda)
// ==========================================

// Traer TODOS los pacientes
async function cargarTodosLosPacientes() {
    const token = localStorage.getItem('token');
    try {
        // Verifica que esta ruta coincida con tu configuración de server.js
        const res = await fetch(`${API_URL}/pacientes`, { 
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if(res.ok){
            const pacientes = await res.json();
            mostrarResultadosBusqueda(pacientes);
        } else {
            console.error("Error en la respuesta del servidor");
        }
    } catch (error) {
        console.error("Error de conexión:", error);
    }
}

// Buscar paciente específico
async function manejarBusqueda() {
    const term = document.getElementById('input-busqueda').value.trim();
    if (!term) return cargarTodosLosPacientes(); // Si está vacío, trae todos

    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}/pacientes/buscar?term=${term}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if(res.ok){
            const pacientes = await res.json();
            mostrarResultadosBusqueda(pacientes);
        }
    } catch (error) {
        console.error("Error al buscar:", error);
    }
}

// Pintar la lista de pacientes en pantalla
function mostrarResultadosBusqueda(pacientes) {
    const lista = document.getElementById('lista-resultados');
    if(!lista) return;

    lista.innerHTML = ''; 

    if (pacientes.length === 0) {
        lista.innerHTML = '<li">No se encontraron pacientes.</li>';
        return;
    }

    pacientes.forEach(paciente => {
        const li = document.createElement('li');
        
        const nombre = paciente.usuario?.nombre || 'Sin nombre';
        const email = paciente.usuario?.email || 'Sin email';

        li.innerHTML = `
            <div id="infoPaciente">
                <div>
                    <strong>${nombre}:</strong>
                    <small>${email}</small>
                </div>
                <button>Abrir Expediente</button>
            </div>
        `;

        // Si le dan clic a cualquier parte del recuadro, abre el expediente
        li.addEventListener('click', () => abrirExpediente(paciente));
        lista.appendChild(li);
    });
}

// ==========================================
// 3. EXPEDIENTE Y NOTAS CLÍNICAS
// ==========================================

function abrirExpediente(paciente) {
    pacienteIdActual = paciente._id; 
    
    const panel = document.getElementById('panel-historial');
    const spanNombre = document.getElementById('nombre-paciente-seleccionado');
    const divDatos = document.getElementById('datos-completos-paciente');
    
    // 1. Llenamos los datos principales
    spanNombre.textContent = paciente.usuario?.nombre || 'Desconocido';
    
    // 2. Llenamos la información médica completa
    divDatos.innerHTML = `
        <div>
            <p><strong>📧 Email:</strong> ${paciente.usuario?.email || 'N/A'}</p>
            <p><strong>📞 Teléfono:</strong> ${paciente.telefono || 'N/A'}</p>
            <p><strong>🏠 Dirección:</strong> ${paciente.direccion || 'N/A'}</p>
        </div>
        <div>
            <p><strong>🩸 Tipo Sangre:</strong> ${paciente.tipoSangre || 'N/A'}</p>
            <p><strong>🚫 Alergias:</strong> ${paciente.alergias || 'Ninguna'}</p>
            <p><strong>🏥 Enf. Crónicas:</strong> ${paciente.enfermedadesCronicas || 'Ninguna'}</p>
        </div>
    `;

    // 3. Mostramos el panel y las notas anteriores
    panel 
    renderizarHistorial(paciente.historialNotas);
    
    // Hacemos scroll suave hacia el expediente
    panel.scrollIntoView({ behavior: 'smooth' });
}

function renderizarHistorial(historial) {
    const contenedor = document.getElementById('historial-pasado');
    contenedor.innerHTML = '';

    if (!historial || historial.length === 0) {
        contenedor.innerHTML = '<p>No hay notas previas en el expediente de este paciente.</p>';
        return;
    }

    [...historial].reverse().forEach(item => {
        const fecha = new Date(item.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        const estadoCita = item.asistio ? '<span>✅ Asistió</span>' : '<span>❌ Faltó</span>';
        
        contenedor.innerHTML += `
            <div>
                <div>📅 ${fecha} | ${estadoCita}</div>
                <p>${item.nota}</p>
            </div>
        `;
    });
}

async function guardarNota(e) {
    e.preventDefault();
    if (!pacienteIdActual) {
    mostrarAviso('Error: No hay un paciente seleccionado.', 'error');
    return;
}

    const notaInput = document.getElementById('texto-nota');
    const checkAsistio = document.getElementById('check-asistio');
    const nota = notaInput.value.trim();
    const asistio = checkAsistio.checked;
    const token = localStorage.getItem('token');

    try {
        const res = await fetch(`${API_URL}/pacientes/${pacienteIdActual}/notas`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ nota, asistio })
        });
        
        const data = await res.json();
        
        if(res.ok) {
            mostrarAviso('✅ ' + data.msg, 'success');
            notaInput.value = ''; 
            renderizarHistorial(data.historial); 
        } else {
            mostrarAviso('❌ Error: ' + (data.msg || 'No se pudo guardar la nota'), 'error');
        }
    } catch (error) {
        mostrarAviso('Error de conexión al guardar la nota.', 'error');
    }
}

// ==========================================
// 4. CERRAR SESIÓN
// ==========================================
function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = 'iniciar-sesion.html';
}

// ---------- mensajería en pantalla ----------
function mostrarAviso(texto, tipo = 'info', callback) {
    let modal = document.getElementById('aviso-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'aviso-modal';
        modal.innerHTML = `
            <div id="aviso-contenido" class="aviso-contenido">
                <p id="aviso-texto" class="aviso-texto"></p>
                <button id="aviso-ok" class="aviso-ok">OK</button>
            </div>
        `;
        const contenedorMain = document.querySelector('main') || document.body;
        contenedorMain.appendChild(modal);
        modal.querySelector('#aviso-ok').addEventListener('click', () => {
            modal.classList.remove('visible');
            if (typeof callback === 'function') callback();
        });
    }
    const textoElem = modal.querySelector('#aviso-texto');
    textoElem.textContent = texto;
    textoElem.className = 'aviso-texto ' + tipo;
    modal.classList.add('visible');
}


// ==========================================
// 5. REGISTRAR NUEVOS USUARIOS (POR ODONTÓLOGO)
// ==========================================
async function registrarUsuario(e) {
    e.preventDefault();
    const nombre = document.getElementById('nuevo-nombre').value.trim();
    const email = document.getElementById('nuevo-email').value.trim();
    const password = document.getElementById('nuevo-password').value;
    const rol = document.getElementById('nuevo-rol').value;
    const msgSpan = document.getElementById('registro-msg');
    msgSpan.textContent = '';

    if (!nombre || !email || !password) {
        msgSpan;
        return msgSpan.textContent = 'Completa todos los campos';
    }

    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ nombre, email, password, rol })
        });

        const data = await res.json();
        if (res.ok) {
            msgSpan;
            msgSpan.textContent = 'Usuario creado correctamente';
            // limpiar formulario
            document.getElementById('nuevo-nombre').value = '';
            document.getElementById('nuevo-email').value = '';
            document.getElementById('nuevo-password').value = '';
            document.getElementById('nuevo-rol').value = 'paciente';
        } else {
            msgSpan;
            msgSpan.textContent = data.msg || 'No se pudo crear el usuario';
        }
    } catch (err) {
        console.error('Error registrar usuario:', err);
        msgSpan;
        msgSpan.textContent = 'Error de conexión al servidor';
    }
}