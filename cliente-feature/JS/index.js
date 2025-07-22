document.addEventListener('DOMContentLoaded', () => {
    
    const abrirLogin = localStorage.getItem("abrirLogin");  

    if (abrirLogin === "true") {
    localStorage.removeItem("abrirLogin"); // 🔒 importante: evita que se abra cada vez
    mostrarModalLogin(); // 👈 esta función debes tenerla definida para abrir el modal
  } 

  function mostrarModalLogin() {
  const modal = document.getElementById("modal-login"); // o tu selector real
  modal.classList.add("modal-superposicion-visible"); // o modal.style.display = 'block', depende cómo esté hecho
  }

    // --- NUEVO CÓDIGO MODIFICADO PARA EL MODAL ---

    const modal = document.getElementById('modal-login');
    const cerrarModalBtn = document.getElementById('cerrar-modal-login');

    // 1. Seleccionamos TODOS los botones que deben abrir el modal
    const botonesParaAbrirModal = [
        document.getElementById('abrir-modal-login')
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
      sessionStorage.setItem('restaurantes', JSON.stringify(data))
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

// Login con teléfono y contraseña
document.querySelector(".formulario-inicio-sesion").addEventListener("submit", async (e) => {
  e.preventDefault();

  const numero_telefono = document.getElementById("telefono").value.trim();
  const contrasena = document.getElementById("password").value.trim();

  if (!telefono || !contrasena) {
    alert("Por favor, completa ambos campos.");
    return;
  }

  try {
    const response = await fetch("http://localhost:7000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ numero_telefono, contrasena })
    });

    if (!response.ok) {
      throw new Error("Credenciales incorrectas");
    }

    const data = await response.json();
    console.log(data)

    // Guardar en sessionStorage
    sessionStorage.setItem("usuario", JSON.stringify(data));

    // Redirigir según el rol
    switch (data.idRol) {
      case 1: // Cliente
        window.location.href = "../pages/index.html";
        break;
      case 2: // Admin Restaurante
        window.location.href = "../../admin-feature/administrador/pages/editInfo.html";
        break;
      case 3: // Repartidor
        window.location.href = "../../repartidor-feature/pages/index.html";
        break;
      default:
        alert("Rol no reconocido.");
        break;
    }

  } catch (error) {
    console.error("Error en el login:", error);
    alert("No se pudo iniciar sesión. Verifica tus datos.");
  }
});
