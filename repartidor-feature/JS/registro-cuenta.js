document.addEventListener('DOMContentLoaded', () => {
    const botonPaso1 = document.getElementById('boton-paso-1');
    const botonPaso2 = document.getElementById('boton-paso-2');
    const pasoFormulario1 = document.getElementById('paso-formulario-1');
    const pasoFormulario2 = document.getElementById('paso-formulario-2');
    const botonesVehiculo = document.querySelectorAll('.boton-vehiculo');
    const entradaFoto = document.getElementById('foto-vehiculo');
    const mostrarNombreArchivo = document.getElementById('mostrar-nombre-archivo');
    const formulario = document.getElementById('formulario-registro');

    let usuarioRegistrado = false;

    function mostrarPaso(numeroPaso) {
        if (numeroPaso === 1 && usuarioRegistrado) return; // Evitar volver al paso 1 si ya se registró

        if (numeroPaso === 1) {
            botonPaso1.classList.add('activo');
            pasoFormulario1.classList.add('activo');
            botonPaso2.classList.remove('activo');
            pasoFormulario2.classList.remove('activo');
        } 
    }

    function bloquearPaso1() {
        botonPaso1.disabled = true;
        botonPaso1.style.pointerEvents = "none";
        botonPaso1.style.opacity = 0.5;
    }


    // Paso 1: Registrar usuario
    formulario.addEventListener('submit', async (event) => {
        event.preventDefault();

        const nombre = document.getElementById("nombre").value.trim();
        const apellido = document.getElementById("apellido").value.trim();
        const telefono = document.getElementById("telefono").value.trim();
        const correo = document.getElementById("email").value.trim();
        const contrasena = document.getElementById("password").value.trim();
        const confirmar = document.getElementById("confirm-password").value.trim();

       
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
                    idRol: 3
                })
            });

            if (!response.ok) throw new Error("Error al registrar usuario");
            const data = await response.json();

            usuarioRegistrado = true;
            bloquearPaso1();
            mostrarPaso(2);

            // Guardar el ID del usuario en localStorage para paso 2
            localStorage.setItem("id_usuario_repartidor", data.id_usuario);
            localStorage.setItem("token", data.token); // token JWT u otro
            localStorage.setItem("nombre_usuario", data.nombre); // o data.nombre_completo

        } catch (error) {
            console.error(error);
            alert("Error al registrar usuario");
        }
    });

    // 🚘 Paso 2: selección de vehículo
    botonesVehiculo.forEach(boton => {
        boton.addEventListener('click', () => {
            botonesVehiculo.forEach(btn => btn.classList.remove('activo'));
            boton.classList.add('activo');
        });
    });

    entradaFoto.addEventListener('change', () => {
        mostrarNombreArchivo.textContent = entradaFoto.files.length > 0
            ? entradaFoto.files[0].name
            : 'Foto del vehículo';
    });

    // ⛔ Bloquear acceso manual al paso 1 si ya se registró
    botonPaso1.addEventListener('click', () => {
        if (!usuarioRegistrado) mostrarPaso(1);
    });

    botonPaso2.addEventListener('click', () => {
        mostrarPaso(2);
    });
});

// Paso 2: Envío de datos del vehículo
const formularioVehiculo = document.getElementById("form-vehiculo");

formularioVehiculo.addEventListener('submit', async (event) => {
    event.preventDefault();

    const id_usuario = localStorage.getItem("id_usuario_repartidor");
    if (!id_usuario) {
        alert("Error: No hay ID de usuario disponible.");
        return;
    }

    const tipoSeleccionado = document.querySelector(".boton-vehiculo.activo");
    const tipoVehiculo = tipoSeleccionado ? tipoSeleccionado.value : null;
    const placas = document.getElementById("placas").value;
    const foto = document.getElementById("foto-vehiculo").files[0];


    const formData = new FormData();
    formData.append("id_usuario", id_usuario);
    formData.append("id_vehiculo", tipoVehiculo); // Enviará 1, 2 o 3
    formData.append("placas", placas);
    formData.append("imagen", foto);

    const token = localStorage.getItem("token");
    const nombreUsuario = localStorage.getItem("nombre_usuario");


    try {
      const response = await fetch(`http://localhost:7000/api/transport`, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${token}`,
                "X-User-NAME": nombreUsuario
                // Agregar headers de autenticación si es necesario
                // 'Authorization': 'Bearer ' + token
            },
            body: formData
        });

      if (!response.ok) throw new Error("Error al registrar vehículo");

      const data = await response.json();
      alert("Vehículo registrado correctamente ✅");
      localStorage.setItem("abrirLogin", "true");
      window.location.href = "../../cliente-feature/pages/index.html";
  } catch (error) {
      console.error(error);
      alert("Error al registrar vehículo");
  }
});