//const boton = document.getElementById('boton');
//const enlace = document.createElement('a');
//
//document.getElementById('loginForm').addEventListener('submit', async (e) => {
//    e.preventDefault();
//
//    const correo = document.getElementById('correo').value;
//    const contrasena = document.getElementById('contrasena').value;
//    
//    try {
//        const res = await fetch('http://localhost:3000/api/login', {
//            method: 'POST',
//            headers: { 'Content-Type': 'application/json' },
//            body: JSON.stringify({ correo, contrasena })
//        });
//
//        const data = await res.json();
//
//        if (res.ok) {
//            console.log('Login exitoso');
//            localStorage.setItem('token', data.token);
//        // Redirigir al panel clínico
//            //window.location.href = '/panel.html';
//
//            //Mostrar mensaje en pantalla
//            const main = document.querySelector('main');
//            main.innerHTML = `<h1>Bienvenido al Consultorio de AyvarDen't </h1>`;
//
//            //activamos boton para que nos mueva de pagina
//            boton.addEventListener('click', () => {
//                window.location.href = '../views/panel.html';
//            })
//        } else {
//            alert('Error: ' + data.error);
//        } 
//    } catch (error) {
//        alert('Error de conexión');
//    }
//    //boton.addEventListener('click', () => {
//    //    enlace.target = 'panel.html';
//    //    })
//});

const boton = document.getElementById('boton');
const main = document.querySelector('main');
const mensaje = document.getElementById('mensaje');
const perfil = document.querySelectorAll('.perfil');
const iniciarSesion = document.querySelectorAll('.iniciar-sesion');
console.log('PERFIL:', perfil);
console.log('INICIAR SESION:', iniciarSesion);

function mostrarPerfil() {
perfil.forEach(el => el.style.setProperty('display', 'block', 'important'));
  iniciarSesion.forEach(el => el.style.setProperty('display', 'none', 'important'));
}
function mostrarIniciarSesion() {
  perfil.forEach(el => el.style.setProperty('display', 'none', 'important'));
  iniciarSesion.forEach(el => el.style.setProperty('display', 'inline-block', 'important'));
}

// Al cargar la página, mostrar/ocultar botones según el estado de login
window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('token')) {
    mostrarPerfil();
  } else {
    mostrarIniciarSesion();
  }
});
// Botón nuevo que aparecerá después del login
const continuarBtn = document.createElement('button');
continuarBtn.textContent = 'Continuar';
continuarBtn.style.display = 'none';
continuarBtn.style.cursor = 'pointer';
main.appendChild(continuarBtn);

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const correo = document.getElementById('correo').value;
  const contrasena = document.getElementById('contrasena').value;

  try {
    const res = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, contrasena })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      if (data.nombre) {
        localStorage.setItem('nombre', data.nombre);
      }
      // Ocultar el formulario y mensajes
      document.getElementById('loginForm').style.display = 'none';
      document.getElementById('mensaje').style.display = 'none';
      document.querySelector('h2').style.display = 'none';
      document.querySelector('p').style.display = 'none';
      // Mostrar el mensaje de bienvenida arriba del botón continuar
      const mensajeBienvenida = document.getElementById('mensajeBienvenida');
      mensajeBienvenida.textContent = `Bienvenido al consultorio de AyvarDen't`;
      mensajeBienvenida.style.display = 'block';
      // Mostrar el botón continuar justo debajo del mensaje
      const botonContinuar = document.getElementById('boton');
      botonContinuar.style.display = 'inline-block';
      mensajeBienvenida.parentNode.insertBefore(botonContinuar, mensajeBienvenida.nextSibling);
      botonContinuar.onclick = function() {
        window.location.href = '../index.html';
      };
    } else {
      document.getElementById('mensaje').innerHTML = `<h2 style=\"color: red;\">Correo o contraseña incorrectos</h2>`;
      document.getElementById('mensajeBienvenida').style.display = 'none';
    }
    setTimeout(() => {
      document.getElementById('mensaje').innerHTML = '';
    }, 2000);
  } catch (error) {
    document.getElementById('mensaje').innerHTML = `<h2 style=\"color: red;\">Error de conexión con el servidor</h2>`;
    document.getElementById('mensajeBienvenida').style.display = 'none';
  }
});