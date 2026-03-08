//// --- 1. CONFIGURACIÓN DE LOS DIENTES ---
//// Nomenclatura FDI
//const adultTeeth = {
//    upperRight: [18, 17, 16, 15, 14, 13, 12, 11],
//    upperLeft:  [21, 22, 23, 24, 25, 26, 27, 28],
//    lowerRight: [48, 47, 46, 45, 44, 43, 42, 41],
//    lowerLeft:  [31, 32, 33, 34, 35, 36, 37, 38]
//};
//
//const childTeeth = {
//    upperRight: [55, 54, 53, 52, 51],
//    upperLeft:  [61, 62, 63, 64, 65],
//    lowerRight: [85, 84, 83, 82, 81],
//    lowerLeft:  [71, 72, 73, 74, 75]
//};
//
//// --- 2. BASE DE DATOS LOCAL (En memoria) ---
//const patientData = {};
//let currentToothId = null;
//
//// --- 3. FUNCIONES DE RENDERIZADO ---
//function renderTeeth(array, containerId) {
//    const container = document.getElementById(containerId);
//    container.innerHTML = ''; // Limpiar antes de dibujar
//
//    array.forEach(toothNumber => {
//        const toothDiv = document.createElement('div');
//        toothDiv.classList.add('tooth');
//        toothDiv.id = `tooth-${toothNumber}`;
//        toothDiv.innerText = toothNumber;
//        
//        // Evento al hacer clic en un diente
//        toothDiv.onclick = () => openModal(toothNumber);
//
//        container.appendChild(toothDiv);
//    });
//}
//
//function initOdontogram() {
//    renderTeeth(adultTeeth.upperRight, 'adult-upper-right');
//    renderTeeth(adultTeeth.upperLeft, 'adult-upper-left');
//    renderTeeth(adultTeeth.lowerRight, 'adult-lower-right');
//    renderTeeth(adultTeeth.lowerLeft, 'adult-lower-left');
//
//    renderTeeth(childTeeth.upperRight, 'child-upper-right');
//    renderTeeth(childTeeth.upperLeft, 'child-upper-left');
//    renderTeeth(childTeeth.lowerRight, 'child-lower-right');
//    renderTeeth(childTeeth.lowerLeft, 'child-lower-left');
//}
//
//// --- 4. LÓGICA DE INTERFAZ ---
//function switchView(type) {
//    const adultSection = document.getElementById('odontograma-adult');
//    const childSection = document.getElementById('odontograma-child');
//    const btnAdult = document.getElementById('btn-adult');
//    const btnChild = document.getElementById('btn-child');
//
//    if (type === 'adult') {
//        adultSection.classList.remove('hidden');
//        childSection.classList.add('hidden');
//        btnAdult.classList.add('active');
//        btnChild.classList.remove('active');
//    } else {
//        adultSection.classList.add('hidden');
//        childSection.classList.remove('hidden');
//        btnAdult.classList.remove('active');
//        btnChild.classList.add('active');
//    }
//}
//
//// --- 5. LÓGICA DEL MODAL Y DATOS ---
//function openModal(toothNumber) {
//    currentToothId = toothNumber;
//    document.getElementById('modal-tooth-id').innerText = toothNumber;
//    
//    // Si el diente ya tiene datos guardados, cargarlos en el modal
//    const existingData = patientData[toothNumber];
//    if (existingData) {
//        document.getElementById('procedure').value = existingData.procedure;
//        document.getElementById('notes').value = existingData.notes;
//    } else {
//        // Limpiar modal si es un diente nuevo
//        document.getElementById('procedure').value = '';
//        document.getElementById('notes').value = '';
//    }
//
//    document.getElementById('procedure-modal').style.display = 'flex';
//}
//
//function closeModal() {
//    document.getElementById('procedure-modal').style.display = 'none';
//    currentToothId = null;
//}
//
//async function saveProcedure() {
//    const procedure = document.getElementById('procedure').value;
//    const notes = document.getElementById('notes').value;
//    const costo = document.getElementById('costo-tratamiento').value;
//
//    if (procedure === "" || costo === "") {
//        mostrarAviso("Por favor selecciona un procedimiento y define un costo.", "error");
//        return;
//    }
//
//    // Usamos la variable global de panel.js para saber a qué paciente guardarle esto
//    if (!pacienteIdActual) {
//        mostrarAviso("Error: No hay un paciente seleccionado.", "error");
//        return;
//    }
//
//    const token = localStorage.getItem('token');
//    
//    // Armamos los datos exactos que pide tu tratamientocontroller.js
//    const datosTratamiento = {
//        paciente: pacienteIdActual,
//        nombre: procedure,
//        diente: currentToothId,
//        costo: Number(costo),
//        estado: 'planeado', // Por defecto lo ponemos en planeado
//        notasClinicas: notes
//    };
//
//    try {
//        const res = await fetch(`${API_URL}/tratamientos`, {
//            method: 'POST',
//            headers: {
//                'Content-Type': 'application/json',
//                'Authorization': `Bearer ${token}`
//            },
//            body: JSON.stringify(datosTratamiento)
//        });
//
//        const data = await res.json();
//
//        if (res.ok) {
//            // Cambiar el estilo visual del diente para que se vea trabajado
//            const toothElement = document.getElementById(`tooth-${currentToothId}`);
//            toothElement.classList.add('has-data');
//            
//            mostrarAviso('✅ ' + data.msg, 'success');
//            closeModal();
//        } else {
//            mostrarAviso('❌ Error: ' + (data.msg || 'No se pudo guardar'), 'error');
//        }
//
//    } catch (error) {
//        console.error("Error al guardar tratamiento:", error);
//        mostrarAviso('Error de conexión con el servidor', 'error');
//    }
//}
//
//// Iniciar la aplicación al cargar el script
//initOdontogram();

// ==========================================
// 1. CONFIGURACIÓN DE LOS DIENTES (FDI)
// ==========================================
const adultTeeth = {
    upperRight: [18, 17, 16, 15, 14, 13, 12, 11],
    upperLeft:  [21, 22, 23, 24, 25, 26, 27, 28],
    lowerRight: [48, 47, 46, 45, 44, 43, 42, 41],
    lowerLeft:  [31, 32, 33, 34, 35, 36, 37, 38]
};

const childTeeth = {
    upperRight: [55, 54, 53, 52, 51],
    upperLeft:  [61, 62, 63, 64, 65],
    lowerRight: [85, 84, 83, 82, 81],
    lowerLeft:  [71, 72, 73, 74, 75]
};

// ==========================================
// 2. BASE DE DATOS LOCAL (En memoria para el UI)
// ==========================================
let patientData = {};
let currentToothId = null;

// ==========================================
// 3. FUNCIONES DE RENDERIZADO
// ==========================================
function renderTeeth(array, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return; // Evita errores si el HTML no ha cargado

    container.innerHTML = '';
    array.forEach(toothNumber => {
        const toothDiv = document.createElement('div');
        toothDiv.classList.add('tooth');
        toothDiv.id = `tooth-${toothNumber}`;
        toothDiv.innerText = toothNumber;
        toothDiv.onclick = () => openModal(toothNumber);
        container.appendChild(toothDiv);
    });
}

function switchView(view) {
    document.getElementById('odontograma-adult').classList.add('hidden');
    document.getElementById('odontograma-child').classList.add('hidden');
    document.getElementById('btn-adult').classList.remove('active');
    document.getElementById('btn-child').classList.remove('active');

    if (view === 'adult') {
        document.getElementById('odontograma-adult').classList.remove('hidden');
        document.getElementById('btn-adult').classList.add('active');
    } else {
        document.getElementById('odontograma-child').classList.remove('hidden');
        document.getElementById('btn-child').classList.add('active');
    }
}

// ==========================================
// 4. LÓGICA DEL MODAL
// ==========================================
function openModal(toothId) {
    currentToothId = toothId;
    document.getElementById('modal-tooth-id').innerText = toothId;
    
    // Si el diente ya tiene datos guardados, cargarlos en el modal
    const existingData = patientData[toothId];
    if (existingData) {
        document.getElementById('procedure').value = existingData.procedure || '';
        document.getElementById('costo-tratamiento').value = existingData.costo || '';
        document.getElementById('notes').value = existingData.notes || '';
    } else {
        // Limpiar modal si es un diente nuevo
        document.getElementById('procedure').value = '';
        document.getElementById('costo-tratamiento').value = '';
        document.getElementById('notes').value = '';
    }

    document.getElementById('procedure-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('procedure-modal').style.display = 'none';
    currentToothId = null;
}

// ==========================================
// 5. GUARDAR TRATAMIENTO EN EL BACKEND
// ==========================================
async function saveProcedure() {
    const procedure = document.getElementById('procedure').value;
    const notes = document.getElementById('notes').value;
    const costo = document.getElementById('costo-tratamiento').value;

    if (procedure === "" || costo === "") {
        mostrarAviso("Por favor selecciona un procedimiento y define un costo.", "error");
        return;
    }

    // pacienteIdActual viene de panel.js
    if (!pacienteIdActual) {
        mostrarAviso("Error: No hay un paciente seleccionado.", "error");
        return;
    }

    const token = localStorage.getItem('token');
    
    const datosTratamiento = {
        paciente: pacienteIdActual,
        nombre: procedure,
        diente: currentToothId,
        costo: Number(costo),
        estado: 'planeado',
        notasClinicas: notes
    };

    try {
        const res = await fetch(`${API_URL}/tratamientos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(datosTratamiento)
        });

        const data = await res.json();

        if (res.ok) {
            // 1. Guardar en la memoria local para que al darle clic de nuevo se vea
            patientData[currentToothId] = {
                procedure: procedure,
                costo: Number(costo),
                notes: notes
            };

            // 2. Cambiar el estilo visual del diente para que se vea trabajado
            const toothElement = document.getElementById(`tooth-${currentToothId}`);
            if (toothElement) {
                toothElement.classList.add('has-data');
                // Quitamos espacios al nombre para usarlo como clase CSS (ej: "Resina", "Endodoncia")
                let nombreClaseCSS = procedure.replace(/ /g, ''); 
                toothElement.classList.add(nombreClaseCSS);
            }
            
            mostrarAviso('✅ ' + data.msg, 'success');
            closeModal();
            
            // Opcional: Si tienes una función para recargar todo el expediente, la llamarías aquí.
        } else {
            mostrarAviso('❌ Error: ' + (data.msg || 'No se pudo guardar'), 'error');
        }

    } catch (error) {
        console.error("Error al guardar tratamiento:", error);
        mostrarAviso('Error de conexión con el servidor', 'error');
    }
}

// ==========================================
// 6. CARGAR HISTORIAL AL ABRIR UN EXPEDIENTE
// ==========================================
function limpiarOdontograma() {
    patientData = {}; // Vaciamos la memoria
    
    // Le quitamos todas las clases extra a los dientes para dejarlos en blanco
    const todosLosDientes = document.querySelectorAll('.tooth');
    todosLosDientes.forEach(tooth => {
        tooth.className = 'tooth'; // Restablece exactamente a solo la clase 'tooth'
    });
}

function cargarTratamientosEnOdontograma(tratamientosGuardados) {
    limpiarOdontograma();

    if (!tratamientosGuardados || tratamientosGuardados.length === 0) return;

    tratamientosGuardados.forEach(trat => {
        if (!trat.diente) return; // Si es una limpieza general o algo sin diente, lo salta

        // Guardamos en memoria
        patientData[trat.diente] = {
            procedure: trat.nombre,
            costo: trat.costo,
            // Agregamos la fecha a las notas para que el doctor sepa cuándo se hizo
            notes: `[${new Date(trat.createdAt).toLocaleDateString()}] ${trat.notasClinicas || ''}`
        };

        // Pintamos el diente en el HTML
        const toothElement = document.getElementById(`tooth-${trat.diente}`);
        if (toothElement) {
            toothElement.classList.add('has-data');
            let nombreClaseCSS = trat.nombre.replace(/ /g, ''); 
            toothElement.classList.add(nombreClaseCSS); 
        }
    });
}

// ==========================================
// 7. INICIALIZAR AL CARGAR LA PÁGINA
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Renderizar dientes de adulto
    renderTeeth(adultTeeth.upperRight, 'adult-upper-right');
    renderTeeth(adultTeeth.upperLeft, 'adult-upper-left');
    renderTeeth(adultTeeth.lowerRight, 'adult-lower-right');
    renderTeeth(adultTeeth.lowerLeft, 'adult-lower-left');

    // Renderizar dientes de niño
    renderTeeth(childTeeth.upperRight, 'child-upper-right');
    renderTeeth(childTeeth.upperLeft, 'child-upper-left');
    renderTeeth(childTeeth.lowerRight, 'child-lower-right');
    renderTeeth(childTeeth.lowerLeft, 'child-lower-left');
});