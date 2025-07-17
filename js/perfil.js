document.addEventListener('DOMContentLoaded', function() {
  // Cerrar sesión
  const cerrarSesionBtn = document.getElementById('cerrar-sesion');
  if (cerrarSesionBtn) {
    cerrarSesionBtn.addEventListener('click', function() {
      localStorage.removeItem('token');
      localStorage.removeItem('nombre');
      window.location.href = '../views/iniciar-sesion.html';
    });
  }
  // Mostrar nombre del paciente en el input
  const nombreInput = document.getElementById('nombre');
  const nombre = localStorage.getItem('nombre');
  if (nombreInput && nombre) {
    nombreInput.value = nombre;
  }
});
