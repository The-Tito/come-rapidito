document.addEventListener('DOMContentLoaded', () => {

    // --- VARIABLES DE ELEMENTOS DEL DOM ---
    const botonPaso1 = document.getElementById('boton-paso-1');
    const botonPaso2 = document.getElementById('boton-paso-2');
    const pasoFormulario1 = document.getElementById('paso-formulario-1');
    const pasoFormulario2 = document.getElementById('paso-formulario-2');
    
    const botonesVehiculo = document.querySelectorAll('.boton-vehiculo');
    const entradaFoto = document.getElementById('foto-vehiculo');
    const mostrarNombreArchivo = document.getElementById('mostrar-nombre-archivo');

    // --- MANEJO DE PASOS DEL FORMULARIO ---

    // Función para cambiar de paso
    function mostrarPaso(numeroPaso) {
        if (numeroPaso === 1) {
            // Activar botón y vista del paso 1
            botonPaso1.classList.add('activo');
            pasoFormulario1.classList.add('activo');
            
            // Desactivar botón y vista del paso 2
            botonPaso2.classList.remove('activo');
            pasoFormulario2.classList.remove('activo');
        } else if (numeroPaso === 2) {
            // Activar botón y vista del paso 2
            botonPaso2.classList.add('activo');
            pasoFormulario2.classList.add('activo');

            // Desactivar botón y vista del paso 1
            botonPaso1.classList.remove('activo');
            pasoFormulario1.classList.remove('activo');
        }
    }

    // Event Listeners para los botones de pasos
    botonPaso1.addEventListener('click', () => mostrarPaso(1));
    botonPaso2.addEventListener('click', () => mostrarPaso(2));

    // --- LÓGICA DEL PASO 2 ---

    // Manejo de la selección de tipo de vehículo
    botonesVehiculo.forEach(boton => {
        boton.addEventListener('click', () => {
            // Quita la clase 'activo' de todos los botones
            botonesVehiculo.forEach(btn => btn.classList.remove('activo'));
            // Añade la clase 'activo' solo al botón clickeado
            boton.classList.add('activo');
        });
    });

    // Manejo del input de archivo para mostrar el nombre
    entradaFoto.addEventListener('change', () => {
        if (entradaFoto.files.length > 0) {
            // Si se selecciona un archivo, muestra su nombre
            mostrarNombreArchivo.textContent = entradaFoto.files[0].name;
        } else {
            // Si se cancela, vuelve al texto original
            mostrarNombreArchivo.textContent = 'Foto del vehículo';
        }
    });

    // --- VALIDACIÓN Y ENVÍO DEL FORMULARIO ---
    const formulario = document.getElementById('formulario-registro');
    formulario.addEventListener('submit', (event) => {
        event.preventDefault(); // Previene el envío real del formulario
        
        // Aquí iría tu lógica de validación y envío de datos
        alert('Formulario listo para ser enviado. ¡Implementa aquí tu lógica de validación y envío!');
        
        // Ejemplo de cómo obtener los datos:
        const datosFormulario = new FormData(formulario);
        for (let [clave, valor] of datosFormulario.entries()) {
            console.log(`${clave}: ${valor}`);
        }
    });

});