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


    document.querySelector('.formulario-paso ').addEventListener('submit', async function(event) {
  event.preventDefault();

  // Obtener valores y limpiar espacios
  const nombre = document.getElementById('nombre').value.trim();
  const apellido = document.getElementById('apellido').value.trim();
  const telefono = document.getElementById('telefono').value.trim();
  const email = document.getElementById('email').value.trim();
  const contrasena = document.getElementById('contrasena').value;
  const confirmar = document.getElementById('confirmar-contrasena').value;

  // Validaciones mejoradas
  if (!nombre || !apellido || !telefono || !email || !contrasena) {
    alert('Por favor, completa todos los campos');
    return;
  }

  if (contrasena !== confirmar) {
    alert('Las contraseñas no coinciden');
    return;
  }

  if (contrasena.length < 6) {
    alert('La contraseña debe tener al menos 6 caracteres');
    return;
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Por favor, ingresa un email válido');
    return;
  }

  // Validar teléfono (solo números, mínimo 10 dígitos)
  if (telefono.length < 10 || !/^\d+$/.test(telefono)) {
    alert('El número telefónico debe tener al menos 10 dígitos');
    return;
  }

  // Datos que enviaremos al backend
  const datos = {
    nombre: nombre,
    apellido: apellido,
    numero_telefono: telefono,
    correo_electronico: email,
    contrasena: contrasena,
    idRol: 2 // Cliente por defecto
  };

  // Deshabilitar el botón para evitar envíos múltiples
  const boton = document.querySelector('.boton-principal');
  const textoOriginal = boton.innerHTML;
  boton.disabled = true;
  boton.innerHTML = '<span class="boton-registrar-icono">⏳</span> Registrando...';

  try {
    const respuesta = await fetch('http://localhost:7000/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(datos)
    });

    // Manejar diferentes tipos de respuesta
    const contentType = respuesta.headers.get('content-type');
    let resultado;
    
    if (contentType && contentType.includes('application/json')) {
      resultado = await respuesta.json();
      sessionStorage.setItem("usuario", JSON.stringify(datos));
    } else {
      resultado = await respuesta.text();
    }

    if (!respuesta.ok) {
      // Manejar errores específicos del servidor
      if (respuesta.status === 409) {
        throw new Error('El correo electrónico o número telefónico ya está registrado');
      } else if (respuesta.status === 400) {
        throw new Error('Datos inválidos. Por favor, verifica la información');
      } else {
        throw new Error(`Error del servidor: ${resultado.message || resultado}`);
      }
    }

    console.log('Usuario registrado:', resultado);
    alert('¡Registro exitoso! Bienvenido/a ' + nombre);
    
    // Limpiar formulario después del registro exitoso
    document.querySelector('.formulario-paso').reset();

     switch (result.idRol) {
          case 2: // Cliente o admin restaurante
            formularioPaso1.classList.add("oculto");
            formularioPaso1.classList.remove("visible");
            formularioPaso2.classList.remove("oculto");
            formularioPaso2.classList.add("visible");

            indicadorPaso1.classList.remove("activo");
            indicadorPaso2.classList.add("activo");
            break;

          default:
            alert("Rol no reconocido");
            break;
        }
    // Opcional: redirigir a otra página
    // window.location.href = '/login.html';

  } catch (error) {
    console.error('Error al registrar:', error.message);
    alert('Error: ' + error.message);
  } finally {
    // Rehabilitar el botón
    boton.disabled = false;
    boton.innerHTML = textoOriginal;
  }
});

document.getElementById('paso-2').onsubmit = async function(e) {
  e.preventDefault();
  const form = e.target;

  // Validar imagen
  if (!imagenFile) {
    alert("Selecciona una imagen antes de guardar.");
    return;
  }

  // Prepara FormData (multipart/form-data)
  const formData = new FormData();
  formData.append("nombre-negocio", form.nombre.value);
  formData.append("telefono-negocio", form.telefono.value)
  formData.append("direccion", form.direccion.value);
  formData.append("precio", form.precio.value);
  formData.append("id_categoria", form.id_categoria.value);
  formData.append("id_restaurante", id_restaurante);
  formData.append("imagen", imagenFile);

  // Envía a backend
  try {
    let response = await fetch("http://localhost:7000/api/products", {
      method: "POST",
      'Authorization': `Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJQZWRybyJ9.EtBlTRFLmyKB9U-RlcRA6afFdkaeukIY6hajCE1hLos`,
      'X-User-NAME': `Pedro`,
      // Authorization': `Bearer ${token}`,
      // 'X-User-NAME': `${nombre}`,
      body: formData // Importante: fetch maneja los headers
    });
    if (response.ok) {
      alert("Producto agregado correctamente en la base de datos.");
      // Opcional: puedes refrescar productos desde la API aquí
    } else {
      let error = '';
      try {
        const errObj = await response.json();
        error = errObj.error || '';
      } catch (e) {}
      alert("Error al guardar en la base de datos. " + error);
    }
  } catch (err) {
    alert("Error de conexión con la API.");
  }

  // Actualiza localmente
  if (editando && idxEditando !== -1) {
    productos[idxEditando] = {
      nombre: form.nombre.value,
      descripcion: form.descripcion.value,
      precio: parseFloat(form.precio.value),
      id_categoria: parseInt(form.id_categoria.value),
      id_restaurante: parseInt(form.id_restaurante.value),
      url_imagen: ''
    };
  } else {
    productos.push({
      nombre: form.nombre.value,
      descripcion: form.descripcion.value,
      precio: parseFloat(form.precio.value),
      id_categoria: parseInt(form.id_categoria.value),
      id_restaurante: parseInt(form.id_restaurante.value),
      url_imagen: ''
    });
  }

  renderProductos();
  cerrarModal();
};

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