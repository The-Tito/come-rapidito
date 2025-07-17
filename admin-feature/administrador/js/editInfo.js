document.addEventListener("DOMContentLoaded", async () => {
  // 1. Obtener datos del usuario desde sessionStorage
  const usuario = JSON.parse(sessionStorage.getItem("usuario"));
//   if (!usuario || !usuario.id_usuario) {
//     alert("Usuario no identificado.");
//     return;
//   }

//   const idUsuario = usuario.id_usuario;

  try {
    // 2. Llamar a la API para obtener datos del restaurante
    const response = await fetch(`http://localhost:7000/api/restaurant/18`);
    if (!response.ok) throw new Error("Error al obtener datos del restaurante");

    const restaurante = await response.json();

    // 3. Insertar valores en los inputs
    document.getElementById("admin-name").value = "Diana Paola";
    document.getElementById("admin-phone").value = restaurante.telefono || "";
    document.getElementById("restaurant-name").value = restaurante.nombre_restaurante || "";
    document.getElementById("restaurant-phone").value = restaurante.telefono || "";
    document.getElementById("restaurant-address").value = restaurante.direccion || "";

    // 4. Insertar horarios (si vienen en formato HH:mm:ss)
    const apertura = restaurante.horario_apertura?.substring(0, 5) || "07:00";
    const cierre = restaurante.horario_cierre?.substring(0, 5) || "19:00";

    const timeDisplays = document.querySelectorAll(".time-display");
    timeDisplays[0].textContent = apertura; // apertura
    timeDisplays[1].textContent = cierre;   // cierre

    // 5. (Opcional) Previsualizar logo y banner si quieres usar <img> en vez de iconos
    // document.querySelector(".logo-box").style.backgroundImage = `url(${restaurante.logo_url})`;
    // document.querySelector(".banner-box").style.backgroundImage = `url(${restaurante.banner_url})`;

  } catch (error) {
    console.error("Error al cargar datos del restaurante:", error);
    alert("No se pudo cargar la información del restaurante.");
  }
});document.addEventListener("DOMContentLoaded", async () => {
  // 1. Obtener datos del usuario desde sessionStorage
  const usuario = JSON.parse(sessionStorage.getItem("usuario"));
  

//   const idUsuario = usuario.id_usuario;

  try {
    // 2. Llamar a la API para obtener datos del restaurante
    const response = await fetch(`http://localhost:7000/api/restaurant/18`, {
  method: "GET",
  headers: {
    'Authorization': `Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJQZWRybyJ9.EtBlTRFLmyKB9U-RlcRA6afFdkaeukIY6hajCE1hLos`,
    'X-User-NAME': `Pedro`,
    'Content-Type': 'application/json'
  }
});

    if (!response.ok) throw new Error("Error al obtener datos del restaurante");

    const restaurante = await response.json();

    // 3. Insertar valores en los inputs
    document.getElementById("admin-name").value = "Diana Paola";
    document.getElementById("admin-phone").value = restaurante.telefono || "";
    document.getElementById("restaurant-name").value = restaurante.nombre || "";
    document.getElementById("restaurant-phone").value = restaurante.telefono || "";
    document.getElementById("restaurant-address").value = restaurante.direccion || "";

    // 4. Insertar horarios (si vienen en formato HH:mm:ss)
    const apertura = restaurante.horario_apertura?.substring(0, 5) || "07:00";
    const cierre = restaurante.horario_cierre?.substring(0, 5) || "19:00";

    const timeDisplays = document.querySelectorAll(".time-display");
    timeDisplays[0].textContent = apertura; // apertura
    timeDisplays[1].textContent = cierre;   // cierre


    document.querySelector(".logo-box").style.backgroundImage = `url(${restaurante.logo_url})`;
    document.querySelector(".banner-box").style.backgroundImage = `url(${restaurante.banner_url})`;

  } catch (error) {
    console.error("Error al cargar datos del restaurante:", error);
    alert("No se pudo cargar la información del restaurante.");
  }
});