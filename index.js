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

  // --- CÓDIGO DEL MODAL (SIN CAMBIOS) ---
  const modal = document.getElementById('modal-login');
  const cerrarModalBtn = document.getElementById('cerrar-modal-login');
  const botonesParaAbrirModal = [document.getElementById('abrir-modal-login')];

  const abrirModal = (evento) => {
    evento.preventDefault();
    if (modal) {
      modal.classList.add('modal-superposicion-visible');
    }
  };

  const cerrarModal = () => {
    if (modal) {
      modal.classList.remove('modal-superposicion-visible');
    }
  };

  botonesParaAbrirModal.forEach(boton => {
    if (boton) {
      boton.addEventListener('click', abrirModal);
    }
  });

  if (cerrarModalBtn) {
    cerrarModalBtn.addEventListener('click', cerrarModal);
  }

  if (modal) {
    modal.addEventListener('click', (evento) => {
      if (evento.target === modal) {
        cerrarModal();
      }
    });
  }
});


// --- SECCIÓN DE RESTAURANTES MODIFICADA ---

// Llamar a restaurantes al cargar la página
document.addEventListener("DOMContentLoaded", cargarCarruseles);

function cargarCarruseles() {
  fetch("http://54.88.1.254/restaurant")
    .then(res => res.json())
    .then(data => {
      sessionStorage.setItem('restaurantes', JSON.stringify(data));
      const contenedor = document.querySelector(".carruseles");

      if (!contenedor) {
        console.error('No se encontró el contenedor de carruseles');
        return;
      }

      // Limpia cualquier contenido previo del contenedor
      contenedor.innerHTML = '';

      const chunkSize = 4;
      for (let i = 0; i < data.length; i += chunkSize) {
        const grupo = data.slice(i, i + chunkSize);
        const carrusel = crearCarrusel(grupo);
        contenedor.appendChild(carrusel);
      }
      
      // La función para agregar eventos a los botones ha sido eliminada
    })
    .catch(error => {
      console.error('Error al cargar los restaurantes:', error);
    });
}

function crearCarrusel(restaurantes) {
  const carrusel = document.createElement("div");
  carrusel.className = "carrusel";

  // Los botones < y > han sido removidos
  
  const contenedor = document.createElement("div");
  contenedor.className = "carrusel-contenedor";

  const pista = document.createElement("div");
  pista.className = "carrusel-pista";

  restaurantes.forEach(r => {
    const item = document.createElement("div");
    item.className = "carrusel-item";
    item.innerHTML = `
      <a href="/pages/restaurante.html?id=${r.id_restaurante}">
        <img src="${r.logo_url}" alt="Logo ${r.nombre_restaurante}" loading="lazy">
      </a>
    `;
    pista.appendChild(item);
  });

  contenedor.appendChild(pista);
  carrusel.appendChild(contenedor); // Se añade el contenedor directamente al carrusel

  return carrusel;
}

// La función agregarEventosCarrusel() ha sido eliminada por completo
// ya que los botones no existen.


// --- SECCIÓN DE LOGIN (SIN CAMBIOS) ---
document.querySelector(".formulario-inicio-sesion").addEventListener("submit", async (e) => {
  e.preventDefault();

  const numero_telefono = document.getElementById("telefono").value.trim();
  const contrasena = document.getElementById("password").value.trim();

  if (!numero_telefono || !contrasena) {
    alert("Por favor, completa ambos campos.");
    return;
  }

  try {
    const response = await fetch("http://54.88.1.254/login", {
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
    
    localStorage.setItem("nombre", JSON.stringify(data.nombre));
    localStorage.setItem("token", JSON.stringify(data.token));
    localStorage.setItem("idRol", data.idRol);
    localStorage.setItem("id_usuario", data.id_usuario);
  
    switch (data.idRol) {
      case 1:
        window.location.href = "./cliente-feature/pages/sesion-iniciada.html";
        break;
      case 2:
        window.location.href = "./admin-feature/administrador/pages/editInfo.html";
        break;
      case 3:
        window.location.href = "./repartidor-feature/pages/index.html";
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