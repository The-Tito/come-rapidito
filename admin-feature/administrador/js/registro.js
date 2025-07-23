document.addEventListener('DOMContentLoaded', () => {

  // === CÓDIGO NUEVO AÑADIDO PARA LA SUBIDA DE IMÁGENES ===
  // Esto hace que todo el contenedor de la imagen sea clickable
  const cajasSubida = document.querySelectorAll('.caja-subida');

  cajasSubida.forEach(caja => {
    caja.addEventListener('click', () => {
      // Busca el input de tipo "file" que está dentro de la caja y simula un clic en él
      caja.querySelector('input[type="file"]').click();
    });
  });
  // === FIN DEL CÓDIGO NUEVO ===


  const botonPaso1 = document.getElementById('boton-paso-1');
  const botonPaso2 = document.getElementById('boton-paso-2');
  const formulario = document.getElementById('paso-1');
  const formulario2 = document.getElementById("paso-2");
  let usuarioRegistrado = false; // Añadido para controlar el estado

  function mostrarPaso(numeroPaso) {
  if (numeroPaso === 1 && usuarioRegistrado) return;

  if (numeroPaso === 1) {
    formulario.classList.remove("oculto");
    formulario2.classList.add("oculto");
    botonPaso1.classList.add("activo");
    botonPaso2.classList.remove("activo");
  } else if (numeroPaso === 2) {
    formulario.classList.add("oculto");
    formulario2.classList.remove("oculto");
    botonPaso1.classList.remove("activo");
    botonPaso2.classList.add("activo");
  }
}

  function bloquearPaso1() {
    botonPaso1.disabled = true;
    botonPaso1.style.pointerEvents = "none";
    botonPaso1.style.opacity = 0.5;
  }


  formulario.addEventListener('submit', async (event) => {
    event.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const correo = document.getElementById("email").value.trim();
    const contrasena = document.getElementById("contrasena").value.trim();
    const confirmar = document.getElementById("confirmar-contrasena").value.trim();

    // Validaciones mejoradas
    if (!nombre || !apellido || !telefono || !correo || !contrasena) {
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
    if (!emailRegex.test(correo)) {
      alert('Por favor, ingresa un email válido');
      return;
    }

    // Validar teléfono (solo números, máximo 10 dígitos)
    if (!/^\d{1,10}$/.test(telefono)) {
      alert('El número telefónico debe tener máximo 10 dígitos y solo números');
      return;
    }

    try {
      const response = await fetch("http://localhost:7000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          apellido,
          numero_telefono: telefono,
          correo_electronico: correo,
          contrasena,
          idRol: 2
        })
      });

      // First, try to parse the response as JSON
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // If JSON parsing fails, the server probably returned HTML
        console.error("Response is not valid JSON:", jsonError);
        alert("Error del servidor. Por favor, verifica que el servidor esté funcionando correctamente.");
        return;
      }

      // Then check if the response was successful
      if (!response.ok) {
        // Now we can safely use data.error
        alert(data.error || "Error al registrar usuario");
        return;
      }

      console.log(data);
      usuarioRegistrado = true;
      bloquearPaso1();
      mostrarPaso(2);

      // Guardar el ID del usuario en localStorage para paso 2
      localStorage.setItem("id_usuario_admin", data.id_usuario);
      localStorage.setItem("token", data.token); // token JWT u otro
      localStorage.setItem("nombre_usuario", data.nombre); // o data.nombre_completo
      
  
    } catch (error) {
      console.error(error);
      alert("Error al registrar usuario");
    }
  });







  // ------- CONVIERTE HORA DEL FORMULARIO A FORMATO 24H --------
  function getHorario(horaId, minutoId, ampmId) {
    let hora = parseInt(document.getElementById(horaId).value);
    const minutos = document.getElementById(minutoId).value.padStart(2, "0");
    const ampm = document.getElementById(ampmId).value;

    if (ampm === "PM" && hora < 12) hora += 12;
    if (ampm === "AM" && hora === 12) hora = 0;

    return `${hora.toString().padStart(2, "0")}:${minutos}:00`;
  }


  formulario2.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nombre_restaurante = document.getElementById("nombre-negocio").value;
    const direccion = document.getElementById("direccion").value;
    const telefono = document.getElementById("telefono-negocio").value;
    const logo = document.getElementById("logo-restaurante").files[0];
    const banner = document.getElementById("banner-restaurante").files[0];
    const horario_apertura = getHorario("apertura_hora", "apertura_minuto", "apertura_ampm");
    const horario_cierre = getHorario("cierre_hora", "cierre_minuto", "cierre_ampm");

    const id_usuario = localStorage.getItem("id_usuario_admin");
    // Datos restaurante
    const formData = new FormData();
    formData.append("nombre", nombre_restaurante);
    formData.append("telefono", telefono);
    formData.append("direccion", direccion);
    formData.append("id_usuario", id_usuario);
    formData.append("horario_apertura", horario_apertura);
    formData.append("horario_cierre", horario_cierre);
    formData.append("logo", logo);
    formData.append("banner", banner);


    const token = localStorage.getItem("token");
    const nombreUsuario = localStorage.getItem("nombre_usuario");
    console.log("estoy en submit")
    // Enviar al backend
    try {
      const response = await fetch('http://localhost:7000/api/restaurant', {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`,
          "X-User-NAME": nombreUsuario

        },
        body: formData
      });

      if (!response.ok) throw new Error("Error al registrar restaurante");

      const data = await response.json();
      alert("Restaurante registrado exitosamente✅");
      localStorage.setItem("abrirLogin", "true");
      localStorage.setItem("id_restaurante", data.id_restaurante);
      window.location.href = "../../../cliente-feature/pages/index.html";
  } catch (error) {
      console.error(error);
      alert("Error al registrar restaurante");
  }

});

});
function volverAtras() {
  history.back();
}