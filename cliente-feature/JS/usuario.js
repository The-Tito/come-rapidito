function guardarNombreUsuario(nombre) {
  if (nombre?.trim()) {
    localStorage.setItem("usuarioNombre", nombre.trim());
    actualizarNombreEnInterfaz(nombre.trim());
  }
}


window.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM listo...");

  const nombreGuardado = localStorage.getItem("usuarioNombre");
  console.log("🔍 Nombre guardado en localStorage:", nombreGuardado);

  if (nombreGuardado) {
    console.log("📌 Intentando actualizar el nombre...");
    actualizarNombreEnInterfaz(nombreGuardado);
  } else {
    console.warn("⚠️ No hay nombre guardado.");
  }
});

function actualizarNombreEnInterfaz(nombre) {
  let intentos = 0;
  const maxIntentos = 10;

  const intervalo = setInterval(() => {
    const elemento = document.getElementById("usuarioNombre");
    console.log(`🔄 Intento ${intentos + 1}:`, elemento);

    if (elemento) {
      elemento.textContent = nombre || "Invitado";
      console.log("✅ Nombre actualizado en interfaz:", nombre);
      clearInterval(intervalo);
    } else if (++intentos >= maxIntentos) {
      console.error("❌ No se encontró el elemento #usuarioNombre tras múltiples intentos.");
      clearInterval(intervalo);
    }
  }, 300);
}