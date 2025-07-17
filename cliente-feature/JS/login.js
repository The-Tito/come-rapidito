document.querySelector('.formulario-inicio-sesion').addEventListener('submit', async function(event) {
  event.preventDefault();

  // Obtener valores y limpiar espacios
  const telefono = document.getElementById('email').value.trim();
  const contrasena = document.getElementById('password').value;

  // Validaciones mejoradas
  if (!nombre || !apellido || !telefono || !email || !contrasena) {
    alert('Por favor, completa todos los campos');
    return;
  }



  if (contrasena.length < 6) {
    alert('La contraseña debe tener al menos 6 caracteres');
    return;
  }


  // Validar teléfono (solo números, mínimo 10 dígitos)
  if (telefono.length < 10 || !/^\d+$/.test(telefono)) {
    alert('El número telefónico debe tener al menos 10 dígitos');
    return;
  }

  // Datos que enviaremos al backend
  const datos = {
    numero_telefono: telefono,
    contrasena: contrasena, // Cliente por defecto
  };

  // Deshabilitar el botón para evitar envíos múltiples
  const boton = document.querySelector('.boton-modal boton-continuar');
  const textoOriginal = boton.innerHTML;
  boton.disabled = true;
  boton.innerHTML = '<span class="boton-registrar-icono">⏳</span> Registrando...';

  try {
    const respuesta = await fetch('http://localhost:7000/login', {
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
    document.querySelector('.formulario').reset();

    switch (datos.idRol) {
      case 1: // Cliente
        window.location.href = "../pages/sesion-iniciada.html";
        break;
      case 2:
        window.location.href = "../../admin-feature/administrador/pages/editInfo.html"
        break;
      case 3:
        window.location.href = "../../repartidor-feature/pages/pedidos-activos.html"
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