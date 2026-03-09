// URL base de la API que se usa en este script
const API_URL = 'http://localhost:3000/api';

// cuando el DOM está listo, verificamos sesión y mostramos el perfil
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');                   // token JWT almacenado
    const usuarioJson = localStorage.getItem('usuario');           // datos del usuario

    // si falta token o usuario, redirigir a inicio de sesión
    if (!token || !usuarioJson) {
        window.location.href = 'iniciar-sesion.html';
        return;
    }

    const usuarioLogueado = JSON.parse(usuarioJson); // convertir a objeto

    // según el rol, cargamos la versión de paciente o doctor
    if (usuarioLogueado.rol === 'odontologo') {
        configurarPerfilParaDoctor();
    } else {
        configurarPerfilParaPaciente(token);
    }

    // configurar el botón "cerrar sesión" si existe
    const btnCerrar = document.getElementById('cerrar-sesion');
    if (btnCerrar) {
        btnCerrar.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            window.location.href = 'iniciar-sesion.html';
        });
    }
});

// --- FUNCIONES PARA EL PACIENTE ---
// esta función obtiene los datos del paciente y rellena el formulario
async function configurarPerfilParaPaciente(token) {
    try {
        // petición al backend para obtener el expediente
        const res = await fetch(`${API_URL}/pacientes/mi-perfil`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const expediente = await res.json();

        if (res.ok) {
            // cargar datos personales en los inputs
            const nombreEl = document.getElementById('nombre');
            const correoEl = document.getElementById('correo');
            const fechaNacEl = document.getElementById('fechaNacimiento');

            if (nombreEl) nombreEl.value = expediente.usuario?.nombre || '';
            if (correoEl) correoEl.value = expediente.usuario?.email || '';
            if (fechaNacEl && expediente.fechaNacimiento) {
                fechaNacEl.value = expediente.fechaNacimiento.split('T')[0];
            }

            // cargar datos médicos si existen
            const tipoSangreEl = document.getElementById('tipoSangre');
            const alergiasEl = document.getElementById('alergias');
            const enfermedadesEl = document.getElementById('enfermedadesCronicas');
            const medicacionEl = document.getElementById('medicacionActual');

            if (tipoSangreEl && expediente.tipoSangre) {
                tipoSangreEl.value = expediente.tipoSangre;
            }
            if (alergiasEl && expediente.alergias?.length > 0) {
                alergiasEl.value = expediente.alergias.join(', ');
            }
            if (enfermedadesEl && expediente.enfermedadesCronicas?.length > 0) {
                enfermedadesEl.value = expediente.enfermedadesCronicas.join(', ');
            }
            if (medicacionEl && expediente.medicacionActual) {
                medicacionEl.value = expediente.medicacionActual;
            }

            console.log('Perfil cargado:', expediente);
        }

        // asociar listener al envío del formulario para guardar cambios
        const form = document.getElementById('perfilForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await guardarCambiosPerfil(token);
            });
        }

        // cargar la lista de citas del paciente para mostrarla
        cargarCitasPaciente(token, expediente._id);

    } catch (error) {
        console.error("Error al cargar perfil del paciente:", error);
    }
}

// envía los cambios de perfil al backend
async function guardarCambiosPerfil(token) {
    try {
        const tipoSangre = document.getElementById('tipoSangre')?.value || null;
        const alergias = document.getElementById('alergias')?.value || '';
        const enfermedades = document.getElementById('enfermedadesCronicas')?.value || '';
        const medicacion = document.getElementById('medicacionActual')?.value || 'Ninguna';
        const fechaNac = document.getElementById('fechaNacimiento')?.value || null;

        // convertir cadenas en arrays y filtrar entradas inválidas
        const alergiasArray = alergias
            .split(',')
            .map(a => a.trim())
            .filter(a => a && a !== 'Ninguna');
        const enfermedadesArray = enfermedades
            .split(',')
            .map(e => e.trim())
            .filter(e => e && e !== 'Ninguna');

        const body = {
            tipoSangre: tipoSangre === 'Desconocido' ? null : tipoSangre,
            alergias: alergiasArray,
            enfermedadesCronicas: enfermedadesArray,
            medicacionActual: medicacion,
            fechaNacimiento: fechaNac
        };

        const res = await fetch(`${API_URL}/pacientes/actualizar`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            mostrarAviso('✅ Perfil actualizado correctamente', 'success');
            console.log('Perfil guardado:', await res.json());
        } else {
            const error = await res.json();
            mostrarAviso(`❌ Error: ${error.msg}`, 'error');
        }
    } catch (error) {
        console.error('Error guardando perfil:', error);
        mostrarAviso('❌ Error al guardar los cambios', 'error');
    }
}

// obtiene y muestra las citas del paciente
async function cargarCitasPaciente(token, pacienteId) {
    try {
        const res = await fetch(`${API_URL}/citas/mis-citas`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            console.warn('No se pudieron cargar las citas:', await res.json());
            return;
        }

        const citas = await res.json();
        console.log('Citas cargadas:', citas);

        const listaCitasDiv = document.getElementById('lista-citas');
        if (!listaCitasDiv) return;

        if (citas.length === 0) {
            listaCitasDiv.innerHTML = '<p>No tienes citas agendadas. <a href="./agendar-cita.html">Agendar una</a></p>';
            return;
        }

        listaCitasDiv.innerHTML = citas.map(c => `
            <div class="cita-card">
                <p><strong>Procedimiento:</strong> ${c.motivo}</p>
                <p><strong>Fecha:</strong> ${new Date(c.fecha).toLocaleString()}</p>
                <p><strong>Estado:</strong> <span class="estado-${c.estado}">${c.estado}</span></p>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error cargando citas:', error);
    }
}

// --- FUNCIONES PARA EL ODONTÓLOGO ---
function configurarPerfilParaDoctor() {
    const usuarioLogueado = JSON.parse(localStorage.getItem('usuario'));
    const nombreEl = document.getElementById('nombre');
    const correoEl = document.getElementById('correo');

    if (nombreEl) nombreEl.value = usuarioLogueado.nombre;
    if (correoEl) correoEl.value = usuarioLogueado.email;

    // deshabilitar campos médicos para que el doctor no pueda editarlos
    const fieldsets = document.querySelectorAll('.ficha-medica input, .ficha-medica select, .ficha-medica textarea');
    fieldsets.forEach(el => el.disabled = true);
}