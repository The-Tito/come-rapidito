// ../JS/seguimiento.js - VERSIÓN MEJORADA

// --- CONFIGURACIÓN DE ESTADOS ---
const STATUS_MAP = {
    "En preparación": 1, // Este es el ID de estado del backend
    "En espera": 2,      // Asumiendo que 2 es "En espera" (antes tenías 9, lo cambié a 2 para que coincida con tu descripción)
    "En camino": 3,      // Este es el ID de estado del backend
    "Entregado": 4,
    "activo": 8          // Este es el ID de estado del backend (pedido tomado por el repartidor pero aún no en camino)
};

const POLLING_INTERVAL = 5000; // Intervalo de 5 segundos para actualizar el estado del pedido

let pollingTimer; // Variable para almacenar el temporizador del polling

// --- INICIALIZACIÓN DE LA PÁGINA ---
document.addEventListener("DOMContentLoaded", () => {
    const orderId = localStorage.getItem("pedido_id_seguimiento");
    const userId = localStorage.getItem("id_usuario");

    if (!orderId) {
        displayError("Error: No se encontró un ID de pedido. Por favor, regresa a 'Pedidos Activos' y selecciona uno.");
        return;
    }
    if (!userId) {
        displayError("Error: No se pudo identificar al usuario. Por favor, inicia sesión de nuevo.");
        return;
    }

    // Iniciar el seguimiento y polling
    startTrackingAndPolling(orderId, userId);

    const modalButton = document.querySelector("#modal-entregado .btn-continuar");
    modalButton.addEventListener("click", () => {
        // Limpiar el ID del localStorage y detener el polling
        localStorage.removeItem("pedido_id_seguimiento");
        clearInterval(pollingTimer); 
        window.location.href = '/repartidor-feature/pages/historial.html';
    });

    // Limpiar el temporizador si el usuario navega fuera de la página
    window.addEventListener('beforeunload', () => {
        clearInterval(pollingTimer);
    });
});

/**
 * Inicia la carga inicial del pedido y el polling para actualizaciones constantes.
 * @param {string} orderId - El ID del pedido a seguir.
 * @param {string} userId - El ID del usuario logueado.
 */
async function startTrackingAndPolling(orderId, userId) {
    // Realiza una carga inicial
    await fetchAndUpdateOrder(orderId, userId);

    // Configura el polling
    pollingTimer = setInterval(async () => {
        console.log("Realizando polling para el pedido:", orderId);
        await fetchAndUpdateOrder(orderId, userId);
    }, POLLING_INTERVAL);
}

/**
 * Fetches the current order data and updates the UI.
 * @param {string} orderId - The ID of the order.
 * @param {string} userId - The ID of the current user.
 */
async function fetchAndUpdateOrder(orderId, userId) {
    try {
        const orderData = await fetchOrderById(orderId); // Función nueva para obtener un solo pedido
        if (!orderData) {
            console.warn("Pedido no encontrado o ya no está activo. Deteniendo el polling.");
            clearInterval(pollingTimer);
            displayError(`El pedido #${orderId} ya no se encuentra activo o no existe.`);
            return;
        }

        const container = document.querySelector('.seguimiento_container');
        const oldStatus = parseInt(container.getAttribute('data-current-status'), 10);
        const newStatus = orderData.id_status;

        // Solo actualiza la UI si el estado ha cambiado o si es la primera carga
        if (newStatus !== oldStatus || oldStatus === null || isNaN(oldStatus)) { // Agregada condición para primera carga
            console.log(`Estado del pedido ${orderId} ha cambiado de ${oldStatus || 'null'} a ${newStatus}`);
            container.setAttribute('data-order-id', orderId); // Asegurarse de que el ID del pedido esté en el contenedor
            container.setAttribute('data-current-status', newStatus);
            updateCheckboxesUI(newStatus); // Llama a esta función para aplicar la lógica de habilitar/deshabilitar

            // Si el estado es "Entregado" y antes no lo era, muestra el modal y detén el polling
            if (newStatus === STATUS_MAP["Entregado"] && oldStatus !== STATUS_MAP["Entregado"]) {
                showModal();
                clearInterval(pollingTimer); // Detener el polling una vez entregado
            }
        }
    } catch (error) {
        console.error("Error al obtener y actualizar el pedido:", error);
        // Podrías decidir detener el polling en caso de errores persistentes
        // clearInterval(pollingTimer); 
        // displayError(error.message); // O mostrar un mensaje de error menos intrusivo
    }
}


/**
 * Actualiza la apariencia de los checkboxes basado en el estado actual del pedido.
 * @param {number} currentStatus - El ID del estado actual del pedido.
 */
function updateCheckboxesUI(currentStatus) {
    const checkboxes = document.querySelectorAll('.seguimiento_container input[type="checkbox"]');
    
    // Primero, deshabilitar todos los checkboxes por defecto y limpiar estados
    checkboxes.forEach(checkbox => {
        checkbox.checked = false; // Desmarcar todos por defecto
        checkbox.disabled = true; // Deshabilitar todos por defecto
        checkbox.parentElement.classList.remove('completed');
    });

    // Habilitar y marcar los checkboxes según el estado actual
    for (const [statusName, statusId] of Object.entries(STATUS_MAP)) {
        const checkbox = document.getElementById(statusName);
        if (checkbox) {
            if (currentStatus >= statusId) {
                checkbox.checked = true;
                checkbox.parentElement.classList.add('completed');
            }
        }
    }

    // --- LÓGICA PRINCIPAL DE HABILITACIÓN/DESHABILITACIÓN SEGÚN LOS REQUERIMIENTOS ---

    // 1. Si el estado es 'activo' (8), ningún checkbox debe ser marcable por el repartidor
    if (currentStatus === STATUS_MAP["activo"]) {
        // Todos los checkboxes ya están deshabilitados por el forEach inicial.
        // No necesitamos hacer nada adicional aquí, solo confirmar que así sea.
        console.log("Estado 'activo' (8): Todos los checkboxes de repartidor deshabilitados.");
    }
    // 2. Si el estado es 'En espera' (2), solo "En camino" y "Entregado" pueden habilitarse
    else if (currentStatus === STATUS_MAP["En espera"]) {
        const enCaminoCheckbox = document.getElementById("En camino");
        const entregadoCheckbox = document.getElementById("Entregado");

        if (enCaminoCheckbox) {
            enCaminoCheckbox.disabled = false; // Habilitar "En camino"
            console.log("Estado 'En espera' (2): 'En camino' habilitado.");
        }
        if (entregadoCheckbox) {
            entregadoCheckbox.disabled = true; // "Entregado" sigue deshabilitado hasta que "En camino" se marque
        }
    }
    // Para otros estados (En preparación, En camino, Entregado)
    // El checkbox "En preparación" siempre estará deshabilitado porque lo controla otro.
    // Una vez "En camino" se marque (y el currentStatus se actualice a 3), "Entregado" se habilitará.
    else if (currentStatus === STATUS_MAP["En camino"]) {
        const entregadoCheckbox = document.getElementById("Entregado");
        if (entregadoCheckbox) {
            entregadoCheckbox.disabled = false; // Habilitar "Entregado"
            console.log("Estado 'En camino' (3): 'Entregado' habilitado.");
        }
        const enCaminoCheckbox = document.getElementById("En camino");
        if(enCaminoCheckbox) enCaminoCheckbox.disabled = true; // Deshabilitar "En camino" una vez marcado
    } else if (currentStatus === STATUS_MAP["Entregado"]) {
        // Una vez entregado, todos los checkboxes deben estar deshabilitados.
        // El forEach inicial ya los deja deshabilitados.
        console.log("Estado 'Entregado' (4): Todos los checkboxes de repartidor deshabilitados.");
    }

    // Asegurarse de que "En preparación" y "En espera" siempre estén deshabilitados para el repartidor
    const enPreparacionCheckbox = document.getElementById("En preparación");
    const enEsperaCheckbox = document.getElementById("En espera");
    if (enPreparacionCheckbox) enPreparacionCheckbox.disabled = true;
    if (enEsperaCheckbox) enEsperaCheckbox.disabled = true;

    // Después de ajustar los estados de habilitación, volvemos a añadir los listeners
    // Esto es crucial para que los checkboxes habilitados respondan a los clics
    addCheckboxListeners(); 
}

/**
 * Añade los event listeners a cada checkbox para manejar las actualizaciones.
 */
function addCheckboxListeners() {
    const checkboxes = document.querySelectorAll('.seguimiento_container input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        // Remover cualquier listener previo para evitar duplicados al re-renderizar
        checkbox.removeEventListener('change', handleStatusUpdate);
        // Solo añade listener a los checkboxes que el repartidor puede cambiar
        // y que actualmente NO están deshabilitados.
        if (checkbox.id === "En camino" || checkbox.id === "Entregado") {
             // Solo añade el listener si el checkbox no está deshabilitado
            if (!checkbox.disabled) {
                checkbox.addEventListener('change', handleStatusUpdate);
            }
        }
    });
}

/**
 * Manejador del evento 'change' para un checkbox.
 * @param {Event} event 
 */
async function handleStatusUpdate(event) {
    const checkbox = event.target;
    const container = document.querySelector('.seguimiento_container');
    const orderId = container.getAttribute('data-order-id');
    const currentStatus = parseInt(container.getAttribute('data-current-status'), 10);
    const newStatusTarget = STATUS_MAP[checkbox.id];

    // Si intenta desmarcar, forzar a que se quede marcado y no hacer nada
    if (!checkbox.checked) {
        checkbox.checked = true;
        return; 
    }

    // Lógica de validación de estados para permitir solo avance secuencial
    let isValidAction = false;
    if (checkbox.id === "En camino" && currentStatus === STATUS_MAP["En espera"]) {
        isValidAction = true;
    } else if (checkbox.id === "Entregado" && currentStatus === STATUS_MAP["En camino"]) {
        isValidAction = true;
    }

    if (!isValidAction) {
        alert(`No puedes cambiar a "${checkbox.id}" en este momento. El pedido debe estar en el estado correcto.`);
        checkbox.checked = false; // Desmarcar el checkbox si la acción no es válida
        updateCheckboxesUI(currentStatus); // Vuelve a renderizar la UI con el estado correcto
        return;
    }

    // Si la acción es válida, proceder a actualizar el estado en el backend
    try {
        // Deshabilitar todos los checkboxes temporalmente para evitar interacciones dobles mientras se procesa la solicitud
        document.querySelectorAll('.seguimiento_container input[type="checkbox"]').forEach(cb => cb.disabled = true);
        
        await updateOrderStatus(orderId, newStatusTarget);
        console.log(`Pedido #${orderId} actualizado con éxito a "${checkbox.id}".`);
        
        // Actualizar el estado localmente y refrescar la UI
        container.setAttribute('data-current-status', newStatusTarget);
        updateCheckboxesUI(newStatusTarget); 
        
        // Si el estado es "Entregado", muestra el modal y detén el polling
        if (newStatusTarget === STATUS_MAP["Entregado"]) {
            showModal();
            clearInterval(pollingTimer);
        }
    } catch (error) {
        displayError(`No se pudo actualizar el pedido a "${checkbox.id}": ${error.message}`);
        checkbox.checked = false; // Desmarcar si falla
        updateCheckboxesUI(currentStatus); // Vuelve a la UI original
    }
}


// --- FUNCIONES DE API Y UTILIDADES ---

function showModal() {
    const modal = document.getElementById('modal-entregado');
    if(modal) modal.classList.remove('oculto');
}

function displayError(message) {
    const seccion = document.querySelector('main.seccion');
    if (seccion) {
        seccion.innerHTML = `<div class="error-container" style="color: red; padding: 20px; border: 1px solid red; background: #ffeeee; margin: 20px auto; max-width: 600px; text-align: center;">${message}</div>`;
    }
    console.error(message);
}

function getAuthHeaders() {
    const token = localStorage.getItem("token");
    const nombre = localStorage.getItem("nombre"); // Asegúrate de que "nombre" se guarde correctamente al iniciar sesión

    if (!token || !nombre) {
        console.error("DEBUG: Token o nombre de usuario no encontrados en localStorage.");
        // Redirigir al login si no hay token o nombre
        // window.location.href = '/login.html'; // Ejemplo de redirección
        throw new Error("Error de Autenticación: El token o el nombre de usuario no fueron encontrados en localStorage.");
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.replace(/"/g, '')}`,
        'X-User-NAME': nombre.replace(/"/g, '')
    };
}

// Nueva función para obtener un pedido específico por su ID
async function fetchOrderById(orderId) {
    // Es posible que necesites el id del repartidor aquí para filtrar
    // Si la API es `api/users/{orderId}/orders/actual`, `orderId` debería ser el ID del repartidor
    // Si es `api/orders/{orderId}`, entonces el `orderId` es el ID del pedido
    // Voy a asumir que `orderId` que le pasas a esta función es el ID del PEDIDO.
    // Si el endpoint espera el ID del usuario repartidor, necesitas pasarlo aquí.
    const URL = `http://98.86.121.57:7000/api/users/${orderId}/orders/actual`; // Cambiado para obtener un pedido específico por ID
    try {
        const response = await fetch(URL, { 
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error(`Fallo de autorización (código: ${response.status}). Por favor, vuelve a iniciar sesión.`);
            }
            if (response.status === 404) {
                return null; // El pedido no se encontró
            }
            throw new Error(`Error del servidor al obtener el pedido (código: ${response.status}).`);
        }
        return await response.json();
    } catch (error) {
        if (error.message.includes('Failed to fetch')) {
            throw new Error('Error de Conexión: No se pudo conectar con el servidor para obtener el pedido.');
        }
        throw error;
    }
}

// Función para actualizar el estado del pedido
async function updateOrderStatus(orderId, newStatus) {
    console.log(`Intentando actualizar pedido ${orderId} a estado ${newStatus}`);
    const URL = `http://98.86.121.57:7000/api/orders/${orderId}/status`;
    const body = { id_status: newStatus };
    try {
        const response = await fetch(URL, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            if (response.status === 404) throw new Error(`Pedido no encontrado (código: 404).`);
            if (response.status === 400) {
                const errorData = await response.json();
                throw new Error(`Error de validación: ${errorData.message || 'Datos incorrectos.'}`);
            }
            throw new Error(`Error del servidor al actualizar (código: ${response.status}).`);
        }
    } catch (error) {
        if (error.message.includes('Failed to fetch')) throw new Error('Error de Conexión al actualizar.');
        throw error;
    }
}