//async function cargarPanel() {
//    const token = localStorage.getItem('token');
//    if (!token) {
//        alert('No has iniciado sesión');
//        window.location.href = '/login.html';
//        return;
//    }
//    try {
//        const res = await fetch('http://localhost:3000/api/paciente', {
//        method: 'GET',
//        headers: {
//            'Authorization': `Bearer ${token}`
//        }
//        });
//        const data = await res.json();
//        if (res.ok) {
//            document.getElementById('saludo').textContent = `Hola, ${data.nombre}. Tu rol es: ${data.rol}`;
//        } else {
//            alert('Token inválido o expirado');
//            localStorage.removeItem('token');
//            window.location.href = '../login.html';
//        }
//    } catch (error) {
//        alert('Error al conectar con el servidor');
//    }
//}
//    function cerrarSesion() {
//        localStorage.removeItem('token');
//        window.location.href = '../login.html';
//    }
//cargarPanel();
async function cargarPanel() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('No has iniciado sesión');
    window.location.href = '/login.html';
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/api/pacientes/perfil', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (res.ok) {
      document.getElementById('saludo').textContent = `Hola, ${data.nombre}. Tu rol es: ${data.rol}`;

      const procedimientosDiv = document.getElementById('procedimientos');
      procedimientosDiv.innerHTML = `<h3>Procedimientos realizados:</h3>`;

      if (data.procedimientos.length === 0) {
        procedimientosDiv.innerHTML += `<p>No hay procedimientos registrados.</p>`;
      } else {
        data.procedimientos.forEach(proc => {
          const div = document.createElement('div');
          div.className = 'card';
          div.innerHTML = `
            <strong>${proc.nombre}</strong><br>
            <em>${proc.fecha}</em><br>
            <p>${proc.descripcion}</p>
          `;
          procedimientosDiv.appendChild(div);
        });
      }
    } else {
      alert('Token inválido o expirado');
      localStorage.removeItem('token');
      window.location.href = '../views/iniciar-sesion.html';
    }
  } catch (error) {
    alert('Error al conectar con el servidor');
  }
}

function cerrarSesion() {
  localStorage.removeItem('token');
  window.location.href = '/login.html';
}

cargarPanel();