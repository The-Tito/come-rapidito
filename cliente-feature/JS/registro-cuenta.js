document.querySelector('.formulario').addEventListener('submit', async function(event) {
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
 if (!/^\d{1,10}$/.test(telefono)) {
  alert('El número telefónico debe tener máximo 10 dígitos y solo números');
  return;
}


  // Datos que enviaremos al backend
  const datos = {
    nombre: nombre,
    apellido: apellido,
    numero_telefono: telefono,
    correo_electronico: email,
    contrasena: contrasena,
    idRol: 1 // Cliente por defecto
  };

  // Deshabilitar el botón para evitar envíos múltiples
  const boton = document.querySelector('.boton-registrar');
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
    document.querySelector('.formulario').reset();

    switch (datos.idRol) {
      case 1: // Cliente
        localStorage.setItem("abrirLogin", "true");
        localStorage.setItem("usuarioNombre", nombre);
        window.location.href = "../pages/index.html";
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
function volverAtras() {
  history.back();
}