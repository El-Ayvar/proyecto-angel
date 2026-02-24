const API_URL = 'http://localhost:3000/api';

// Cargar datos del perfil automáticamente al abrir la página
async function cargarDatosDelPerfil() {
    const token = localStorage.getItem('token');
    if (!token) return; // No hay sesión

    try {
        const res = await fetch(`${API_URL}/pacientes/mi-perfil`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) return;

        const data = await res.json();

        // Cargar datos médicos en los campos
        if (data.tipoSangre && data.tipoSangre !== 'Desconocido') {
            const tipoSangreEl = document.getElementById('tipoSangre');
            if (tipoSangreEl) tipoSangreEl.value = data.tipoSangre;
        }

        if (data.alergias && data.alergias.length > 0) {
            const alergiasEl = document.getElementById('alergias');
            if (alergiasEl) alergiasEl.value = data.alergias.join(', ');
        }

        if (data.enfermedadesCronicas && data.enfermedadesCronicas.length > 0) {
            const enfermedadEl = document.getElementById('enfermedadCronica');
            if (enfermedadEl) enfermedadEl.value = data.enfermedadesCronicas.join(', ');
        }

        if (data.medicacionActual && data.medicacionActual !== 'Ninguna') {
            const medicacionEl = document.getElementById('medicacion');
            if (medicacionEl) medicacionEl.value = data.medicacionActual;
        }

        console.log('Datos del perfil cargados:', data);
    } catch (error) {
        console.error('Error cargando perfil:', error);
    }
}

// Guardar datos médicos en el perfil
async function actualizarPerfilConDatosMedicos(token, tipoSangre, alergias, enfermedadesCronicas, medicacion) {
    try {
        // Procesar strings a arrays
        const alergiasArray = alergias
            .split(',')
            .map(a => a.trim())
            .filter(a => a && a !== 'Ninguna');

        const enfermedadesArray = enfermedadesCronicas
            .split(',')
            .map(e => e.trim())
            .filter(e => e && e !== 'Ninguna');

        const body = {
            tipoSangre: tipoSangre === 'Desconocido' ? null : tipoSangre,
            alergias: alergiasArray.length > 0 ? alergiasArray : [],
            enfermedadesCronicas: enfermedadesArray.length > 0 ? enfermedadesArray : [],
            medicacionActual: medicacion || 'Ninguna'
        };

        const res = await fetch(`${API_URL}/pacientes/actualizar`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            console.warn('No se pudo guardar todos los datos médicos:', await res.json());
            return false;
        }

        console.log('Datos médicos guardados en perfil');
        return true;
    } catch (error) {
        console.error('Error actualizando perfil:', error);
        return false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('agendarCita.js cargado correctamente');

    // Cargar datos del perfil si está logueado
    cargarDatosDelPerfil();

    const form = document.getElementById('form-cita');
    const mensajeDiv = document.getElementById('mensaje-cita');

    // Si no estamos en la página de agendar cita, detenemos el código aquí
    if (!form) return; 

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        mensajeDiv.textContent = '';
        mensajeDiv.style.color = 'red';

        // Verificar token
        const token = localStorage.getItem('token');
        if (!token) {
            mensajeDiv.textContent = 'Debes iniciar sesión para agendar una cita.';
            setTimeout(() => { window.location.href = '../views/iniciar-sesion.html'; }, 1500);
            return;
        }

        // Recoger datos básicos de la cita
        const procedimiento = document.getElementById('procedimiento').value;
        const fecha = document.getElementById('fecha').value; 
        const hora = document.getElementById('hora').value;   

        if (!procedimiento || !fecha || !hora) {
            mensajeDiv.textContent = 'Por favor completa fecha, hora y procedimiento.';
            return;
        }

        // Recoger datos médicos
        const tipoSangre = document.getElementById('tipoSangre')?.value || 'Desconocido';
        const alergias = document.getElementById('alergias')?.value.trim() || 'Ninguna';
        const enfermedadCronica = document.getElementById('enfermedadCronica')?.value.trim() || 'Ninguna';
        const medicacion = document.getElementById('medicacion')?.value.trim() || 'Ninguna';

        const fechaISO = new Date(`${fecha}T${hora}:00`).toISOString();

        const body = {
            fecha: fechaISO,
            motivo: procedimiento,
            datosMedicosPreventivos: {
                tipoSangre: tipoSangre,
                alergias: alergias,
                enfermedadCronica: enfermedadCronica,
                medicacion: medicacion
            }
        };
      
        try {
            mensajeDiv.style.color = 'black';
            mensajeDiv.textContent = 'Enviando solicitud...';
          
            const res = await fetch(`${API_URL}/citas/agendar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            console.log('Respuesta agendar cita:', data);

            if (res.ok) {
                // Actualizar perfil con datos médicos después de agendar
                const perfilActualizado = await actualizarPerfilConDatosMedicos(
                    token, tipoSangre, alergias, enfermedadCronica, medicacion
                );

                mensajeDiv.style.color = 'green';
                mensajeDiv.textContent = '✅ Cita agendada correctamente. Datos médicos guardados en tu perfil.';
                form.reset();

                // Recarga los datos para limpiar
                setTimeout(cargarDatosDelPerfil, 1000);
            } else {
                mensajeDiv.style.color = 'red';
                mensajeDiv.textContent = `❌ Error: ${data.msg || 'No se pudo agendar la cita.'}`;
            }

        } catch (error) {
            console.error('Error agendar cita:', error);
            mensajeDiv.style.color = 'red';
            mensajeDiv.textContent = '❌ Error de conexión con el servidor.';
        }
    });
});