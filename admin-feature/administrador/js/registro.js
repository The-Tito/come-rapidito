document.addEventListener('DOMContentLoaded', () => {

    // --- ELEMENTOS DEL DOM ---
    // Indicadores de paso
    const indicador1 = document.getElementById('indicador-1');
    const indicador2 = document.getElementById('indicador-2');
    
    // Formularios de cada paso
    const paso1 = document.getElementById('paso-1');
    const paso2 = document.getElementById('paso-2');
    
    // Botones
    const botonContinuarPaso1 = document.getElementById('boton-continuar-paso1');
    
    // Inputs de tiempo
    const inputsHora = document.querySelectorAll('.input-hora');
    const inputsMinuto = document.querySelectorAll('.input-minuto');

    // Cajas para subir archivos
    const cajasSubida = document.querySelectorAll('.caja-subida');


    // --- FUNCIONES ---

    function cambiarPaso(numeroPaso) {
        if (numeroPaso === 1) {
            // Mostrar paso 1
            paso1.classList.add('visible');
            paso1.classList.remove('oculto');
            paso2.classList.add('oculto');
            paso2.classList.remove('visible');
            
            // Actualizar indicador
            indicador1.classList.add('activo');
            indicador2.classList.remove('activo');
        } else if (numeroPaso === 2) {
            // Mostrar paso 2
            paso2.classList.add('visible');
            paso2.classList.remove('oculto');
            paso1.classList.add('oculto');
            paso1.classList.remove('visible');
            
            // Actualizar indicador
            indicador2.classList.add('activo');
            indicador1.classList.remove('activo');
        }
    }


    // --- EVENT LISTENERS ---

    // 1. Cambiar de paso al hacer clic en los indicadores
    indicador1.addEventListener('click', () => cambiarPaso(1));
    indicador2.addEventListener('click', () => cambiarPaso(2));

    // 2. Cambiar de paso con el botón "Continuar"
    botonContinuarPaso1.addEventListener('click', () => {
        // Aquí podrías agregar validaciones para el paso 1 antes de continuar
        cambiarPaso(2);
    });
    
    // 3. Simular clic en input 'file' al hacer clic en la caja de subida
    cajasSubida.forEach(caja => {
        caja.addEventListener('click', () => {
            // Busca el input de tipo 'file' que está justo después de la etiqueta 'label'
            caja.querySelector('input[type="file"]').click();
        });
    });

    // 4. Limitar valores en los campos de hora y minutos
    function limitarValor(input, max) {
        if (parseInt(input.value) > max) {
            input.value = max;
        }
        if (parseInt(input.value) < 0 || input.value === '') {
            // No permitir valores negativos, pero sí permitir que esté vacío para el placeholder
        }
    }

    inputsHora.forEach(input => {
        input.addEventListener('input', () => limitarValor(input, 12));
    });

    inputsMinuto.forEach(input => {
        input.addEventListener('input', () => limitarValor(input, 59));
        // Formatear a dos dígitos al salir del campo
        input.addEventListener('blur', () => {
            if (input.value && input.value.length === 1) {
                input.value = '0' + input.value;
            }
        });
    });

    // 5. Manejar el envío final del formulario
    paso2.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevenimos el envío real para este prototipo
        alert('¡Registro completado! (Simulación)');
        
        // Aquí podrías recolectar todos los datos de ambos formularios y enviarlos
        const formData = new FormData(paso1);
        const formDataPaso2 = new FormData(paso2);
        
        for(let [key, value] of formDataPaso2.entries()){
            formData.append(key, value);
        }

        // Mostrar los datos en la consola
        console.log("Datos del restaurante a registrar:");
        for(let [key, value] of formData.entries()){
            console.log(`${key}: ${value}`);
        }
    });

});