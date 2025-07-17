// JS para agendar cita desde tratamientos

document.addEventListener('DOMContentLoaded', function() {
  // Delegación para todos los botones de agendar
  document.querySelectorAll('.btn-agendar').forEach(btn => {
    btn.addEventListener('click', function() {
      const procedimientoId = this.dataset.procedimiento;
      mostrarFormularioCita(procedimientoId);
    });
  });
});

function mostrarFormularioCita(procedimientoId) {
  // Elimina el modal y botones de agendar cita agregados previamente
  const modalExistente = document.getElementById('modal-cita');
  if (modalExistente) {
    modalExistente.remove();
  }
  document.querySelectorAll('.btn-agendar').forEach(btn => btn.remove());
}
