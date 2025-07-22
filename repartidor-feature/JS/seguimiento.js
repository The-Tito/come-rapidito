// ===============================================================================
// ARCHIVO FINAL - ADAPTADO A LAS RUTAS EXISTENTES (GET /api/users/{id}/orders/active)
// ===============================================================================

// Mapear los checkboxes a los IDs de status del backend según tu flujo.
const STATUS_MAP = {
    "En preparación": 1,
    "En camino": 3,
    "Entregado": 4
};

// Definir el flujo de progreso de los estados.
const STATUS_FLOW = [1, 3, 4]; // 8:Activo, 1:Preparación, 3:Camino, 4:Entregado, 5:Cancelado

// --- INICIALIZACIÓN DE LA PÁGINA ---
document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById('modal-entregado');
    if (modal) modal.classList.add('oculto');

    // Paso 1: Obtener AMBOS IDs, el del pedido y el del usuario.
    const orderId = localStorage.getItem("pedido_id_seguimiento");
    const userId = localStorage.getItem("id_usuario"); // Necesitamos este para la URL de la API.

    if (!orderId || !userId) {
        displayError("Error Fatal: Faltan datos esenciales (ID de pedido o de usuario). Por favor, regresa y selecciona un pedido.");
        return;
    }
    
    // Paso 2: Iniciar el seguimiento pasando ambos IDs.
    initializeOrderTracking(orderId, userId);

    const modalButton = document.querySelector("#modal-entregado .btn-continuar");
    modalButton.addEventListener("click", () => {
        localStorage.removeItem("pedido_id_seguimiento");
        window.location.href = '../pages/historial.html';
    });
});

/**
 * Función principal: Busca el pedido específico dentro de la lista de activos del usuario.
 * @param {string} orderId - El ID del pedido a seguir.
 * @param {string} userId - El ID del usuario para usar en la URL.
 */
async function initializeOrderTracking(orderId, userId) {
    try {
        // CAMBIO CLAVE: Llamamos a una función que usa la ruta de pedidos activos.
        const currentOrder = await findSpecificActiveOrder(orderId, userId);

        if (!currentOrder) {
            // Este error ahora significa que el pedido no se encontró en la lista de activos.
            // Puede ser porque ya se entregó (estado 4) o se canceló (estado 5).
            throw new Error(`El pedido #${orderId} no fue encontrado entre los pedidos activos.`);
        }
        
        const container = document.querySelector('.seguimiento_container');
        container.setAttribute('data-current-status', currentOrder.id_status);
        container.setAttribute('data-order-id', currentOrder.id_pedido);

        updateCheckboxesUI(currentOrder.id_status);
        addCheckboxListeners();

    } catch (error) {
        displayError(error.message);
    }
}


// --- FUNCIONES DE MANEJO DE LA INTERFAZ (UI) ---

/**
 * Actualiza la UI de los checkboxes respetando el flujo de estados (8 -> 1 -> 3 -> 4).
 */
function updateCheckboxesUI(currentStatus) {
    const checkboxes = document.querySelectorAll('.seguimiento_container input[type="checkbox"]');
    const currentStatusIndex = STATUS_FLOW.indexOf(currentStatus);

    checkboxes.forEach(checkbox => {
        const checkboxStatusId = STATUS_MAP[checkbox.id];
        const checkboxStatusIndex = STATUS_FLOW.indexOf(checkboxStatusId);

        checkbox.disabled = false;
        checkbox.checked = false;
        checkbox.parentElement.classList.remove('completed');

        // Si el estado actual está más avanzado (o es el mismo) que el del checkbox, lo marcamos.
        if (currentStatusIndex >= checkboxStatusIndex) {
            checkbox.checked = true;
            checkbox.disabled = true;
            checkbox.parentElement.classList.add('completed');
        }
    });

    if (currentStatus === 4 || currentStatus === 5) {
        checkboxes.forEach(cb => { cb.disabled = true; });
    }
}

/**
 * Añade los event listeners a cada checkbox que no esté deshabilitado.
 */
function addCheckboxListeners() {
    document.querySelectorAll('.seguimiento_container input[type="checkbox"]').forEach(checkbox => {
        if (!checkbox.disabled) {
            checkbox.addEventListener('change', handleStatusUpdate);
        }
    });
}

/**
 * Maneja la lógica de actualización cuando se hace clic en un checkbox.
 */
async function handleStatusUpdate(event) {
    const checkbox = event.target;
    if (!checkbox.checked) {
        checkbox.checked = true;
        return;
    }

    const container = document.querySelector('.seguimiento_container');
    const orderId = container.getAttribute('data-order-id');
    const currentStatus = parseInt(container.getAttribute('data-current-status'), 10);
    const newStatus = STATUS_MAP[checkbox.id];

    if (STATUS_FLOW.indexOf(newStatus) <= STATUS_FLOW.indexOf(currentStatus)) {
        displayError(`Movimiento no válido: No se puede pasar del estado ${currentStatus} al ${newStatus}.`);
        checkbox.checked = false;
        return;
    }

    try {
        document.querySelectorAll('.seguimiento_container input[type="checkbox"]').forEach(cb => cb.disabled = true);
        await updateOrderStatus(orderId, newStatus);
        
        container.setAttribute('data-current-status', newStatus);
        updateCheckboxesUI(newStatus);
        addCheckboxListeners();

        if (newStatus === STATUS_MAP["Entregado"]) {
            showModal();
        }
    } catch (error) {
        displayError(`No se pudo actualizar el pedido: ${error.message}`);
        updateCheckboxesUI(currentStatus);
        addCheckboxListeners();
    }
}


// --- FUNCIONES DE API Y UTILIDADES ---

function showModal() {
    const modal = document.getElementById('modal-entregado');
    if(modal) modal.classList.remove('oculto');
}

function displayError(message) {
    console.error(`ERROR CAPTURADO: ${message}`);
}

function getAuthHeaders() {
    const token = localStorage.getItem("token");
    const nombre = localStorage.getItem("nombre");
    if (!token || !nombre) throw new Error("Error de Autenticación: Faltan datos en localStorage.");
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.replace(/"/g, '')}`,
        'X-User-NAME': nombre.replace(/"/g, '')
    };
}

/**
 * NUEVA FUNCIÓN: Usa la ruta de activos para obtener todos los pedidos y luego
 * busca el específico que necesitamos por su ID.
 * @param {string} orderIdToFind - El ID del pedido que buscamos.
 * @param {string} userId - El ID del usuario para la URL.
 */
async function findSpecificActiveOrder(orderIdToFind, userId) {
    // Usamos la ruta GET que SÍ existe.
    const URL = `http://localhost:7000/api/users/${userId}/orders/active`;
    try {
        const response = await fetch(URL, { method: 'GET', headers: getAuthHeaders() });
        if (!response.ok) {
            if (response.status === 404) return null; // El usuario no tiene pedidos activos
            throw new Error(`Error del servidor (${response.status}) al obtener pedidos activos.`);
        }
        
        const activeOrders = await response.json();
        // Buscamos nuestro pedido dentro del array de resultados.
        // Usamos == para comparar por si uno es string y el otro número.
        return activeOrders.find(order => order.id_pedido == orderIdToFind);

    } catch (error) {
        if (error.message.includes('Failed to fetch')) throw new Error('Error de Conexión.');
        throw error;
    }
}

/**
 * Llama a la API para actualizar el estado. Esta función usa la ruta PUT que ya existía.
 */
async function updateOrderStatus(orderId, newStatus) {
    const URL = `http://localhost:7000/api/orders/${orderId}/status`;
    const body = { id_status: newStatus };
    try {
        const response = await fetch(URL, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(body) });
        if (!response.ok) throw new Error(`Error del servidor al actualizar (${response.status})`);
    } catch (error) {
        if (error.message.includes('Failed to fetch')) throw new Error('Error de Conexión al actualizar.');
        throw error;
    }
}