// ========================================
// Gestión de visibilidad según login state
// ========================================

//function actualizarVisibilidadMenus() {
//  const isLoggedIn = !!localStorage.getItem('token');
//  
//  // Actualizar side_menu
//  const sideMenu = document.getElementById('side_menu');
//  if (sideMenu) {
//    const opcionesOcultas = sideMenu.querySelectorAll('.opcion_oculta_after');
//    const opcionesVisibles = sideMenu.querySelectorAll('.opcion_oculta_because');
//
//    opcionesOcultas.forEach(el => {
//      const target = (el.parentElement && el.parentElement.tagName.toLowerCase() === 'a') ? el.parentElement : el;
//      if (isLoggedIn) {
//        target.classList.add('opcion_oculta_because');
//        el.classList.add('opcion_oculta_because');
//        console.debug('ocultar (opcion_oculta_after) ->', target.href || target);
//      } else {
//        target.classList.remove('opcion_oculta_because');
//        el.classList.remove('opcion_oculta_because');
//        console.debug('mostrar (opcion_oculta_after) ->', target.href || target);
//      }
//    });
//    // estas opciones tienen la clase `opcion_oculta_because` que las oculta por defecto,
//    // para mostrarlas quitamos esa clase del propio elemento cuando el usuario está logueado
//    opcionesVisibles.forEach(el => {
//      const target = (el.parentElement && el.parentElement.tagName.toLowerCase() === 'a') ? el.parentElement : el;
//      // Special-case: links to agendar-cita should be visible before login
//      const href = (target.getAttribute && target.getAttribute('href')) || '';
//      const isAgendarLink = href.includes('agendar-cita.html');
//      if (isAgendarLink) {
//        target.classList.remove('opcion_oculta_because');
//        el.classList.remove('opcion_oculta_because');
//        console.debug('agendar visible ->', target.href || target);
//      } else {
//        if (isLoggedIn) {
//          target.classList.remove('opcion_oculta_because');
//          el.classList.remove('opcion_oculta_because');
//          console.debug('mostrar (opcion_oculta_because) ->', target.href || target);
//        } else {
//          target.classList.add('opcion_oculta_because');
//          el.classList.add('opcion_oculta_because');
//          console.debug('ocultar (opcion_oculta_because) ->', target.href || target);
//        }
//      }
//    });
//
//    const opcionesSoloOdontologo = sideMenu.querySelectorAll('.solo-odontologo');
//    const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
//    const rol = usuario?.rol || null;
//    opcionesSoloOdontologo.forEach(el => {
//      const target = (el.parentElement && el.parentElement.tagName.toLowerCase() === 'a') ? el.parentElement : el;
//      if (isLoggedIn && rol === 'odontologo') {
//        target.classList.remove('opcion_oculta_because');
//        el.classList.remove('opcion_oculta_because');
//        console.debug('mostrar solo-odontologo ->', target.href || target);
//      } else {
//        target.classList.add('opcion_oculta_because');
//        el.classList.add('opcion_oculta_because');
//        console.debug('ocultar solo-odontologo ->', target.href || target);
//      }
//    });
//    // Agendar-cita click handling (side_menu anchors)
//    const agendarAnchors = sideMenu.querySelectorAll('a[href*="agendar-cita.html"]');
//    agendarAnchors.forEach(link => {
//      if (link._requiresLoginHandler) {
//        link.removeEventListener('click', link._requiresLoginHandler);
//        delete link._requiresLoginHandler;
//      }
//      if (!isLoggedIn) {
//        const handler = function(e) {
//          e.preventDefault();
//          mostrarAviso('Debes iniciar sesión para agendar una cita');
//        };
//        link.addEventListener('click', handler);
//        link._requiresLoginHandler = handler;
//      }
//    });
//  }
//
//  // Actualizar menu_tablet
//  const menuTablet = document.getElementById('menu_tablet');
//  if (menuTablet) {
//    const opcionesOcultas = menuTablet.querySelectorAll('.opcion_oculta_after');
//    const opcionesVisibles = menuTablet.querySelectorAll('.opcion_oculta_because');
//
//    opcionesOcultas.forEach(el => {
//      const target = (el.parentElement && el.parentElement.tagName.toLowerCase() === 'a') ? el.parentElement : el;
//      if (isLoggedIn) {
//        target.classList.add('opcion_oculta_because');
//        el.classList.add('opcion_oculta_because');
//      } else {
//        target.classList.remove('opcion_oculta_because');
//        el.classList.remove('opcion_oculta_because');
//      }
//    });
//    opcionesVisibles.forEach(el => {
//      const target = (el.parentElement && el.parentElement.tagName.toLowerCase() === 'a') ? el.parentElement : el;
//      const href = (target.getAttribute && target.getAttribute('href')) || '';
//      const isAgendarLink = href.includes('agendar-cita.html');
//      if (isAgendarLink) {
//        target.classList.remove('opcion_oculta_because');
//        el.classList.remove('opcion_oculta_because');
//      } else {
//        if (isLoggedIn) {
//          target.classList.remove('opcion_oculta_because');
//          el.classList.remove('opcion_oculta_because');
//        } else {
//          target.classList.add('opcion_oculta_because');
//          el.classList.add('opcion_oculta_because');
//        }
//      }
//    });
//
//    const opcionesSoloOdontologoTablet = menuTablet.querySelectorAll('.solo-odontologo');
//    const usuario2 = JSON.parse(localStorage.getItem('usuario') || 'null');
//    const rol2 = usuario2?.rol || null;
//    opcionesSoloOdontologoTablet.forEach(el => {
//      const target = (el.parentElement && el.parentElement.tagName.toLowerCase() === 'a') ? el.parentElement : el;
//      if (isLoggedIn && rol2 === 'odontologo') {
//        target.classList.remove('opcion_oculta_because');
//        el.classList.remove('opcion_oculta_because');
//      } else {
//        target.classList.add('opcion_oculta_because');
//        el.classList.add('opcion_oculta_because');
//      }
//    });
//    // Agendar-cita click handling (menu_tablet anchors)
//    const agendarAnchorsTablet = menuTablet.querySelectorAll('a[href*="agendar-cita.html"]');
//    agendarAnchorsTablet.forEach(link => {
//      if (link._requiresLoginHandler) {
//        link.removeEventListener('click', link._requiresLoginHandler);
//        delete link._requiresLoginHandler;
//      }
//      if (!isLoggedIn) {
//        const handler = function(e) {
//          e.preventDefault();
//          mostrarAviso('Debes iniciar sesión para agendar una cita');
//        };
//        link.addEventListener('click', handler);
//        link._requiresLoginHandler = handler;
//      }
//    });
//  }
//
//  // Attach logout button behavior if present
//  const logoutBtn = document.getElementById('cerrar-sesion');
//  if (logoutBtn) {
//    logoutBtn.addEventListener('click', () => {
//      localStorage.removeItem('token');
//      localStorage.removeItem('usuario');
//      actualizarVisibilidadMenus();
//      window.location.href = '../index.html';
//    });
//  }
//}
//
//function toggleMenu() {
//  const menu = document.getElementById('side_menu');
//  if (menu) {
//    menu.classList.toggle('active');
//  }
//}
//
//function closeMenu() {
//  const menu = document.getElementById('side_menu');
//  if (menu) {
//    menu.classList.remove('active');
//  }
//}
//
//// ---------- mensajería en pantalla ----------
//function mostrarAviso(texto, tipo = 'info', callback) {
//    let modal = document.getElementById('aviso-modal');
//    if (!modal) {
//        modal = document.createElement('div');
//        modal.id = 'aviso-modal';
//        // structure only; styling will be handled via CSS/SCSS
//        modal.innerHTML = `
//            <div id="aviso-contenido" class="aviso-contenido">
//                <p id="aviso-texto" class="aviso-texto"></p>
//                <button id="aviso-ok" class="aviso-ok">OK</button>
//            </div>
//        `;
//        document.body.appendChild(modal);
//        modal.querySelector('#aviso-ok').addEventListener('click', () => {
//            modal.classList.remove('visible');
//            if (typeof callback === 'function') callback();
//        });
//    }
//    const textoElem = modal.querySelector('#aviso-texto');
//    textoElem.textContent = texto;
//    textoElem.className = 'aviso-texto ' + tipo; // tipo can be 'error','success','info'
//    modal.classList.add('visible');
//}
//
//// Ejecutar al cargar la página
//document.addEventListener('DOMContentLoaded', () => {
//  actualizarVisibilidadMenus();
//});
//
//// También ejecutar cuando cambia el storage (en otra pestaña)
//window.addEventListener('storage', () => {
//  actualizarVisibilidadMenus();
//});
// ========================================
// Gestión de visibilidad del Menú Header
// ========================================

function actualizarVisibilidadMenus() {
    const isLoggedIn = !!localStorage.getItem('token');
    const usuarioStr = localStorage.getItem('usuario');
    const usuario = usuarioStr ? JSON.parse(usuarioStr) : {};
    const rol = usuario.rol || null;

    // 1. Elementos que DESAPARECEN cuando inicias sesión (ej. Iniciar sesión)
    document.querySelectorAll('.ocultar-si-logueado').forEach(el => {
        el.style.display = isLoggedIn ? 'none' : '';
    });

    // 2. Elementos que APARECEN al iniciar sesión (ej. Mi Perfil)
    document.querySelectorAll('.requiere-login').forEach(el => {
        el.style.display = isLoggedIn ? '' : 'none';
    });

    // 3. Elementos que APARECEN SOLO para Odontólogos (ej. Panel Doctor)
    document.querySelectorAll('.solo-odontologo').forEach(el => {
        if (isLoggedIn && rol === 'odontologo') {
            el.style.display = '';
        } else {
            el.style.display = 'none';
        }
    });

    // 4. Lógica de "Agendar Cita" (Siempre se ve, pero evaluamos el click)
    document.querySelectorAll('.btn-agendar-cita').forEach(link => {
        // Limpiamos listeners previos por si se ejecuta varias veces
        if (link._requiresLoginHandler) {
            link.removeEventListener('click', link._requiresLoginHandler);
            delete link._requiresLoginHandler;
        }

        if (!isLoggedIn) {
            // Si NO está logueado, interceptamos el clic
            const handler = function(e) {
                e.preventDefault(); 
                mostrarAviso('Para agendar una cita, necesitas iniciar sesión primero.', 'info');
            };
            link.addEventListener('click', handler);
            link._requiresLoginHandler = handler;
        }
        // Si ESTÁ logueado, no le ponemos nada y el enlace "href" fluye normal.
    });

    // Asignar comportamiento al botón de cerrar sesión si está en la página
    const logoutBtn = document.getElementById('cerrar-sesion');
    if (logoutBtn && !logoutBtn.dataset.listener) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            actualizarVisibilidadMenus();
            window.location.href = '../index.html';
        });
        logoutBtn.dataset.listener = "true";
    }
}

// Menú Hamburguesa
function toggleMenu() {
    const menu = document.getElementById('side_menu');
    if (menu) menu.classList.toggle('active');
}

function closeMenu() {
    const menu = document.getElementById('side_menu');
    if (menu) menu.classList.remove('active');
}

// ========================================
// Modal Global de Avisos
// ========================================
function mostrarAviso(texto, tipo = 'info', callback) {
    let modal = document.getElementById('aviso-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'aviso-modal';
        // Estilos integrados para que se vea siempre bien sobre cualquier página
        modal.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 9999;";
        modal.innerHTML = `
            <div id="aviso-contenido" style="background: white; padding: 25px; border-radius: 8px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <p id="aviso-texto" style="font-size: 1.1em; margin-bottom: 20px; color: #2c3e50;"></p>
                <button id="aviso-ok" style="background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 1em;">Entendido</button>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelector('#aviso-ok').addEventListener('click', () => {
            modal.style.display = 'none';
            if (typeof callback === 'function') callback();
        });
    } else {
        modal.style.display = 'flex';
    }
    
    const textoElem = modal.querySelector('#aviso-texto');
    textoElem.textContent = texto;
    textoElem.style.color = (tipo === 'error') ? '#c0392b' : (tipo === 'success' ? '#27ae60' : '#2c3e50');
}

// Ejecutar todo apenas cargue la página
document.addEventListener('DOMContentLoaded', () => {
    actualizarVisibilidadMenus();
});

// Detectar cambios en otras pestañas (si cierra sesión en la pestaña 1, la pestaña 2 se actualiza)
window.addEventListener('storage', () => {
    actualizarVisibilidadMenus();
});