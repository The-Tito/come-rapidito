document.addEventListener('DOMContentLoaded', () => {
    
    // --- NUEVO CÓDIGO MODIFICADO PARA EL MODAL ---

    const modal = document.getElementById('modal-login');
    const cerrarModalBtn = document.getElementById('cerrar-modal-login');

    // 1. Seleccionamos TODOS los botones que deben abrir el modal
    const botonesParaAbrirModal = [
        document.getElementById('abrir-modal-login'),
        document.getElementById('abrir-modal-repartidor'),
        document.getElementById('abrir-modal-negocio')
    ];

    // Función para abrir el modal
    const abrirModal = (evento) => {
        evento.preventDefault(); // Previene el comportamiento por defecto del enlace (ej. saltar a '#')
        if (modal) {
            modal.classList.add('modal-superposicion-visible');
        }
    };

    // Función para cerrar el modal
    const cerrarModal = () => {
        if (modal) {
            modal.classList.remove('modal-superposicion-visible');
        }
    };

    // 2. Asignamos el evento de 'click' a cada uno de los botones para abrir
    botonesParaAbrirModal.forEach(boton => {
        if (boton) { // Verificamos que el botón exista antes de añadir el listener
            boton.addEventListener('click', abrirModal);
        }
    });

    // 3. Asignamos los eventos para cerrar el modal (esto no cambia)
    if (cerrarModalBtn) {
        cerrarModalBtn.addEventListener('click', cerrarModal);
    }
    
    if (modal) {
        modal.addEventListener('click', (evento) => {
            // Cierra el modal solo si el clic es en el fondo (la superposición)
            if (evento.target === modal) {
                cerrarModal();
            }
        });
    }

});