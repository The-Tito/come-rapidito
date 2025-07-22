let datosOriginales = {}; // Para comparar luego

document.addEventListener("DOMContentLoaded", async () => {
  let idUsuario = localStorage.getItem("id_usuario");
  let tokenstorage = localStorage.getItem("token")
  let nombrestorage = localStorage.getItem("nombre")
  let nombre = nombrestorage.replace(/"/g, '');
  let token = tokenstorage.replace(/"/g, '');

  try {
    const response = await fetch(`http://localhost:7000/api/restaurant/${idUsuario}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "X-User-NAME": `${nombre}`
      }
    });

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
  }

  // Configurar subida de archivos después de que el DOM esté listo
  setupFileUpload();
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

// Función para guardar información (reemplaza abrirModalFormulario)
function abrirModalFormulario() {
  // Como no hay modal, haremos la actualización directamente
  guardarInformacion();
}

async function guardarInformacion() {
  // Confirmar antes de guardar
  if (!confirm("¿Deseas guardar los cambios realizados?")) {
    return;
  }


  const id_restaurante = localStorage.getItem("id_restaurante");
  
  if (!id_restaurante) {
    alert("Error: No se encontró el ID del restaurante");
    return;
  }

  console.log("ID Restaurante:", id_restaurante);

  // Obtener valores de los inputs actuales
  const nombre = document.getElementById("restaurant-name").value;
  const telefono = document.getElementById("restaurant-phone").value;
  const direccion = document.getElementById("restaurant-address").value;
  const apertura = getHorarioFromInputs(true);
  const cierre = getHorarioFromInputs(false);

  // Validar que los campos requeridos no estén vacíos
  if (!nombre || !telefono || !direccion) {
    alert("Por favor completa todos los campos requeridos");
    return;
  }

  // Validar que los horarios sean válidos
  if (!apertura || !cierre) {
    alert("Por favor completa los horarios de apertura y cierre");
    return;
  }

  console.log("Horarios:", { apertura, cierre });

  // Obtener archivos de imagen
  const logoFile = document.getElementById("logo-upload").files[0];
  const bannerFile = document.getElementById("banner-upload").files[0];

  const formData = new FormData();
  formData.append("nombre", nombre);
  formData.append("telefono", telefono);
  formData.append("direccion", direccion);
  formData.append("horario_apertura", apertura);
  formData.append("horario_cierre", cierre);
  formData.append("id_usuario", idUsuario);

  // Agregar archivos si fueron seleccionados
  if (logoFile) {
    formData.append("logo", logoFile);
  }
  if (bannerFile) {
    formData.append("banner", bannerFile);
  }

  // Obtener token del localStorage


  console.log("Enviando datos...");

  // Mostrar indicador de carga
  const saveButton = document.querySelector('.save-button');
  const originalText = saveButton.innerHTML;
  saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Guardando...</span>';
  saveButton.disabled = true;

  try {
    const response = await fetch(`http://localhost:7000/api/restaurant/${id_restaurante}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "X-User-NAME": `${nombre}`
      },
      body: formData
    });

    console.log("Status de respuesta:", response.status);
    console.log("Headers de respuesta:", response.headers);

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Obtener el texto de la respuesta primero
    const responseText = await response.text();
    console.log("Texto de respuesta:", responseText);

    // Intentar parsear como JSON si no está vacío
    let data = {};
    if (responseText.trim()) {
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.warn("La respuesta no es JSON válido:", responseText);
        // Si la respuesta no es JSON pero el status es OK, asumir éxito
        if (response.status >= 200 && response.status < 300) {
          data = { success: true, message: "Operación exitosa" };
        } else {
          throw new Error("Respuesta inválida del servidor");
        }
      }
    } else {
      // Respuesta vacía pero status OK
      if (response.status >= 200 && response.status < 300) {
        data = { success: true, message: "Operación exitosa" };
      } else {
        throw new Error("Respuesta vacía del servidor");
      }
    }

    console.log("Datos procesados:", data);
    alert("Información actualizada correctamente ✅");
    
    // Recargar los datos después de un breve delay
    setTimeout(() => {
      location.reload();
    }, 500);

  } catch (error) {
    console.error("Error en la actualización:", error);
    
    // Mostrar diferentes mensajes según el tipo de error
    if (error.name === 'SyntaxError') {
      alert("Error: La respuesta del servidor no es válida. Verifica la conexión con el servidor.");
    } else if (error.message.includes('HTTP error')) {
      alert(`Error del servidor: ${error.message}`);
    } else if (error.message.includes('Failed to fetch')) {
      alert("Error de conexión: No se puede conectar al servidor. Verifica que esté ejecutándose.");
    } else {
      alert("Ocurrió un error al actualizar la información: " + error.message);
    }
  } finally {
    // Restaurar botón
    saveButton.innerHTML = originalText;
    saveButton.disabled = false;
  }
}