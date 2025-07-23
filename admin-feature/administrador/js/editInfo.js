let datosOriginales = {}; // Para comparar luego

document.addEventListener("DOMContentLoaded", async () => {
  let idUsuario = localStorage.getItem("id_usuario");
  let tokenstorage = localStorage.getItem("token");
  let nombrestorage = localStorage.getItem("nombre");
  let nombre = nombrestorage.replace(/"/g, '');
  let token = tokenstorage.replace(/"/g, '');

  try {
    const response = await fetch(`http://54.88.1.254:7000/api/restaurant/${idUsuario}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "X-User-NAME": `${nombre}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    datosOriginales = { ...data }; // Guardamos copia original

    localStorage.setItem("id_restaurante", data.id_restaurante); // Guardar para PUT

    // Insertar datos en inputs
    document.getElementById("admin-name").value = data.nombre_usuario || '';
    document.getElementById("admin-phone").value = data.telefono_usuario || '';
    document.getElementById("restaurant-name").value = data.nombre_restaurante || '';
    document.getElementById("restaurant-phone").value = data.telefono || '';
    document.getElementById("restaurant-address").value = data.direccion || '';

    // Mostrar imágenes
    const logoImg = document.getElementById("logo-preview");
    const bannerImg = document.getElementById("banner-preview");

    if (data.logo_url) {
      logoImg.src = data.logo_url;
      logoImg.style.display = "block";
    }
    if (data.banner_url) {
      bannerImg.src = data.banner_url;
      bannerImg.style.display = "block";
    }
    
    // Cargar horario
    setHoraInput(data.horario_apertura, true);
    setHoraInput(data.horario_cierre, false);

  } catch (error) {
    console.error("Error al obtener datos del restaurante:", error);
    alert("Error al cargar los datos del restaurante: " + error.message);
  }

  // Configurar subida de archivos después de que el DOM esté listo
  setupFileUpload();
  setupModal();
});

function setHoraInput(hora24, isApertura) {
  const columna = document.querySelectorAll('.horarios-row .horario')[isApertura ? 0 : 1];
  if (!hora24 || !columna) return;

  const [hora, minuto] = hora24.split(':').map(Number);
  let ampm = 'AM';
  let displayHora = hora;

  if (hora >= 12) {
    ampm = 'PM';
    displayHora = hora > 12 ? hora - 12 : hora;
  } else if (hora === 0) {
    displayHora = 12;
  }

  const hourInput = columna.querySelector(".hour-input");
  const minuteInput = columna.querySelector(".minute-input");
  const ampmSelect = columna.querySelector(".ampm-select");

  if (hourInput) hourInput.value = displayHora;
  if (minuteInput) minuteInput.value = minuto.toString().padStart(2, '0');
  if (ampmSelect) ampmSelect.value = ampm;
}

// Función para manejar la subida de archivos con preview
function setupFileUpload() {
  const logoUpload = document.getElementById("logo-upload");
  const bannerUpload = document.getElementById("banner-upload");
  const logoPreview = document.getElementById("logo-preview");
  const bannerPreview = document.getElementById("banner-preview");

  if (logoUpload && logoPreview) {
    logoUpload.addEventListener("change", function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          logoPreview.src = e.target.result;
          logoPreview.style.display = "block";
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (bannerUpload && bannerPreview) {
    bannerUpload.addEventListener("change", function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          bannerPreview.src = e.target.result;
          bannerPreview.style.display = "block";
        };
        reader.readAsDataURL(file);
      }
    });
  }
}

// Función para obtener horario de los inputs actuales
function getHorarioFromInputs(isApertura) {
  const columna = document.querySelectorAll('.horarios-row .horario')[isApertura ? 0 : 1];
  if (!columna) return '';

  const hourInput = columna.querySelector(".hour-input");
  const minuteInput = columna.querySelector(".minute-input");
  const ampmSelect = columna.querySelector(".ampm-select");

  if (!hourInput || !minuteInput || !ampmSelect) return '';

  const hora = parseInt(hourInput.value) || 0;
  const minuto = parseInt(minuteInput.value) || 0;
  const ampm = ampmSelect.value;
  
  // Validar valores
  if (hora < 1 || hora > 12 || minuto < 0 || minuto > 59) {
    console.warn("Valores de hora inválidos:", { hora, minuto, ampm });
    return '';
  }
  
  let hora24 = hora;
  if (ampm === 'PM' && hora !== 12) {
    hora24 += 12;
  } else if (ampm === 'AM' && hora === 12) {
    hora24 = 0;
  }
  
  // Formato HH:MM:SS requerido por java.sql.Time
  return `${hora24.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}:00`;
}

// Función para formato de hora input (HH:MM)
function formatoHoraInput(hora24) {
  if (!hora24) return "";
  return hora24.substring(0, 5); // extrae HH:mm
}

// MODAL FUNCTIONALITY
let logoFileModal = null;
let bannerFileModal = null;

function setupModal() {
  const modal = document.getElementById('modalEditarInfo');
  const formModal = document.getElementById('formEditarInfo');
  const btnCerrarModal = document.getElementById('btnCerrarModal');

  // Cerrar modal
  btnCerrarModal.onclick = () => {
    modal.style.display = 'none';
  };

  // Cerrar al hacer click fuera del contenido
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  };

  // Manejar preview y guardar archivos seleccionados en variables
  document.getElementById('modal-logo-upload').addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) {
      logoFileModal = file;
      const reader = new FileReader();
      reader.onload = ev => {
        document.getElementById('modal-logo-preview').src = ev.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  document.getElementById('modal-banner-upload').addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) {
      bannerFileModal = file;
      const reader = new FileReader();
      reader.onload = ev => {
        document.getElementById('modal-banner-preview').src = ev.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // Manejar submit del formulario modal
  formModal.addEventListener('submit', async e => {
    e.preventDefault();
    await guardarInformacionModal();
  });
}

// Función para abrir modal y cargar datos
function abrirModalFormulario() {
  const modal = document.getElementById('modalEditarInfo');
  
  // Carga datos actuales en inputs del modal
  document.getElementById('modal-admin-name').value = document.getElementById('admin-name').value;
  document.getElementById('modal-admin-phone').value = document.getElementById('admin-phone').value;
  document.getElementById('modal-restaurant-name').value = document.getElementById('restaurant-name').value;
  document.getElementById('modal-restaurant-phone').value = document.getElementById('restaurant-phone').value;
  document.getElementById('modal-restaurant-address').value = document.getElementById('restaurant-address').value;
  
  // Asignar horarios usando datosOriginales
  const aperturaVal = formatoHoraInput(datosOriginales.horario_apertura);
  const cierreVal = formatoHoraInput(datosOriginales.horario_cierre);
  
  document.getElementById('modal-horario-apertura').value = aperturaVal;
  document.getElementById('modal-horario-cierre').value = cierreVal;

  // Mostrar previews
  const logoSrc = document.getElementById('logo-preview').src;
  const bannerSrc = document.getElementById('banner-preview').src;

  const logoPreview = document.getElementById('modal-logo-preview');
  const bannerPreview = document.getElementById('modal-banner-preview');

  logoPreview.src = logoSrc || '';
  bannerPreview.src = bannerSrc || '';
  logoPreview.style.display = logoSrc ? 'block' : 'none';
  bannerPreview.style.display = bannerSrc ? 'block' : 'none';

  // Reset file inputs y archivos
  document.getElementById('modal-logo-upload').value = '';
  document.getElementById('modal-banner-upload').value = '';
  logoFileModal = null;
  bannerFileModal = null;

  // Mostrar modal
  modal.style.display = 'flex';
}

// Función para guardar información desde el modal
async function guardarInformacionModal() {
  if (!confirm("¿Deseas guardar los cambios realizados?")) return;

  const idUsuario = localStorage.getItem("id_usuario");
  const idRestaurante = localStorage.getItem("id_restaurante");
  
  if (!idUsuario || !idRestaurante) {
    alert("Error: No se encontró el ID del usuario o restaurante.");
    return;
  }

  // Recoger datos del modal
  const nombreUsuario = document.getElementById('modal-admin-name').value.trim();
  const telefonoUsuario = document.getElementById('modal-admin-phone').value.trim();
  const nombreRestaurante = document.getElementById('modal-restaurant-name').value.trim();
  const telefonoRestaurante = document.getElementById('modal-restaurant-phone').value.trim();
  const direccion = document.getElementById('modal-restaurant-address').value.trim();
  const horarioAperturaRaw = document.getElementById('modal-horario-apertura').value; // ej. "07:00"
  const horarioCierreRaw = document.getElementById('modal-horario-cierre').value; // ej. "20:00"

  // Validaciones básicas
  if (!nombreUsuario || !telefonoUsuario || !nombreRestaurante || !telefonoRestaurante || !direccion) {
    alert("Por favor completa todos los campos.");
    return;
  }

  if (!horarioAperturaRaw || !horarioCierreRaw) {
    alert("Por favor complete los horarios de apertura y cierre.");
    return;
  }

  const horarioApertura = horarioAperturaRaw + ":00"; // "07:00:00"
  const horarioCierre = horarioCierreRaw + ":00"; // "20:00:00"

  // Armar FormData
  const formData = new FormData();
  formData.append("id_usuario", idUsuario);
  formData.append("nombre_usuario", nombreUsuario);
  formData.append("telefono_usuario", telefonoUsuario);
  formData.append("nombre", nombreRestaurante);
  formData.append("telefono", telefonoRestaurante);
  formData.append("direccion", direccion);
  formData.append("horario_apertura", horarioApertura);
  formData.append("horario_cierre", horarioCierre);

  if (logoFileModal) {
    formData.append("logo", logoFileModal);
  }

  if (bannerFileModal) {
    formData.append("banner", bannerFileModal);
  }

  // Deshabilitar botón mientras carga
  const btnGuardar = document.querySelector('#formEditarInfo button[type="submit"]');
  const originalText = btnGuardar.textContent;
  btnGuardar.disabled = true;
  btnGuardar.textContent = "Guardando...";

  const token = localStorage.getItem("token").replace(/"/g, '');
  const nombreUser = localStorage.getItem("nombre").replace(/"/g, '');

  
  for (const pair of formData.entries()) {
    console.log(pair[0] + ':', pair[1]);
  }

  try {
    const res = await fetch(`http://54.88.1.254:7000/api/restaurant/${idRestaurante}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "X-User-NAME": nombreUser
      },
      body: formData
    });

   

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error del servidor:", errorText);
      throw new Error(`Error ${res.status}: ${errorText || "Error desconocido"}`);
    }

    // Intentar obtener respuesta JSON si existe
    const responseText = await res.text();
    let responseData = {};
    if (responseText.trim()) {
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.log("Respuesta no es JSON válido:", responseText);
      }
    }

    alert("Información actualizada correctamente.");
    document.getElementById('modalEditarInfo').style.display = "none";

    // Actualizar inputs visibles con los datos nuevos
    document.getElementById("admin-name").value = nombreUsuario;
    document.getElementById("admin-phone").value = telefonoUsuario;
    document.getElementById("restaurant-name").value = nombreRestaurante;
    document.getElementById("restaurant-phone").value = telefonoRestaurante;
    document.getElementById("restaurant-address").value = direccion;

    // Actualizar datosOriginales
    datosOriginales = {
      ...datosOriginales,
      nombre_usuario: nombreUsuario,
      telefono_usuario: telefonoUsuario,
      nombre_restaurante: nombreRestaurante,
      telefono: telefonoRestaurante,
      direccion: direccion,
      horario_apertura: horarioApertura,
      horario_cierre: horarioCierre
    };

    // Actualizar previews (si se subieron nuevos archivos)
    if (logoFileModal) {
      const reader = new FileReader();
      reader.onload = ev => {
        document.getElementById("logo-preview").src = ev.target.result;
        document.getElementById("logo-preview").style.display = "block";
      };
      reader.readAsDataURL(logoFileModal);
    }

    if (bannerFileModal) {
      const reader = new FileReader();
      reader.onload = ev => {
        document.getElementById("banner-preview").src = ev.target.result;
        document.getElementById("banner-preview").style.display = "block";
      };
      reader.readAsDataURL(bannerFileModal);
    }

    // Actualizar los horarios visibles
    setHoraInput(horarioApertura, true);
    setHoraInput(horarioCierre, false);

  } catch (err) {
    console.error("Error completo:", err);
    alert("Error al actualizar: " + err.message);
  } finally {
    btnGuardar.disabled = false;
    btnGuardar.textContent = originalText;
  }
}