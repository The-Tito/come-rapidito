// ../JS/seguimiento.js - VERSIÓN MEJORADA

// --- CONFIGURACIÓN DE ESTADOS ---
const STATUS_MAP = {
    "En preparación": 8, // Este es el ID de estado del backend
    "En espera": 9,      // Asumiendo que 9 es "En espera" o "Asignado a repartidor"
    "En camino": 3,      // Este es el ID de estado del backend
    "Entregado": 4       // Este es el ID de estado del backend
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

        // Solo actualiza la UI si el estado ha cambiado
        if (newStatus !== oldStatus) {
            console.log(`Estado del pedido ${orderId} ha cambiado de ${oldStatus} a ${newStatus}`);
            container.setAttribute('data-current-status', newStatus);
            updateCheckboxesUI(newStatus);

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
    
    // Primero, deshabilitar todos los checkboxes de usuario hasta que se decida su estado
    checkboxes.forEach(checkbox => {
        // Mantener deshabilitados "En preparación" y "En espera" ya que son controlados por otro usuario
        if (checkbox.id === "En preparación" || checkbox.id === "En espera") {
            checkbox.disabled = true;
        } else {
            // Re-habilitar los propios para el repartidor si es necesario
            checkbox.disabled = false;
        }
        checkbox.parentElement.classList.remove('completed');
    });

    for (const [statusName, statusId] of Object.entries(STATUS_MAP)) {
        const checkbox = document.getElementById(statusName);
        if (checkbox) {
            if (currentStatus >= statusId) {
                checkbox.checked = true;
                checkbox.disabled = true; // Deshabilita el checkbox si su estado es igual o menor al actual
                checkbox.parentElement.classList.add('completed');
            } else {
                // Si el estado actual es menor, asegúrate de que esté desmarcado y habilitado (si no es de "otro usuario")
                checkbox.checked = false;
                if (checkbox.id !== "En preparación" && checkbox.id !== "En espera") {
                    checkbox.disabled = false;
                }
            }
        }
    }
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
        if (checkbox.id === "En camino" || checkbox.id === "Entregado") {
            checkbox.addEventListener('change', handleStatusUpdate);
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

    // Lógica para asegurar que los estados se marquen en orden y no se puedan "saltar" ni "retroceder"
    let expectedPreviousStatus;
    if (checkbox.id === "En camino") {
        expectedPreviousStatus = STATUS_MAP["En espera"]; // Para ir a "En camino", debe estar en "En espera" (9)
    } else if (checkbox.id === "Entregado") {
        expectedPreviousStatus = STATUS_MAP["En camino"]; // Para ir a "Entregado", debe estar en "En camino" (3)
    }

    if (currentStatus < expectedPreviousStatus || currentStatus >= newStatusTarget) {
        alert(`No puedes cambiar a "${checkbox.id}" en este momento. El pedido debe estar en el estado correcto.`);
        checkbox.checked = false; // Desmarcar el checkbox si la acción no es válida
        updateCheckboxesUI(currentStatus); // Vuelve a renderizar la UI con el estado correcto
        return;
    }

    // Si el usuario marcó "En camino" o "Entregado" y la lógica es válida
    if (checkbox.id === "En camino" && currentStatus === STATUS_MAP["En espera"]) {
        try {
            // Deshabilitar todos los checkboxes temporalmente para evitar interacciones dobles
            document.querySelectorAll('.seguimiento_container input[type="checkbox"]').forEach(cb => cb.disabled = true);
            await updateOrderStatus(orderId, newStatusTarget);
            console.log(`Pedido #${orderId} actualizado con éxito a "En camino".`);
            container.setAttribute('data-current-status', newStatusTarget); // Actualiza el status localmente
            updateCheckboxesUI(newStatusTarget); // Vuelve a renderizar la UI con el nuevo estado
            addCheckboxListeners(); // Re-añadir listeners por si se deshabilitaron y queremos que vuelvan
        } catch (error) {
            displayError(`No se pudo actualizar el pedido a "En camino": ${error.message}`);
            checkbox.checked = false; // Desmarcar si falla
            updateCheckboxesUI(currentStatus); // Vuelve a la UI original
            addCheckboxListeners();
        }
    } else if (checkbox.id === "Entregado" && currentStatus === STATUS_MAP["En camino"]) {
        try {
            document.querySelectorAll('.seguimiento_container input[type="checkbox"]').forEach(cb => cb.disabled = true);
            await updateOrderStatus(orderId, newStatusTarget);
            console.log(`Pedido #${orderId} actualizado con éxito a "Entregado".`);
            container.setAttribute('data-current-status', newStatusTarget); // Actualiza el status localmente
            updateCheckboxesUI(newStatusTarget); // Vuelve a renderizar la UI con el nuevo estado
            showModal(); // Muestra el modal de éxito
            clearInterval(pollingTimer); // Detiene el polling
        } catch (error) {
            displayError(`No se pudo actualizar el pedido a "Entregado": ${error.message}`);
            checkbox.checked = false; // Desmarcar si falla
            updateCheckboxesUI(currentStatus); // Vuelve a la UI original
            addCheckboxListeners();
        }
    } else {
        // En cualquier otro caso (como intentar marcar entregado si no está en camino, etc.)
        alert(`No puedes cambiar a "${checkbox.id}" en este momento. Asegúrate de seguir el orden de los estados.`);
        checkbox.checked = false;
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
    const seccion = document.querySelector('main.seccion');
    if (seccion) {
        seccion.innerHTML = `<div class="error-container" style="color: red; padding: 20px; border: 1px solid red; background: #ffeeee; margin: 20px auto; max-width: 600px; text-align: center;">${message}</div>`;
    }
    console.error(message);
}

function getAuthHeaders() {
    const token = localStorage.getItem("token");
    const nombre = localStorage.getItem("nombre");

    if (!token || !nombre) {
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
    const URL = `http://54.88.1.254:7000/api/orders/${orderId}`;
    try {
        const response = await fetch(URL, { 
            method: 'GET', // Usar GET para obtener un pedido
            headers: getAuthHeaders()
        });
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error(`Fallo de autorización (código: ${response.status}).`);
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
    const URL = `http://54.88.1.254:7000/api/orders/${orderId}/status`;
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