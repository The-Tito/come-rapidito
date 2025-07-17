document.addEventListener('DOMContentLoaded', () => {
    
    // --- NUEVO CÓDIGO MODIFICADO PARA EL MODAL ---

    const modal = document.getElementById('modal-login');
    const cerrarModalBtn = document.getElementById('cerrar-modal-login');

    // 1. Seleccionamos TODOS los botones que deben abrir el modal
    const botonesParaAbrirModal = [
        document.getElementById('abrir-modal-login'),
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


// Llamar a restaurantes
document.addEventListener("DOMContentLoaded", cargarCarruseles);

function cargarCarruseles() {
  fetch("http://localhost:7000/restaurant")
    .then(res => res.json())
    .then(data => {
      
      
      console.log(JSON.stringify(data))
      // Corregido: usar la clase correcta del HTML
      const contenedor = document.querySelector(".carruseles");
      
      // Verificar que el contenedor existe
      if (!contenedor) {
        console.error('No se encontró el contenedor de carruseles');
        return;
      }
      
      // Limpiar el contenido existente (los carruseles estáticos del HTML)
      
      const chunkSize = 4;

      for (let i = 0; i < data.length; i += chunkSize) {
        const grupo = data.slice(i, i + chunkSize);
        const carrusel = crearCarrusel(grupo);
        contenedor.appendChild(carrusel);
      }

      agregarEventosCarrusel();
    })
    .catch(error => {
      console.error('Error al cargar los restaurantes:', error);
    });
}

function crearCarrusel(restaurantes) {
  const carrusel = document.createElement("div");
  carrusel.className = "carrusel";

  const btnIzq = document.createElement("button");
  btnIzq.className = "carrusel-boton carrusel-boton-izquierda";
  btnIzq.setAttribute("aria-label", "Anterior");
  btnIzq.innerHTML = "&lt;";

  const btnDer = document.createElement("button");
  btnDer.className = "carrusel-boton carrusel-boton-derecha";
  btnDer.setAttribute("aria-label", "Siguiente");
  btnDer.innerHTML = "&gt;";

  const contenedor = document.createElement("div");
  contenedor.className = "carrusel-contenedor";

  const pista = document.createElement("div");
  pista.className = "carrusel-pista";

  restaurantes.forEach(r => {
    const item = document.createElement("div");
    item.className = "carrusel-item";
    item.innerHTML = `
      <a href="../pages/restaurante.html?id=${r.id_restaurante}">
        <img src="${r.logo_url}" alt="Logo ${r.nombre_restaurante}" loading="lazy">
      </a>
    `;
    pista.appendChild(item);
  });

  contenedor.appendChild(pista);
  carrusel.appendChild(btnIzq);
  carrusel.appendChild(contenedor);
  carrusel.appendChild(btnDer);

  return carrusel;
}

function agregarEventosCarrusel() {
  document.querySelectorAll(".carrusel").forEach(carrusel => {
    const pista = carrusel.querySelector(".carrusel-pista");
    const btnIzq = carrusel.querySelector(".carrusel-boton-izquierda");
    const btnDer = carrusel.querySelector(".carrusel-boton-derecha");

    let scroll = 0;
    const paso = pista.offsetWidth; // mueve por "pantalla completa" de items

    btnIzq.addEventListener("click", () => {
      scroll = Math.max(0, scroll - paso);
      pista.scrollTo({ left: scroll, behavior: "smooth" });
    });

    btnDer.addEventListener("click", () => {
      scroll = Math.min(pista.scrollWidth - pista.offsetWidth, scroll + paso);
      pista.scrollTo({ left: scroll, behavior: "smooth" });
    });
  });
}


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




