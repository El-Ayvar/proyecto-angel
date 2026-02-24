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
      el.parentElement.style.display = isLoggedIn ? 'none' : 'block';
    });
    opcionesVisibles.forEach(el => {
      el.parentElement.style.display = isLoggedIn ? 'block' : 'none';
    });
  }
  
  // Actualizar menu_tablet
  const menuTablet = document.getElementById('menu_tablet');
  if (menuTablet) {
    const opcionesOcultas = menuTablet.querySelectorAll('.opcion_oculta_after');
    const opcionesVisibles = menuTablet.querySelectorAll('.opcion_oculta_because');
    
    opcionesOcultas.forEach(el => {
      el.parentElement.style.display = isLoggedIn ? 'none' : 'block';
    });
    opcionesVisibles.forEach(el => {
      el.parentElement.style.display = isLoggedIn ? 'block' : 'none';
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

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  actualizarVisibilidadMenus();
});

// También ejecutar cuando cambia el storage (en otra pestaña)
window.addEventListener('storage', () => {
  actualizarVisibilidadMenus();
});