
function toggleMenu() {
  const menu = document.getElementById('side_menu');
  menu.classList.toggle('active');
}

function closeMenu() {
  const menu = document.getElementById('side_menu');
  menu.classList.remove('active');
}

ScrollReveal().reveal('.reveal_fade', {
  duration: 2000,
  origin: 'rigth',
  distance: '20px',
  opacity: 0,
  easing: 'ease-out',
  delay: 100,
  reset: false
});

ScrollReveal().reveal('.reveal_slide', {
  duration: 2000,
  origin: 'left',
  distance: '50px',
  opacity: 0,
  easing: 'ease-in-out',
  delay: 200,
  reset: false
});

ScrollReveal().reveal('.subtitulo_fade', {
  duration: 2000,
  origin: 'rigth',
  distance: '20px',
  opacity: 0,
  easing: 'ease-out',
  delay: 100,
  reset: false
});

ScrollReveal().reveal('.subtitulo_slide', {
  duration: 2000,
  origin: 'left',
  distance: '50px',
  opacity: 0,
  easing: 'ease-in-out',
  delay: 200,
  reset: false
});

ScrollReveal().reveal('.text_reveal', {
  duration: 2000,
  origin: 'right',
  distance: '50px',
  opacity: 0,
  easing: 'ease-in-out',
  delay: 200,
  reset: false
});

ScrollReveal().reveal('.text_slide', {
  duration: 2000,
  origin: 'left',
  distance: '50px',
  opacity: 0,
  easing: 'ease-in-out',
  delay: 200,
  reset: false
});