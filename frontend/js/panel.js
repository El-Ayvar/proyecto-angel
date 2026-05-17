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
    
    // Validar que el rol tenga acceso al panel
    const rolesAutorizados = ['odontologo', 'admin', 'asistente'];
    if (!rolesAutorizados.includes(usuario.rol)) {
        window.location.href = 'perfil.html';
        return;
    }

    // RESTRICCIONES PARA ASISTENTE (Solo lectura)
    if (usuario.rol === 'asistente') {
        const registrarSeccion = document.getElementById('registrar-usuarios');
        if (registrarSeccion) registrarSeccion.style.display = 'none';
        
        // Bloquear formularios de edición después de un pequeño delay para asegurar carga
        setTimeout(() => {
            document.querySelectorAll('#form-nueva-nota input, #form-nueva-nota textarea, #form-nueva-nota button').forEach(el => {
                el.disabled = true;
                el.style.opacity = '0.5';
            });
        }, 500);
    }

    const btnBuscar = document.getElementById('btn-buscar');
    if (btnBuscar) btnBuscar.addEventListener('click', manejarBusqueda);

    const btnVerTodos = document.getElementById('btn-ver-todos');
    if (btnVerTodos) btnVerTodos.addEventListener('click', cargarTodosLosPacientes);

    const formNota = document.getElementById('form-nueva-nota');
    if (formNota) formNota.addEventListener('submit', guardarNota);

    const formRegistro = document.getElementById('form-registrar-usuario');
    if (formRegistro) formRegistro.addEventListener('submit', registrarUsuario);

    cargarTodosLosPacientes();
    cargarGestionCitas();
});

// FUNCIÓN PARA RENDERIZAR (Con lógica de papelera)
function renderizarPacientes(pacientes) {
    const contenedor = document.getElementById('lista-pacientes');
    const usuarioLogueado = JSON.parse(localStorage.getItem('usuario'));
    
    if (pacientes.length === 0) {
        contenedor.innerHTML = '<p class="aviso">No se encontraron pacientes activos.</p>';
        return;
    }

    contenedor.innerHTML = pacientes.map(p => {
        const estado = p.usuario.status || 'activo';
        const esPapelera = estado === 'eliminado_temporal';

        return `
            <div class="card ${esPapelera ? 'en-papelera' : ''}">
                <div class="info_paciente">
                    <p><strong>Nombre:</strong> ${p.usuario.nombre}</p>
                    <p><strong>Email:</strong> ${p.usuario.email}</p>
                    ${esPapelera ? '<span class="tag-status">EN PAPELERA</span>' : ''}
                </div>
                <div class="box_botones">
                    ${!esPapelera ? `
                        <button class="btn-abrir" onclick="verExpediente('${p._id}')">Ver Expediente</button>
                        ${usuarioLogueado.rol !== 'asistente' ? `
                            <button class="btn-borrar" onclick="borrarRegistro('${p._id}')">Eliminar</button>
                        ` : ''}
                    ` : `
                        <button class="btn-verde" onclick="manejarPapelera('${p.usuario._id}', 'restaurar')">Restaurar</button>
                        <button class="btn-negro" onclick="manejarPapelera('${p.usuario._id}', 'borrar_definitivo')">Eliminar Permanente</button>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

// NUEVA FUNCIÓN: Gestión de Papelera para el Admin
async function manejarPapelera(idUsuario, accion) {
    const confirmacion = confirm(`¿Estás seguro de que deseas ${accion.replace('_', ' ')} este registro?`);
    if (!confirmacion) return;

    try {
        const res = await fetch(`${API_URL}/pacientes/papelera/${idUsuario}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ accion })
        });

        if (res.ok) {
            alert('Operación realizada con éxito');
            cargarTodosLosPacientes();
        } else {
            const error = await res.json();
            alert('Error: ' + error.msg);
        }
    } catch (error) {
        console.error('Error en papelera:', error);
    }
}

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
        
        // 1. Detectamos el estado actual
        const nombre = paciente.usuario?.nombre || 'Sin nombre';
        const email = paciente.usuario?.email || 'Sin email';
        const estado = paciente.usuario?.status || 'activo';
        const esEliminado = estado === 'eliminado_temporal';

        // 2. Cambiamos el color de fondo si está eliminado
        if (esEliminado) {
            li.style.borderRadius = '8px';
        }

        li.innerHTML = `
            <div id="infoPaciente" style="display: flex; justify-content: space-between; align-items: center;">
                <div style="flex-grow: 1; cursor: pointer;">
                    <strong>${nombre}</strong> 
                    <div style="padding:0vw"> ${esEliminado ? '<b id="estado-eliminado">[EN PAPELERA]</b>' : ''} </div>
                    <small style="color: #7f8c8d;">${email}</small>
                </div>
                <div class="box_botones">
                    ${esEliminado ? `
                        <button class="btn-restaurar">Restaurar</button>
                        <button class="btn-borrar-definitivo">Borrar Permanente</button>
                    ` : `
                        <button class="btn-abrir-expediente">Abrir Expediente</button>
                        <button class="btn-eliminar">Eliminar</button>
                    `}
                </div>
            </div>
        `;

        // 3. Lógica de los botones según el estado
        if (esEliminado) {
            // Botón Restaurar
            li.querySelector('.btn-restaurar').addEventListener('click', (e) => {
                e.stopPropagation();
                restaurarPaciente(paciente.usuario._id); // Usamos el ID del usuario
            });

            // Botón Borrar Permanente
            li.querySelector('.btn-borrar-definitivo').addEventListener('click', (e) => {
                e.stopPropagation();
                // Aquí llamarías a una función de borrado físico si la tienes
                confirmarAccion("¿Borrar definitivamente de la base de datos?", () => {
                    borrarRegistroDefinitivo(paciente.usuario._id); 
                });
            });
        } else {
            // Listeners normales (Abrir y Eliminar)
            li.querySelector('.btn-abrir-expediente').addEventListener('click', (e) => {
                e.stopPropagation();
                abrirExpediente(paciente._id);
            });

            li.querySelector('.btn-eliminar').addEventListener('click', (e) => {
                e.stopPropagation();
                borrarRegistro(paciente._id);
            });
        }

        // El área de texto siempre abre el expediente (opcional si está eliminado)
        li.querySelector('[style*="flex-grow"]').addEventListener('click', () => {
            abrirExpediente(paciente._id);
        });

        lista.appendChild(li);
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
            const tratamientos = data.tratamientos; // <--- SACAMOS LOS TRATAMIENTOS

            spanNombre.textContent = data.datosPersonales?.nombre || 'Desconocido';
            
            // 1. Mostrar Datos Médicos
            divDatos.innerHTML = `
                <div id="boxForm">
                        <div id="formEnfermedadesCronicas" class="form-label">
                            <strong>Enf. Crónicas</strong> 
                            <p> ${Array.isArray(paciente.enfermedadesCronicas) ? paciente.enfermedadesCronicas.join(', ') : paciente.enfermedadesCronicas || 'Ninguna'}</p>
                        </div>

                        <div id="formAlergias" class="form-label">
                            <strong>Alergias</strong> 
                            <p> ${Array.isArray(paciente.alergias) ? paciente.alergias.join(', ') : paciente.alergias || 'Ninguna'}</p>
                        </div>

                        <div id="formTipoSangre" class="form-label">
                            <strong>Tipo Sangre</strong> 
                            <p> ${paciente.tipoSangre || 'N/A'}</p>
                        </div>

                        <div id="formEmail" class="form-label">
                            <strong>Email</strong> 
                            <p> ${data.datosPersonales?.email || 'N/A'}</p>
                        </div>

                        <div id="formTelefono" class="form-label">
                            <strong>Teléfono</strong> 
                            <p> ${paciente.telefono || 'N/A'}</p>
                        </div>

                        <div id="formDireccion" class="form-label">
                            <strong>Dirección</strong> 
                            <p> ${paciente.direccion || 'N/A'}</p>
                        </div>
                </div>
            `;
            //console.log("Datos del paciente:", paciente.enfermedadesCronicas);

            // 2. Mostrar Citas
            renderizarCitasPaciente(citas);

            // 3. Mostrar Historial de Notas
            renderizarHistorial(paciente.historialNotas);

            if (typeof cargarTratamientosEnOdontograma === 'function') {
                cargarTratamientosEnOdontograma(tratamientos || []);
            }
            
            // 4. Mostrar el panel y hacer scroll hacia él 
            document.getElementById('historial-pasado').style.display = 'flex';
            document.getElementById('citas-paciente').style.display = 'flex';
            document.getElementById('panel-historial').style.display = 'flex';
            document.getElementById('panel-historial').style.flexWrap = 'wrap';
            document.getElementById('panel-historial').style.flexDirection = 'row';
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

// Función para mostrar un modal de confirmación
function mostrarConfirmacion(texto, onConfirm, onCancel) {
    let modal = document.getElementById('confirmacion-modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'confirmacion-modal';
        // Cambio clave: Usamos 'class' para contenido y texto para coincidir con tu SCSS
        modal.innerHTML = `
            <div class="confirmacion-contenido">
                <p class="confirmacion-texto"></p>
                <div id="confirmacion-botones">
                    <button id="confirmacion-cancelar">Cancelar</button>
                    <button id="confirmacion-confirmar">Eliminar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Se ha eliminado toda la lógica de document.createElement('style')
    }
    
    modal.style.display = 'flex';
    // Cambio clave: Seleccionamos por clase en lugar de ID
    const textoElem = modal.querySelector('.confirmacion-texto');
    textoElem.textContent = texto;
    
    const btnCancelar = modal.querySelector('#confirmacion-cancelar');
    const btnConfirmar = modal.querySelector('#confirmacion-confirmar');
    
    btnCancelar.onclick = () => {
        modal.style.display = 'none';
        if (typeof onCancel === 'function') onCancel();
    };
    
    btnConfirmar.onclick = () => {
        modal.style.display = 'none';
        if (typeof onConfirm === 'function') onConfirm();
    };
}

// Función para eliminar un paciente
async function borrarRegistro(idPaciente) {
    mostrarConfirmacion(
        '¿Estás seguro de que deseas eliminar este paciente? Esta acción no se puede deshacer.',
        async () => {
            // Si confirma, ejecutar eliminación
            const token = localStorage.getItem('token');
            const API_URL = 'http://localhost:3000/api';
            
            try {
                console.log('Intentando eliminar paciente:', idPaciente);
                const res = await fetch(`${API_URL}/pacientes/${idPaciente}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log('Respuesta del servidor:', res.status, res.statusText);
                const data = await res.json();
                console.log('Datos de respuesta:', data);
                
                if (res.ok) {
                    mostrarAviso('✅ Paciente eliminado correctamente', 'success', () => {
                        cargarTodosLosPacientes(); // Recargar la lista
                        // Cerrar el expediente si estaba abierto
                        const panel = document.getElementById('panel-historial');
                        if (panel) panel.style.display = 'none';
                    });
                } else {
                    mostrarAviso('❌ Error: ' + (data.msg || 'No se pudo eliminar el paciente'), 'error');
                }
            } catch (error) {
                console.error('Error al eliminar paciente:', error);
                mostrarAviso('❌ Error de conexión al servidor', 'error');
            }
        },
        () => {
            // Si cancela, no hacer nada
            console.log('Eliminación cancelada');
        }
    );
}

async function restaurarPaciente(usuarioId) {
    const token = localStorage.getItem('token');
    
    // Usamos el Swal o el aviso que ya tienes implementado
    confirmarAccion("¿Quieres restaurar a este paciente?", async () => {
        try {
            const res = await fetch(`${API_URL}/pacientes/papelera/${usuarioId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ accion: 'restaurar' })
            });

            const data = await res.json();
            if (res.ok) {
                mostrarAviso('✅ Paciente restaurado', 'success');
                cargarTodosLosPacientes(); // Recargamos la lista para que cambie el color
            } else {
                mostrarAviso('❌ ' + data.msg, 'error');
            }
        } catch (error) {
            console.error(error);
            mostrarAviso('Error de conexión', 'error');
        }
    });
}

async function cargarGestionCitas() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}/citas`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const citas = await res.json();

        // IDs de tus contenedores en el HTML
        const colPendientes = document.getElementById('lista-pendientes');
        const colConfirmadas = document.getElementById('lista-confirmadas');
        const colCanceladas = document.getElementById('lista-canceladas');

        // Limpiar antes de cargar
        [colPendientes, colConfirmadas, colCanceladas].forEach(c => { if(c) c.innerHTML = ''; });

        citas.forEach(cita => {
            const nombre = cita.paciente?.usuario?.nombre || 'Paciente Desconocido';
            const fecha = new Date(cita.fecha).toLocaleString();
            
            const div = document.createElement('div');
            div.className = `cita-item status-${cita.estado}`;
            
            div.innerHTML = `
                <strong>${nombre}</strong><br>
                <small>${cita.telefono || 'Sin disponible'}</small><br>
                <small>${fecha}</small><br>
                <p>${cita.motivo}</p>
                <div class="botones-estado">
                    ${cita.estado !== 'confirmada' ? `<button id="buttonC" onclick="cambiarStatusCita('${cita._id}', 'confirmada')" >✔</button>` : ''}
                    ${cita.estado !== 'cancelada' ? `<button id="buttonCa" onclick="cambiarStatusCita('${cita._id}', 'cancelada')" >✖</button>` : ''}
                    ${cita.estado !== 'pendiente' ? `<button id="buttonP" onclick="cambiarStatusCita('${cita._id}', 'pendiente')" >⟳</button>` : ''}
                </div>
            `;

            // Clasificar en la columna correspondiente
            if (cita.estado === 'confirmada' && colConfirmadas) colConfirmadas.appendChild(div);
            else if (cita.estado === 'cancelada' && colCanceladas) colCanceladas.appendChild(div);
            else if (colPendientes) colPendientes.appendChild(div);
        });
    } catch (error) {
        console.error("Error cargando citas:", error);
    }
}

// Función para el cambio de estado
window.cambiarStatusCita = async (id, nuevoEstado) => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}/citas/estado/${id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nuevoEstado })
        });

        if (res.ok) {
            cargarGestionCitas(); // Recargar para mover la tarjeta de columna
        }
    } catch (error) {
        console.error("Error al actualizar cita:", error);
    }
};