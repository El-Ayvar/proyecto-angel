// ========================================
// Gestión de visibilidad según login state
// ========================================

function actualizarVisibilidadMenus() {
  const isLoggedIn = !!localStorage.getItem('token');
  
  // Actualizar side_menu
  const sideMenu = document.getElementById('side_menu');
  if (sideMenu) {
    const opcionesOcultas = sideMenu.querySelectorAll('.opcion_oculta_after');
    const opcionesVisibles = sideMenu.querySelectorAll('.opcion_oculta_because');

    opcionesOcultas.forEach(el => {
      const p = el.parentElement;
      if (isLoggedIn) p.classList.add('hidden');
      else p.classList.remove('hidden');
    });
    // estas opciones tienen la clase `opcion_oculta_because` que las oculta por defecto,
    // para mostrarlas quitamos esa clase del propio elemento cuando el usuario está logueado
    opcionesVisibles.forEach(el => {
      const p = el.parentElement;
      if (isLoggedIn) {
        el.classList.remove('opcion_oculta_because');
        if (p) p.classList.remove('hidden');
      } else {
        el.classList.add('opcion_oculta_because');
        if (p) p.classList.add('hidden');
      }
    });

    const opcionesSoloOdontologo = sideMenu.querySelectorAll('.solo-odontologo');
    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    const rol = usuario?.rol || null;
    opcionesSoloOdontologo.forEach(el => {
      const target = (el.parentElement && el.parentElement.tagName.toLowerCase() === 'a') ? el.parentElement : el;
      if (isLoggedIn && rol === 'odontologo') {
        // asegurarnos que el elemento no tenga la clase que lo oculta por defecto
        el.classList.remove('opcion_oculta_because');
        target.classList.remove('hidden');
      } else {
        el.classList.add('opcion_oculta_because');
        target.classList.add('hidden');
      }
    });
  }

  // Actualizar menu_tablet
  const menuTablet = document.getElementById('menu_tablet');
  if (menuTablet) {
    const opcionesOcultas = menuTablet.querySelectorAll('.opcion_oculta_after');
    const opcionesVisibles = menuTablet.querySelectorAll('.opcion_oculta_because');

    opcionesOcultas.forEach(el => {
      const p = el.parentElement;
      if (isLoggedIn) p.classList.add('hidden');
      else p.classList.remove('hidden');
    });
    opcionesVisibles.forEach(el => {
      const p = el.parentElement;
      if (isLoggedIn) {
        el.classList.remove('opcion_oculta_because');
        if (p) p.classList.remove('hidden');
      } else {
        el.classList.add('opcion_oculta_because');
        if (p) p.classList.add('hidden');
      }
    });

    const opcionesSoloOdontologoTablet = menuTablet.querySelectorAll('.solo-odontologo');
    const usuario2 = JSON.parse(localStorage.getItem('usuario') || 'null');
    const rol2 = usuario2?.rol || null;
    opcionesSoloOdontologoTablet.forEach(el => {
      const target = (el.parentElement && el.parentElement.tagName.toLowerCase() === 'a') ? el.parentElement : el;
      if (isLoggedIn && rol2 === 'odontologo') {
        el.classList.remove('opcion_oculta_because');
        target.classList.remove('hidden');
      } else {
        el.classList.add('opcion_oculta_because');
        target.classList.add('hidden');
      }
    });
  }
}

function toggleMenu() {
  const menu = document.getElementById('side_menu');
  if (menu) {
    menu.classList.toggle('active');
  }
}

function closeMenu() {
  const menu = document.getElementById('side_menu');
  if (menu) {
    menu.classList.remove('active');
  }
}

// ---------- mensajería en pantalla ----------
function mostrarAviso(texto, tipo = 'info', callback) {
    let modal = document.getElementById('aviso-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'aviso-modal';
        // structure only; styling will be handled via CSS/SCSS
        modal.innerHTML = `
            <div id="aviso-contenido" class="aviso-contenido">
                <p id="aviso-texto" class="aviso-texto"></p>
                <button id="aviso-ok" class="aviso-ok">OK</button>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelector('#aviso-ok').addEventListener('click', () => {
            modal.classList.remove('visible');
            if (typeof callback === 'function') callback();
        });
    }
    const textoElem = modal.querySelector('#aviso-texto');
    textoElem.textContent = texto;
    textoElem.className = 'aviso-texto ' + tipo; // tipo can be 'error','success','info'
    modal.classList.add('visible');
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  actualizarVisibilidadMenus();
});

// También ejecutar cuando cambia el storage (en otra pestaña)
window.addEventListener('storage', () => {
  actualizarVisibilidadMenus();
});