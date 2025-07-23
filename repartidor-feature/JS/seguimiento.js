// ../JS/seguimiento.js - VERSIÓN MODIFICADA CON localStorage

// --- CONFIGURACIÓN DE ESTADOS ---
const STATUS_MAP = {
    "En camino": 3,
    "Entregado": 4 
};

// --- INICIALIZACIÓN DE LA PÁGINA ---
document.addEventListener("DOMContentLoaded", () => {
    // CAMBIO 1: Obtener el ID desde localStorage en lugar de la URL.
    const orderId = localStorage.getItem("pedido_id_seguimiento");
    const userId = localStorage.getItem("id_usuario");

    // CAMBIO 2: Mensaje de error más específico para este método.
    if (!orderId) {
        displayError("Error: No se encontró un ID de pedido. Por favor, regresa a 'Pedidos Activos' y selecciona uno.");
        return;
    }
    if (!userId) {
        displayError("Error: No se pudo identificar al usuario. Por favor, inicia sesión de nuevo.");
        return;
    }

    initializeOrderTracking(orderId, userId);

    const modalButton = document.querySelector("#modal-entregado .btn-continuar");
    modalButton.addEventListener("click", () => {
        // Opcional: Limpiar el ID del localStorage después de terminar para evitar cargar un pedido ya entregado si se vuelve a la página.
        localStorage.removeItem("pedido_id_seguimiento");
        window.location.href = '../pages/historial.html';
    });
});

/**
 * Función principal para cargar los datos del pedido y configurar los listeners.
 * @param {string} orderId - El ID del pedido a seguir.
 * @param {string} userId - El ID del usuario logueado.
 */
async function initializeOrderTracking(orderId, userId) {
    try {
        const allActiveOrders = await fetchActiveOrders(userId);
        const currentOrder = allActiveOrders.find(order => order.id_pedido == orderId);

        if (!currentOrder) {
            // Este error puede ocurrir si el pedido ya no está activo cuando llegas a esta página.
            throw new Error(`El pedido #${orderId} ya no se encuentra entre los pedidos activos o no te pertenece.`);
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

// El resto del código permanece EXACTAMENTE IGUAL, ya que la lógica
// interna no depende de *dónde* se obtuvo el ID, solo de que *exista*.

/**
 * Actualiza la apariencia de los checkboxes basado en el estado actual del pedido.
 * @param {number} currentStatus - El ID del estado actual del pedido.
 */
function updateCheckboxesUI(currentStatus) {
    const checkboxes = document.querySelectorAll('.seguimiento_container input[type="checkbox"]');
    const statusOrder = {
        "En preparación": 8,
        "En camino": STATUS_MAP["En camino"],
        "Entregado": STATUS_MAP["Entregado"]
    };

    checkboxes.forEach(checkbox => {
        const checkboxStatus = statusOrder[checkbox.id];
        // Pequeño ajuste en la lógica de comparación para manejar estados finales
        if (checkboxStatus <= currentStatus) {
            checkbox.checked = true;
            checkbox.disabled = true;
            checkbox.parentElement.classList.add('completed');
        }
        // Si el pedido ya fue entregado (status 4), marcamos y deshabilitamos todo.
        if (currentStatus === 4) {
            checkbox.checked = true;
            checkbox.disabled = true;
            checkbox.parentElement.classList.add('completed');
        }
    });
}

/**
 * Añade los event listeners a cada checkbox para manejar las actualizaciones.
 */
function addCheckboxListeners() {
    const checkboxes = document.querySelectorAll('.seguimiento_container input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleStatusUpdate);
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
    const newStatus = STATUS_MAP[checkbox.id];

    if (!checkbox.checked) {
        checkbox.checked = true;
        return;
    }
    
    // La lógica de negocio para no retroceder de estado ahora es más crucial
    const statusValues = Object.values(STATUS_MAP);
    if (statusValues.includes(currentStatus)) { // Si ya estamos en "En Camino" o "Entregado"
        alert("¡Acción no permitida! El estado ya ha avanzado.");
        checkbox.checked = false;
        return;
    }

    try {
        document.querySelectorAll('.seguimiento_container input[type="checkbox"]').forEach(cb => cb.disabled = true);
        await updateOrderStatus(orderId, newStatus);
        
        console.log(`Pedido #${orderId} actualizado con éxito al estado ${newStatus}.`);
        container.setAttribute('data-current-status', newStatus);
        updateCheckboxesUI(newStatus);

        if (newStatus === STATUS_MAP["Entregado"]) {
            showModal();
        }

    } catch (error) {
        displayError(`No se pudo actualizar el pedido: ${error.message}`);
        checkbox.checked = false;
    } finally {
        updateCheckboxesUI(parseInt(container.getAttribute('data-current-status'), 10));
    }
}


// --- FUNCIONES DE API Y UTILIDADES (SIN CAMBIOS) ---

function showModal() {
    const modal = document.getElementById('modal-entregado');
    if(modal) modal.classList.remove('oculto');
}

function displayError(message) {
    const seccion = document.querySelector('main.seccion');
    seccion.innerHTML = `<div class="error-container" style="color: red; padding: 20px; border: 1px solid red; background: #ffeeee;">${message}</div>`;
    console.error(message);
}

function getAuthHeaders() {
    const token = localStorage.getItem("token");
    const nombre = localStorage.getItem("nombre");

    if (!token || !nombre) {
        throw new Error("Error de Autenticación: El token o el nombre de usuario no fueron encontrados en localStorage.");
    }
    // Tu código original limpiaba las comillas, lo replicamos aquí por consistencia
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.replace(/"/g, '')}`,
        'X-User-NAME': nombre.replace(/"/g, '')
    };
}

// Esta función ahora usa la ruta que tienes en pedidos-activos.js
async function fetchActiveOrders() {
    const URL = `http://localhost:7000/api/orders/delivery`;
    try {
        const response = await fetch(URL, { 
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ id_status: 8 }) // Buscamos los pedidos que están listos para ser asignados
        });
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) throw new Error(`Fallo de autorización (código: ${response.status}).`);
            throw new Error(`Error del servidor al obtener pedidos (código: ${response.status}).`);
        }
        // Como la API pide status 8 pero también queremos ver pedidos ya aceptados (status 9), 
        // sería ideal tener una API que devuelva todos los pedidos activos del repartidor. 
        // Por ahora, trabajaremos con la que tenemos.
        return await response.json();
    } catch (error) {
        if (error.message.includes('Failed to fetch')) throw new Error('Error de Conexión: No se pudo conectar con el servidor.');
        throw error;
    }
}

async function updateOrderStatus(orderId, newStatus) {
    // Usamos el endpoint correcto de tu código original para el PUT
    const URL = `http://localhost:7000/api/orders/${orderId}/status`;
    const body = { id_status: newStatus };
    try {
        const response = await fetch(URL, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            if (response.status === 404) throw new Error(`Pedido no encontrado (código: 404).`);
            throw new Error(`Error del servidor al actualizar (código: ${response.status}).`);
        }
    } catch (error) {
        if (error.message.includes('Failed to fetch')) throw new Error('Error de Conexión al actualizar.');
        throw error;
    }
}