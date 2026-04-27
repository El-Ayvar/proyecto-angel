function actualizarVisibilidadMenus() {
    const isLoggedIn = !!localStorage.getItem('token');
    const usuarioStr = localStorage.getItem('usuario');
    const usuario = usuarioStr ? JSON.parse(usuarioStr) : {};
    const rol = usuario.rol || null;

// Cambia '.image-comparison' por '.boxImg'
    const sliders = document.querySelectorAll('.boxImg'); 
    sliders.forEach(slider => {
        const range = slider.querySelector('.slider-range');
        
        // Agregamos un "if" para que no marque error en las cards que no tienen slider (como la de sarro)
        if (range) {
            range.addEventListener('input', (e) => {
                slider.style.setProperty('--position', `${e.target.value}%`);
            });
        }
    });
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