//const API_URL = 'http://localhost:3000/api';
//let pacienteIdActual = null; 
//
//// ==========================================
//// 1. INICIALIZACIÓN Y SEGURIDAD
//// ==========================================
//document.addEventListener('DOMContentLoaded', () => {
//    const token = localStorage.getItem('token');
//    const usuarioStr = localStorage.getItem('usuario');
//
//    if (!token || !usuarioStr) {
//        window.location.href = 'iniciar-sesion.html';
//        return;
//    }
//
//    const usuario = JSON.parse(usuarioStr);
//    if (usuario.rol !== 'odontologo') {
//        mostrarAviso('⛔ Acceso denegado. Esta área es exclusiva para el personal médico.', 'error', () => {
//            window.location.href = 'perfil.html';
//        });
//        return;
//    }
//
//    // Cargamos todos los pacientes al entrar al panel
//    cargarTodosLosPacientes();
//
//    // Listeners de botones
//    document.getElementById('btn-buscar').addEventListener('click', manejarBusqueda);
//    document.getElementById('btn-ver-todos').addEventListener('click', cargarTodosLosPacientes);
//    document.getElementById('form-nueva-nota').addEventListener('submit', guardarNota);
//    // Listener para registrar nuevos usuarios (solo odontólogos)
//    const formRegistro = document.getElementById('form-registrar-usuario');
//    if (formRegistro) {
//        formRegistro.addEventListener('submit', registrarUsuario);
//    }
//});
//
//// ==========================================
//// 2. GESTIÓN DE PACIENTES (Lista y Búsqueda)
//// ==========================================
//
//// Traer TODOS los pacientes
//async function cargarTodosLosPacientes() {
//    const token = localStorage.getItem('token');
//    try {
//        // Verifica que esta ruta coincida con tu configuración de server.js
//        const res = await fetch(`${API_URL}/pacientes`, { 
//            headers: { 'Authorization': `Bearer ${token}` }
//        });
//        
//        if(res.ok){
//            const pacientes = await res.json();
//            mostrarResultadosBusqueda(pacientes);
//        } else {
//            console.error("Error en la respuesta del servidor");
//        }
//    } catch (error) {
//        console.error("Error de conexión:", error);
//    }
//}
//
//// Buscar paciente específico
//async function manejarBusqueda() {
//    const term = document.getElementById('input-busqueda').value.trim();
//    if (!term) return cargarTodosLosPacientes(); // Si está vacío, trae todos
//
//    const token = localStorage.getItem('token');
//    try {
//        const res = await fetch(`${API_URL}/pacientes/buscar?term=${term}`, {
//            headers: { 'Authorization': `Bearer ${token}` }
//        });
//        
//        if(res.ok){
//            const pacientes = await res.json();
//            mostrarResultadosBusqueda(pacientes);
//        }
//    } catch (error) {
//        console.error("Error al buscar:", error);
//    }
//}
//
//// Pintar la lista de pacientes en pantalla
//function mostrarResultadosBusqueda(pacientes) {
//    const lista = document.getElementById('lista-resultados');
//    if(!lista) return;
//
//    lista.innerHTML = ''; 
//
//    if (pacientes.length === 0) {
//        lista.innerHTML = '<li">No se encontraron pacientes.</li>';
//        return;
//    }
//
//    pacientes.forEach(paciente => {
//        const li = document.createElement('li');
//        
//        const nombre = paciente.usuario?.nombre || 'Sin nombre';
//        const email = paciente.usuario?.email || 'Sin email';
//
//        li.innerHTML = `
//            <div id="infoPaciente">
//                <div>
//                    <strong>${nombre}:</strong>
//                    <small>${email}</small>
//                </div>
//                <button>Abrir Expediente</button>
//            </div>
//        `;
//
//        // Si le dan clic a cualquier parte del recuadro, abre el expediente
//        li.addEventListener('click', () => abrirExpediente(paciente));
//        lista.appendChild(li);
//    });
//}
//
//// ==========================================
//// 3. EXPEDIENTE Y NOTAS CLÍNICAS
//// ==========================================
//
//function abrirExpediente(paciente) {
//    pacienteIdActual = paciente._id; 
//    
//    const panel = document.getElementById('panel-historial');
//    const spanNombre = document.getElementById('nombre-paciente-seleccionado');
//    const divDatos = document.getElementById('datos-completos-paciente');
//    
//    // 1. Llenamos los datos principales
//    spanNombre.textContent = paciente.usuario?.nombre || 'Desconocido';
//    
//    // 2. Llenamos la información médica completa
//    divDatos.innerHTML = `
//        <div>
//            <p><strong>📧 Email:</strong> ${paciente.usuario?.email || 'N/A'}</p>
//            <p><strong>📞 Teléfono:</strong> ${paciente.telefono || 'N/A'}</p>
//            <p><strong>🏠 Dirección:</strong> ${paciente.direccion || 'N/A'}</p>
//        </div>
//        <div>
//            <p><strong>🩸 Tipo Sangre:</strong> ${paciente.tipoSangre || 'N/A'}</p>
//            <p><strong>🚫 Alergias:</strong> ${paciente.alergias || 'Ninguna'}</p>
//            <p><strong>🏥 Enf. Crónicas:</strong> ${paciente.enfermedadesCronicas || 'Ninguna'}</p>
//        </div>
//    `;
//
//    // 3. Mostramos el panel y las notas anteriores
//    panel 
//    renderizarHistorial(paciente.historialNotas);
//    
//    // Hacemos scroll suave hacia el expediente
//    panel.scrollIntoView({ behavior: 'smooth' });
//}
//
//function renderizarHistorial(historial) {
//    const contenedor = document.getElementById('historial-pasado');
//    contenedor.innerHTML = '';
//
//    if (!historial || historial.length === 0) {
//        contenedor.innerHTML = '<p>No hay notas previas en el expediente de este paciente.</p>';
//        return;
//    }
//
//    [...historial].reverse().forEach(item => {
//        const fecha = new Date(item.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
//        const estadoCita = item.asistio ? '<span>✅ Asistió</span>' : '<span>❌ Faltó</span>';
//        
//        contenedor.innerHTML += `
//            <div>
//                <div>📅 ${fecha} | ${estadoCita}</div>
//                <p>${item.nota}</p>
//            </div>
//        `;
//    });
//}
//
//async function guardarNota(e) {
//    e.preventDefault();
//    if (!pacienteIdActual) {
//    mostrarAviso('Error: No hay un paciente seleccionado.', 'error');
//    return;
//}
//
//    const notaInput = document.getElementById('texto-nota');
//    const checkAsistio = document.getElementById('check-asistio');
//    const nota = notaInput.value.trim();
//    const asistio = checkAsistio.checked;
//    const token = localStorage.getItem('token');
//
//    try {
//        const res = await fetch(`${API_URL}/pacientes/${pacienteIdActual}/notas`, {
//            method: 'POST',
//            headers: { 
//                'Content-Type': 'application/json',
//                'Authorization': `Bearer ${token}` 
//            },
//            body: JSON.stringify({ nota, asistio })
//        });
//        
//        const data = await res.json();
//        
//        if(res.ok) {
//            mostrarAviso('✅ ' + data.msg, 'success');
//            notaInput.value = ''; 
//            renderizarHistorial(data.historial); 
//        } else {
//            mostrarAviso('❌ Error: ' + (data.msg || 'No se pudo guardar la nota'), 'error');
//        }
//    } catch (error) {
//        mostrarAviso('Error de conexión al guardar la nota.', 'error');
//    }
//}
//
//// ==========================================
//// 4. CERRAR SESIÓN
//// ==========================================
//function cerrarSesion() {
//    localStorage.removeItem('token');
//    localStorage.removeItem('usuario');
//    window.location.href = 'iniciar-sesion.html';
//}
//
//// ---------- mensajería en pantalla ----------
//function mostrarAviso(texto, tipo = 'info', callback) {
//    let modal = document.getElementById('aviso-modal');
//    if (!modal) {
//        modal = document.createElement('div');
//        modal.id = 'aviso-modal';
//        modal.innerHTML = `
//            <div id="aviso-contenido" class="aviso-contenido">
//                <p id="aviso-texto" class="aviso-texto"></p>
//                <button id="aviso-ok" class="aviso-ok">OK</button>
//            </div>
//        `;
//        const contenedorMain = document.querySelector('main') || document.body;
//        contenedorMain.appendChild(modal);
//        modal.querySelector('#aviso-ok').addEventListener('click', () => {
//            modal.classList.remove('visible');
//            if (typeof callback === 'function') callback();
//        });
//    }
//    const textoElem = modal.querySelector('#aviso-texto');
//    textoElem.textContent = texto;
//    textoElem.className = 'aviso-texto ' + tipo;
//    modal.classList.add('visible');
//}
//
//
//// ==========================================
//// 5. REGISTRAR NUEVOS USUARIOS (POR ODONTÓLOGO)
//// ==========================================
//async function registrarUsuario(e) {
//    e.preventDefault();
//    const nombre = document.getElementById('nuevo-nombre').value.trim();
//    const email = document.getElementById('nuevo-email').value.trim();
//    const password = document.getElementById('nuevo-password').value;
//    const rol = document.getElementById('nuevo-rol').value;
//    const msgSpan = document.getElementById('registro-msg');
//    msgSpan.textContent = '';
//
//    if (!nombre || !email || !password) {
//        msgSpan;
//        return msgSpan.textContent = 'Completa todos los campos';
//    }
//
//    const token = localStorage.getItem('token');
//    try {
//        const res = await fetch(`${API_URL}/auth/register`, {
//            method: 'POST',
//            headers: {
//                'Content-Type': 'application/json',
//                'Authorization': `Bearer ${token}`
//            },
//            body: JSON.stringify({ nombre, email, password, rol })
//        });
//
//        const data = await res.json();
//        if (res.ok) {
//            msgSpan;
//            msgSpan.textContent = 'Usuario creado correctamente';
//            // limpiar formulario
//            document.getElementById('nuevo-nombre').value = '';
//            document.getElementById('nuevo-email').value = '';
//            document.getElementById('nuevo-password').value = '';
//            document.getElementById('nuevo-rol').value = 'paciente';
//        } else {
//            msgSpan;
//            msgSpan.textContent = data.msg || 'No se pudo crear el usuario';
//        }
//    } catch (err) {
//        console.error('Error registrar usuario:', err);
//        msgSpan;
//        msgSpan.textContent = 'Error de conexión al servidor';
//    }
//}
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

    // Listeners de botones del buscador y formulario
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
        const res = await fetch(`${API_URL}/pacientes`, { 
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if(res.ok){
            const pacientes = await res.json();
            mostrarResultadosBusqueda(pacientes);
            document.getElementById('input-busqueda').value = ''; // Limpiar campo
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
        lista.innerHTML = '<li style="padding: 15px; color: #e74c3c;">No se encontraron pacientes.</li>';
        return;
    }

    pacientes.forEach(paciente => {
        const li = document.createElement('li');
        li.style.borderBottom = '1px solid #ddd';
        li.style.cursor = 'pointer';
        
        const nombre = paciente.usuario?.nombre || 'Sin nombre';
        const email = paciente.usuario?.email || 'Sin email';

        li.innerHTML = `
            <div id="infoPaciente" style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${nombre}</strong> <br>
                    <small style="color: #7f8c8d;">${email}</small>
                </div>
                <button style="background-color: #2ecc71; color: white; cursor: pointer; border-radius: 4px;">Abrir Expediente</button>
            </div>
        `;

        // dandole clic, abre el expediente completo haciendo la consulta al backend
        li.addEventListener('click', () => abrirExpediente(paciente._id));
        lista.appendChild(li);
        li.addEventListener('click', () => {
            document.getElementById('historial-pasado').style.display = 'flex'; //Aqui hice que se hiciera flexible para que apareciera despues de dar click ya que salia solo el cuadro del borde y se veia feo
        });
        li.addEventListener('click', () => {
            document.getElementById('citas-paciente').style.display = 'flex'; //Aqui hice que se hiciera flexible para que apareciera despues de dar click ya que salia solo el cuadro del borde y se veia feo
        });
        li.addEventListener('click',() => {
            document.getElementById('panel-historial').style.flexWrap = 'wrap';  //Aqui estoyhaciendo que cuando den click al boton el panel historial se vuelva wrap, y que aparecia un cuadro fantasma
            document.getElementById('panel-historial').style.flexDirection = 'row';  //Aqui estoyhaciendo que cuando den click al boton el panel historial se vuelva row y no column
        });
    });
}

// ==========================================
// 3. EXPEDIENTE Y NOTAS CLÍNICAS
// ==========================================

// Traemos el expediente completo desde el backend
async function abrirExpediente(idPaciente) {
    pacienteIdActual = idPaciente; 
    
    const panel = document.getElementById('panel-historial');
    const spanNombre = document.getElementById('nombre-paciente-seleccionado');
    const divDatos = document.getElementById('datos-completos-paciente');
    const token = localStorage.getItem('token');
    
    try {
        // Traemos todo el expediente al backend (incluye las citas)
        const res = await fetch(`${API_URL}/pacientes/${pacienteIdActual}/expediente`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const data = await res.json();
            const paciente = data.historialMedico;
            const citas = data.citas;

            spanNombre.textContent = data.datosPersonales?.nombre || 'Desconocido';
            
            // 1. Mostrar Datos Médicos
            divDatos.innerHTML = `
                <div>
                    <div style="flex: 1;">
                        <p style="margin: 5px 0;"><strong>📧 Email:</strong> ${data.datosPersonales?.email || 'N/A'}</p>
                        <p style="margin: 5px 0;"><strong>📞 Teléfono:</strong> ${paciente.telefono || 'N/A'}</p>
                        <p style="margin: 5px 0;"><strong>🏠 Dirección:</strong> ${paciente.direccion || 'N/A'}</p>
                    </div>
                    <div style="flex: 1;">
                        <p style="margin: 5px 0;"><strong>🩸 Tipo Sangre:</strong> ${paciente.tipoSangre || 'N/A'}</p>
                        <p style="margin: 5px 0;"><strong>🚫 Alergias:</strong> ${paciente.alergias || 'Ninguna'}</p>
                        <p style="margin: 5px 0;"><strong>🏥 Enf. Crónicas:</strong> ${paciente.enfermedadesCronicas || 'Ninguna'}</p>
                    </div>
                </div>
            `;

            // 2. Mostrar Citas
            renderizarCitasPaciente(citas);

            // 3. Mostrar Historial de Notas
            renderizarHistorial(paciente.historialNotas);
            
            // 4. Mostrar el panel y hacer scroll hacia él 
            panel.scrollIntoView({ behavior: 'smooth' });
        } else {
            mostrarAviso('Error al cargar el expediente completo', 'error');
        }
    } catch (error) {
        console.error("Error al cargar expediente:", error);
    }
}

// Dibujar las citas en pantalla
function renderizarCitasPaciente(citas) {
    const contenedor = document.getElementById('citas-paciente');
    contenedor.innerHTML = '<h3>📅 Historial de Citas Solicitadas</h3>';

    if (!citas || citas.length === 0) {
        contenedor.innerHTML += '<p style="color: gray; font-style: italic;">No hay citas registradas para este paciente.</p>';
        return;
    }

    citas.forEach(cita => {
        const fecha = new Date(cita.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        
        let colorBadge = '#f39c12'; // pendiente
        if (cita.estado === 'confirmada') colorBadge = '#27ae60'; // verde
        if (cita.estado === 'cancelada') colorBadge = '#c0392b'; // rojo
        
        contenedor.innerHTML += `
            <div id="boxInfoCita" style="border-left: 4px solid ${colorBadge};">
                <div id="infoCita">
                    <strong>${fecha}</strong>
                    <span id="avisoCPC" style="background-color: ${colorBadge}; ">${cita.estado.toUpperCase()}</span>
                    <p><strong>Motivo:</strong> ${cita.motivo}</p>
                </div>
                <button onclick="prepararNotaCita('${fecha}', '${cita.motivo}')">
                    Evaluar Asistencia
                </button>
            </div>
            `;
        });
    }
        
// Llenar el formulario de notas automáticamente al hacer clic en una cita
function prepararNotaCita(fecha, motivo) {
    const textarea = document.getElementById('texto-nota');
    textarea.value = `[Evaluación cita: ${fecha}]\nProcedimiento: ${motivo}\n\nEvolución/Detalles: `;
    textarea.focus();
    document.getElementById('form-nueva-nota').scrollIntoView({ behavior: 'smooth' });
}

// Dibujar las notas pasadas
function renderizarHistorial(historial) {
    const contenedor = document.getElementById('historial-pasado');
    //contenedor.innerHTML = ''; Limpiar antes de renderizar
    contenedor.innerHTML = '<h3>📋 Bitácora de Evolución Médica</h3>';

    if (!historial || historial.length === 0) {
        contenedor.innerHTML += '<p style="color: gray; font-style: italic;">No hay notas previas en el expediente de este paciente.</p>';
        return;
    }

    [...historial].reverse().forEach(item => {
        const fecha = new Date(item.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        const estadoCita = item.asistio ? '<span>✅ Asistió</span>' : '<span>❌ Faltó</span>';
        
        contenedor.innerHTML += `
            <div id="boxFe">
                <div>📅 ${fecha} | ${estadoCita}</div>
                <p>${item.nota}</p>
            </div>
        `;
    });
}

// Guardar una nueva nota en el backend
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
// 4. REGISTRAR NUEVOS USUARIOS
// ==========================================
async function registrarUsuario(e) {
    e.preventDefault();
    const nombre = document.getElementById('nuevo-nombre').value.trim();
    const email = document.getElementById('nuevo-email').value.trim();
    const password = document.getElementById('nuevo-password').value;
    const rol = document.getElementById('nuevo-rol').value;
    const msgSpan = document.getElementById('registro-msg');
    msgSpan.textContent = '';
    msgSpan.style.color = 'black';

    if (!nombre || !email || !password) {
        msgSpan.style.color = '#c0392b';
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
            msgSpan.style.color = '#27ae60';
            msgSpan.textContent = '✅ Usuario creado correctamente';
            document.getElementById('nuevo-nombre').value = '';
            document.getElementById('nuevo-email').value = '';
            document.getElementById('nuevo-password').value = '';
            document.getElementById('nuevo-rol').value = 'paciente';
        } else {
            msgSpan.style.color = '#c0392b';
            msgSpan.textContent = '❌ ' + (data.msg || 'No se pudo crear el usuario');
        }
    } catch (err) {
        console.error('Error registrar usuario:', err);
        msgSpan.style.color = '#c0392b';
        msgSpan.textContent = '❌ Error de conexión al servidor';
    }
}

// ==========================================
// 5. CERRAR SESIÓN Y UTILIDADES
// ==========================================
function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = 'iniciar-sesion.html';
}

function mostrarAviso(texto, tipo = 'info', callback) {
    let modal = document.getElementById('aviso-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'aviso-modal';
        // Estilos en línea para asegurar que se vea por encima de todo
        modal.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 9999;";
        modal.innerHTML = `
            <div id="aviso-contenido">
                <p id="aviso-texto"></p>
                <button id="aviso-ok">Entendido</button>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelector('#aviso-ok').addEventListener('click', () => {
            modal.style.display = 'none';
            if (typeof callback === 'function') callback();
        });
    } else {
        modal.style.display = 'flex';
    }
    
    const textoElem = modal.querySelector('#aviso-texto');
    textoElem.textContent = texto;
    
    if(tipo === 'error') textoElem.style.color = '#c0392b';
    if(tipo === 'success') textoElem.style.color = '#27ae60';
    if(tipo === 'info') textoElem.style.color = '#2c3e50';
}