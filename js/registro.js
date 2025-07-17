//document.addEventListener('DOMContentLoaded', () => {
//  const form = document.getElementById('formRegistro');
//
//  form.addEventListener('submit', async (event) => {
//    event.preventDefault();
//
//    // 🧠 Captura de datos del formulario
//    const nombre = document.getElementById('nombre').value.trim();
//    const correo = document.getElementById('correo').value.trim();
//    const contrasena = document.getElementById('contrasena').value.trim();
//    const rol = 'paciente';  // Puedes hacerlo dinámico si lo necesitas
//
//    // 🔍 Validaciones básicas
//    if (!nombre || !correo || !contrasena) {
//      alert('❗ Por favor completa todos los campos');
//      return;
//    }
//
//    try {
//      // 🚀 Envío al backend
//      const respuesta = await fetch('http://localhost:3000/api/registro', {
//        method: 'POST',
//        headers: {
//          'Content-Type': 'application/json'
//        },
//        body: JSON.stringify({ nombre, correo, contrasena, rol })
//      });
//
//      // 🩺 Manejo de respuestas del servidor
//      const resultado = await respuesta.json();
//
//      if (!respuesta.ok) {
//        throw new Error(resultado.error || 'Error desconocido');
//      }
//
//      // ✅ Registro exitoso
//      alert('✅ Usuario registrado correctamente');
//      form.reset();  // Limpia el formulario
//
//    } catch (error) {
//      console.error('❌ Registro fallido:', error.message);
//      alert(`Registro fallido: ${error.message}`);
//    }
//  });
//});

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formRegistro');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const contrasena = document.getElementById('contrasena').value.trim();
    const rol = 'paciente';

    if (!nombre || !correo || !contrasena) {
      alert('❗ Por favor completa todos los campos');
      return;
    }

    try {
      const respuesta = await fetch('http://localhost:3000/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, correo, contrasena, rol })
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        console.error('🧠 Error devuelto por el servidor:', datos);
        throw new Error(datos.error || 'Error desconocido');
      }

      alert('✅ Usuario registrado correctamente');
      form.reset();
    } catch (error) {
      console.error('❌ Registro fallido:', error.message);
      alert(`Registro fallido: ${error.message}`);
    }
  });
});