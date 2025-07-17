
function toggleMenu() {
  const menu = document.getElementById('side_menu');
  menu.classList.toggle('active');
  // Actualizar visibilidad de botones según login
  const isLoggedIn = !!localStorage.getItem('token');
  // Side menu opciones
  const perfilBtn = menu.querySelector('.opcion_oculta_because.perfil');
  const iniciarSesionBtn = menu.querySelector('.opcion_oculta_after.iniciar-sesion');
  if (perfilBtn) {
    perfilBtn.style.setProperty('display', isLoggedIn ? 'block' : 'none', 'important');
  }
  if (iniciarSesionBtn) {
    iniciarSesionBtn.style.setProperty('display', isLoggedIn ? 'none' : 'block', 'important');
  }
  // También actualiza los botones del menú tablet si quieres sincronizar
  const menuTablet = document.getElementById('menu_tablet');
  if (menuTablet) {
    const perfilBtnTablet = menuTablet.querySelector('.opcion_oculta_because.perfil');
    const iniciarSesionBtnTablet = menuTablet.querySelector('.opcion_oculta_after.iniciar-sesion');
    if (perfilBtnTablet) {
      perfilBtnTablet.style.setProperty('display', isLoggedIn ? 'inline-block' : 'none', 'important');
    }
    if (iniciarSesionBtnTablet) {
      iniciarSesionBtnTablet.style.setProperty('display', isLoggedIn ? 'none' : 'inline-block', 'important');
    }
  }
}

function closeMenu() {
  const menu = document.getElementById('side_menu');
  menu.classList.remove('active');
}

ScrollReveal().reveal('.reveal_fade', {
  duration: 1500,
  origin: 'right',
  distance: '20px',
  opacity: 0,
  easing: 'ease-out',
  delay: 100,
  reset: false
});

ScrollReveal().reveal('.reveal_slide', {
  duration: 1500,
  origin: 'left',
  distance: '50px',
  opacity: 0,
  easing: 'ease-in-out',
  delay: 200,
  reset: false
});
