// dirección base de la API que se usa en todas las peticiones
const API_URL = 'https://proyecto-angel.onrender.com/api';

// función que carga datos del perfil cuando se abre la página
async function cargarDatosDelPerfil() {
    // obtengo el token del almacenamiento local
    const token = localStorage.getItem('token');
    if (!token) return; // si no está logueado, salgo

    try {
        // peticion al endpoint de perfil del paciente
        const res = await fetch(`${API_URL}/pacientes/mi-perfil`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) return; // sin datos no hago nada

        const data = await res.json(); // parseo la respuesta JSON

        if (data.telefono && data.telefono !== 'Sin disponible') {
            const telefonoEl = document.getElementById('telefono');
            if (telefonoEl) telefonoEl.value = data.telefono;
        }

        // si hay tipo de sangre y no es "Desconocido", lo pongo en el input
        if (data.tipoSangre && data.tipoSangre !== 'Desconocido') {
            const tipoSangreEl = document.getElementById('tipoSangre');
            if (tipoSangreEl) tipoSangreEl.value = data.tipoSangre;
        }

        // si existen alergias, las convierto en cadena separada por comas
        if (data.alergias && data.alergias.length > 0) {
            const alergiasEl = document.getElementById('alergias');
            if (alergiasEl) alergiasEl.value = data.alergias.join(', ');
        }

        // idem con enfermedades crónicas
        if (data.enfermedadesCronicas && data.enfermedadesCronicas.length > 0) {
            const enfermedadEl = document.getElementById('enfermedadCronica');
            if (enfermedadEl) enfermedadEl.value = data.enfermedadesCronicas.join(', ');
        }

        // y con medicación actual (si es distinta de "Ninguna")
        if (data.medicacionActual && data.medicacionActual !== 'Ninguna') {
            const medicacionEl = document.getElementById('medicacion');
            if (medicacionEl) medicacionEl.value = data.medicacionActual;
        }

        console.log('Datos del perfil cargados:', data); // registro para debug
    } catch (error) {
        console.error('Error cargando perfil:', error); // muestro cualquier error
    }
}

// almacena los datos médicos en el perfil del paciente
async function actualizarPerfilConDatosMedicos(token, tipoSangre, alergias, enfermedadesCronicas, medicacion) {
    try {
        // paso de string a array, quitando valores vacíos o "Ninguna"
        const alergiasArray = alergias
            .split(',')
            .map(a => a.trim())
            .filter(a => a && a !== 'Ninguna');

        const enfermedadesArray = enfermedadesCronicas
            .split(',')
            .map(e => e.trim())
            .filter(e => e && e !== 'Ninguna');

        // construyo el body de la petición
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

        if (!res.ok) { // si la API responde con error
            console.warn('No se pudo guardar todos los datos médicos:', await res.json());
            return false;
        }

        console.log('Datos médicos guardados en perfil');
        return true; // exito
    } catch (error) {
        console.error('Error actualizando perfil:', error);
        return false; // fallo
    }
}

let horasOcupadasPorFecha = [];

function generarHorasDisponibles() {
    const inicio = 7;
    const fin = 20;
    const duracionMinutos = 60;
    const horas = [];

    for (let hora = inicio; hora < fin; hora += duracionMinutos / 60) {
        const hh = String(hora).padStart(2, '0');
        horas.push(`${hh}:00`);
    }

    return horas;
}

function esHoraCerrada(hora) {
    const [hh, mm] = hora.split(':').map(Number);
    const minutos = hh * 60 + mm;
    return minutos < 7 * 60 || minutos > 19 * 60;
}

function formatearHora(hora) {
    const [hh, mm] = hora.split(':').map(Number);
    const periodo = hh >= 12 ? 'PM' : 'AM';
    const hora12 = hh % 12 === 0 ? 12 : hh % 12;
    return `${hora12}:${String(mm).padStart(2, '0')} ${periodo}`;
}

async function cargarDisponibilidadHoras() {
    const fechaInput = document.getElementById('fecha');
    const selectorHoras = document.getElementById('selector-horas');
    const horaInput = document.getElementById('hora');
    const mensajeDiv = document.getElementById('mensaje-cita');

    if (!fechaInput || !selectorHoras || !horaInput) return;

    const fechaSeleccionada = fechaInput.value;
    selectorHoras.innerHTML = '';
    selectorHoras.style.display = 'none';
    selectorHoras.classList.remove('visible');
    horaInput.value = '';

    if (!fechaSeleccionada) return;

    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/citas/disponibilidad?fecha=${fechaSeleccionada}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) return;

        const data = await res.json();
        horasOcupadasPorFecha = data.horasOcupadas || [];

        const horas = generarHorasDisponibles();
        const botones = [];

        horas.forEach(hora => {
            const cerrada = esHoraCerrada(hora);
            const ocupado = horasOcupadasPorFecha.includes(hora);
            const estado = cerrada ? 'cerrada' : (ocupado ? 'ocupada' : 'disponible');

            const boton = document.createElement('button');
            boton.type = 'button';
            boton.className = `hora-slot ${estado}`;
            boton.textContent = formatearHora(hora);
            boton.disabled = estado !== 'disponible';
            boton.dataset.hora = hora;
            boton.addEventListener('click', () => {
                if (estado !== 'disponible') return;
                horaInput.value = hora;
                document.querySelectorAll('.hora-slot').forEach(btn => btn.classList.remove('selected'));
                boton.classList.add('selected');
                if (mensajeDiv) {
                    mensajeDiv.textContent = '';
                    mensajeDiv.className = '';
                }
            });
            botones.push(boton);
        });

        selectorHoras.append(...botones);
        selectorHoras.style.display = 'flex';
        selectorHoras.classList.add('visible');
    } catch (error) {
        console.error('Error cargando disponibilidad:', error);
    }
}

// cuando el documento está listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('agendarCita.js cargado correctamente');

    // intento rellenar el formulario con datos del perfil
    cargarDatosDelPerfil();

    const form = document.getElementById('form-cita');          // el formulario principal
    const mensajeDiv = document.getElementById('mensaje-cita'); // elemento para mensajes

    const horaInput = document.getElementById('hora');
    const fechaInput = document.getElementById('fecha');

    if (fechaInput) {
        fechaInput.addEventListener('change', cargarDisponibilidadHoras);
    }

    if (horaInput) {
        horaInput.addEventListener('change', () => {
            const hora = horaInput.value;
            if (hora && (hora < '07:00' || hora > '20:00')) {
                mensajeDiv.className = 'error';
                mensajeDiv.textContent = '⚠️ Horario fuera de servicio. Selecciona una hora entre 7:00 AM y 8:00 PM.';
                horaInput.value = ''; 
            } else if (mensajeDiv.textContent.includes('Horario fuera de servicio')) {
                mensajeDiv.textContent = ''; 
                mensajeDiv.className = '';
            }
        });
    }


    // si no existe el formulario en esta página, salgo
    if (!form) return; 

    // manejo el envío del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // evito recargar la página

        mensajeDiv.textContent = ''; // limpio mensaje previo
        mensajeDiv.className = '';

        // compruebo que haya token (sesión activa)
        const token = localStorage.getItem('token');
        if (!token) {
            mensajeDiv.textContent = 'Debes iniciar sesión para agendar una cita.';
            setTimeout(() => { window.location.href = '../views/iniciar-sesion.html'; }, 1500);
            return;
        }

        // obtengo los campos básicos de la cita
        const procedimiento = document.getElementById('procedimiento').value;
        const fecha = document.getElementById('fecha').value; 
        const hora = document.getElementById('hora').value;
        const telefono = document.getElementById('telefono').value;   

        if (!procedimiento || !fecha || !hora || !telefono) {
            mensajeDiv.textContent = 'Por favor completa fecha, hora, procedimiento y teléfono.';
            return; // si falta algo, no continúo
        }

        if (hora < '07:00' || hora > '20:00') {
            mensajeDiv.className = 'error';
            mensajeDiv.textContent = '❌ La hora seleccionada debe estar entre las 7:00 AM y las 8:00 PM.';
            return;
        }

        if (horasOcupadasPorFecha.includes(hora)) {
            mensajeDiv.className = 'error';
            mensajeDiv.textContent = '❌ Esa hora ya tiene una cita confirmada. Selecciona otra.';
            return;
        }

        if (esHoraCerrada(hora)) {
            mensajeDiv.className = 'error';
            mensajeDiv.textContent = '❌ Esa hora está fuera del horario de atención.';
            return;
        }

        // obtengo también los datos médicos opcionales
        const tipoSangre = document.getElementById('tipoSangre')?.value || 'Desconocido';
        const alergias = document.getElementById('alergias')?.value.trim() || 'Ninguna';
        const enfermedadCronica = document.getElementById('enfermedadCronica')?.value.trim() || 'Ninguna';
        const medicacion = document.getElementById('medicacion')?.value.trim() || 'Ninguna';

        // convierto la fecha y hora en un ISO válido
        const fechaISO = new Date(`${fecha}T${hora}:00`).toISOString();

        // preparo el cuerpo del POST
        const body = {
            motivo: procedimiento,
            fecha: fechaISO,
            telefono: telefono,
            datosMedicosPreventivos: {
                tipoSangre: tipoSangre,
                alergias: alergias,
                enfermedadCronica: enfermedadCronica,
                medicacion: medicacion
            }
        };
      
        try {
            mensajeDiv.textContent = 'Enviando solicitud...';
          
            const res = await fetch(`${API_URL}/citas/agendar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(body)
            });

            const data = await res.json(); // parseo la respuesta
            console.log('Respuesta agendar cita:', data);

            if (res.ok) {
                // si se creó la cita, actualizo el perfil con los datos médicos
                const perfilActualizado = await actualizarPerfilConDatosMedicos(
                    token, tipoSangre, alergias, enfermedadCronica, medicacion
                );

                mensajeDiv.classList.add('success');
                mensajeDiv.textContent = '✅ Cita agendada correctamente. Datos médicos guardados en tu perfil.';
                form.reset(); // limpio el formulario

                // recargo datos para refrescar el perfil
                setTimeout(cargarDatosDelPerfil, 1000);
            } else {
                mensajeDiv.classList.add('error');
            mensajeDiv.textContent = `❌ Error: ${data.msg || 'No se pudo agendar la cita.'}`;
            }

        } catch (error) {
            console.error('Error agendar cita:', error);
            mensajeDiv.classList.add('error');
            mensajeDiv.textContent = '❌ Error de conexión con el servidor.';
        }
    });
});