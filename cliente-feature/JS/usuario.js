// Guarda el nombre y token del usuario en localStorage y actualiza la interfaz
function guardarNombreUsuario(nombre, token) {
  if (nombre?.trim()) {
    localStorage.setItem("nombre", nombre.trim());
    actualizarNombreEnInterfaz(nombre.trim());
  }

  if (token?.trim()) {
    localStorage.setItem("token", token.trim());
  }
}

// Intenta cargar el nombre y mostrarlo al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const nombreGuardado = localStorage.getItem("nombre");
  const spanUsuario = document.getElementById("nombre");

  if (token && nombreGuardado?.trim()) {
    spanUsuario.textContent = nombreGuardado.trim();
    console.log("Usuario autenticado:", nombreGuardado);
  } else {
    spanUsuario.textContent = "Invitado";
    console.warn("Usuario no logueado o sin nombre/token.");
  }
});

// Actualiza el nombre del usuario en el header con intentos por si no cargó aún el DOM
function actualizarNombreEnInterfaz(nombre) {
  let intentos = 0;
  const maxIntentos = 10;

  const intervalo = setInterval(() => {
    const elemento = document.getElementById("nombre");
    console.log(`Intento ${intentos + 1}:`, elemento);

    if (elemento) {
      elemento.textContent = nombre || "Invitado";
      console.log("Nombre actualizado en interfaz:", nombre);
      clearInterval(intervalo);
    } else if (++intentos >= maxIntentos) {
      console.error("No se encontró el elemento #usuarioNombre tras múltiples intentos.");
      clearInterval(intervalo);
    }
  }, 300);
}
