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
            // Mostrar el formulario del paso 1
            formulario.classList.remove("oculto");
            pasoFormulario2.classList.add("oculto");
        } else if (numeroPaso === 2) {
            // Ocultar el formulario del paso 1
            formulario.classList.add("oculto");
            pasoFormulario1.classList.remove("activo");
            // Mostrar el paso 2
            pasoFormulario2.classList.remove("oculto");
            pasoFormulario2.classList.add("activo");
            botonPaso1.classList.remove("activo");
            botonPaso2.classList.add("activo");
        }
    }

    function bloquearPaso1() {
        botonPaso1.disabled = true;
        botonPaso1.style.pointerEvents = "none";
        botonPaso1.style.opacity = "0.5";
        botonPaso1.style.cursor = "not-allowed";
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
        if (!nombre || !apellido || !telefono || !correo || !contrasena) {
            alert('Por favor, completa todos los campos');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correo)) {
        alert('Por favor, ingresa un email válido');
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

        // Validar teléfono (solo números, mínimo 10 dígitos)
        if (!/^\d{1,10}$/.test(telefono)) {
  alert('El número telefónico debe tener máximo 10 dígitos y solo números');
  return;
}


        try {
            const response = await fetch("http://54.88.1.254/signup", {
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

            // Marcar usuario como registrado y bloquear paso 1
            usuarioRegistrado = true;
            bloquearPaso1();
            
            // Cambiar al paso 2
            mostrarPaso(2);

            // Guardar el ID del usuario en localStorage para paso 2
            localStorage.setItem("id_usuario_repartidor", data.id_usuario);
            localStorage.setItem("token", data.token);
            localStorage.setItem("nombre_usuario", data.nombre);

        } catch (error) {
            console.error(error);
            alert("Error al registrar usuario");
        }
    });

    // Paso 2: selección de vehículo
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

    // Bloquear acceso manual al paso 1 si ya se registró
    botonPaso1.addEventListener('click', (e) => {
        if (usuarioRegistrado) {
            e.preventDefault();
            return false;
        }
        mostrarPaso(1);
    });

    botonPaso2.addEventListener('click', () => {
        // Solo permitir ir al paso 2 si el usuario ya se registró
        if (usuarioRegistrado) {
            mostrarPaso(2);
        }
    });

    // Inicializar en el paso 1
    mostrarPaso(1);
});


// Paso 2: Envío de datos del vehículo
document.addEventListener('DOMContentLoaded', () => {
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

        // Validaciones
        if (!tipoVehiculo) {
            alert("Por favor, selecciona un tipo de vehículo");
            return;
        }

        if (!placas.trim()) {
            alert("Por favor, ingresa el número de placas");
            return;
        }

        if (!foto) {
            alert("Por favor, selecciona una foto del vehículo");
            return;
        }

        const formData = new FormData();
        formData.append("id_usuario", id_usuario);
        formData.append("id_vehiculo", tipoVehiculo);
        formData.append("placas", placas);
        formData.append("imagen", foto);

        const token = localStorage.getItem("token");
        const nombreUsuario = localStorage.getItem("nombre_usuario");

        try {
            const response = await fetch(`http://54.88.1.254/api/transport`, {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "X-User-NAME": nombreUsuario
                },
                body: formData
            });

            if (!response.ok) throw new Error("Error al registrar vehículo");

            const data = await response.json();
            alert("Vehículo registrado correctamente ✅");
            localStorage.setItem("abrirLogin", "true");
            window.location.href = "../../repartidor-feature/pages/index.html";
        } catch (error) {
            console.error(error);
            alert("Error al registrar vehículo");
        }
    });
});
function volverAtras() {
  history.back();
}