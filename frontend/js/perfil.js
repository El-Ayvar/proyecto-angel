const API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const usuarioJson = localStorage.getItem('usuario');

    // Protección de ruta: Si no hay token, redirigir al login
    if (!token || !usuarioJson) {
        window.location.href = 'iniciar-sesion.html';
        return;
    }

    const usuarioLogueado = JSON.parse(usuarioJson);

    // Cargar datos según el rol
    if (usuarioLogueado.rol === 'odontologo') {
        configurarPerfilParaDoctor();
    } else {
        configurarPerfilParaPaciente(token);
    }

    // Configurar botón de cerrar sesión
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
async function configurarPerfilParaPaciente(token) {
    try {
        // 1. Obtener datos del perfil
        const res = await fetch(`${API_URL}/pacientes/mi-perfil`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const expediente = await res.json();

        if (res.ok) {
            // Cargar datos personales
            const nombreEl = document.getElementById('nombre');
            const correoEl = document.getElementById('correo');
            const fechaNacEl = document.getElementById('fechaNacimiento');

            if (nombreEl) nombreEl.value = expediente.usuario?.nombre || '';
            if (correoEl) correoEl.value = expediente.usuario?.email || '';
            if (fechaNacEl && expediente.fechaNacimiento) {
                fechaNacEl.value = expediente.fechaNacimiento.split('T')[0];
            }

            // Cargar datos médicos
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

        // 2. Configurar envío del formulario
        const form = document.getElementById('perfilForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await guardarCambiosPerfil(token);
            });
        }

        // 3. Cargar citas del paciente
        cargarCitasPaciente(token, expediente._id);

    } catch (error) {
        console.error("Error al cargar perfil del paciente:", error);
    }
}

async function guardarCambiosPerfil(token) {
    try {
        const tipoSangre = document.getElementById('tipoSangre')?.value || null;
        const alergias = document.getElementById('alergias')?.value || '';
        const enfermedades = document.getElementById('enfermedadesCronicas')?.value || '';
        const medicacion = document.getElementById('medicacionActual')?.value || 'Ninguna';
        const fechaNac = document.getElementById('fechaNacimiento')?.value || null;

        // Procesar strings a arrays
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
            alert('✅ Perfil actualizado correctamente');
            console.log('Perfil guardado:', await res.json());
        } else {
            const error = await res.json();
            alert(`❌ Error: ${error.msg}`);
        }
    } catch (error) {
        console.error('Error guardando perfil:', error);
        alert('❌ Error al guardar los cambios');
    }
}

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
            <div class="cita-card" style="border: 1px solid #ddd; padding: 10px; margin: 10px 0; border-radius: 5px;">
                <p><strong>Procedimiento:</strong> ${c.motivo}</p>
                <p><strong>Fecha:</strong> ${new Date(c.fecha).toLocaleString()}</p>
                <p><strong>Estado:</strong> <span style="color: ${c.estado === 'confirmada' ? 'green' : c.estado === 'cancelada' ? 'red' : 'orange'}">${c.estado}</span></p>
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

    // Deshabilitar edición de perfil médico para doctor
    const fieldsets = document.querySelectorAll('.ficha-medica input, .ficha-medica select, .ficha-medica textarea');
    fieldsets.forEach(el => el.disabled = true);
}