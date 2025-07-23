let tokenstorage = localStorage.getItem("token");
let nombrestorage = localStorage.getItem("nombre");
let nombre = nombrestorage ? nombrestorage.replace(/"/g, '') : 'default-user';
let token = tokenstorage ? tokenstorage.replace(/"/g, '') : 'default-token';
let id_restaurante = localStorage.getItem("id_restaurante");

// Mapeo de ID de status a texto
const statusMap = {
    1: 'En preparación',
    2: 'En espera',
    3: 'En camino',
    8: 'Activo'
};

/**
 * Formatea la fecha de 'YYYY-MM-DD HH:MM:SS' a 'DD/MM/YY'
 * @param {string} dateString
 * @returns {string}
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
}

/**
 * Crea y añade una fila de pedido a la tabla
 * @param {object} orderData - Los datos del pedido
 */
function addOrderRow(orderData) {
    const tableBody = document.getElementById('orders-tbody');
    const row = document.createElement('tr');

    const productsInfo = orderData.carrito.detalleCarrito
        .map(item => `${item.cantidad} -- ${item.nombre}`)
        .join('\n');

    const idCell = document.createElement('td');
    idCell.className = 'order-id';
    idCell.textContent = `#${orderData.id_pedido}`;

    const productsCell = document.createElement('td');
    productsCell.className = 'product-info';
    productsCell.textContent = productsInfo;

    // --- SECCIÓN DE STATUS MODIFICADA ---
    const statusCell = document.createElement('td');
    const statusWrapper = document.createElement('div');
    statusWrapper.className = 'status-select-wrapper';

    const statusSelect = document.createElement('select');
    statusSelect.className = 'status-dropdown';
    statusSelect.dataset.orderId = orderData.id_pedido; // Guardar ID para referencia

    // Opciones del dropdown
    statusSelect.innerHTML = `
        <option value="Activo">Activo</option>
        <option value="preparacion">En preparación</option>
        <option value="espera">En espera</option>
        <option value="camino" disabled>En camino</option>
    `;

    // Mapeo inverso para convertir id_status numérico al value del select
    const statusIdToValueMap = {
        1: "preparacion",
        2: "espera",
        3: "camino",
        8: "Activo"
    };

    // Asignar el valor preseleccionado al <select>
    statusSelect.value = statusIdToValueMap[orderData.id_status] || "proceso";

    // Funcionalidad al cambiar el status
    statusSelect.addEventListener('change', (event) => {
        const selectedOption = event.target.value;
        const orderId = event.target.dataset.orderId;

        // Mapear valor del select a id_status
        const statusToIdMap = {
            preparacion: 1,
            espera: 2
        };

        const newIdStatus = statusToIdMap[selectedOption];

        // Solo proceder si el nuevo estado es válido (preparacion o espera)
        if (newIdStatus) {
            // Deshabilitar el select temporalmente durante la actualización
            statusSelect.disabled = true;
            
            // ✅ CORRECCIÓN: Incluir el id_pedido en la URL y el cuerpo
            fetch(`http://54.88.1.254:7000/api/orders/${orderId}/status`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "X-User-NAME": nombre,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id_status: newIdStatus
                })
            })
            .then(response => {
                if (!response.ok) throw new Error(`Error al actualizar: ${response.status}`);
                return response.text();
            })
            .then(data => {
    console.log(`Pedido #${orderId} actualizado correctamente. Respuesta:`, data);

    // Desactivar solo si el estado nuevo es "espera"
    if (newIdStatus === 2) {
        statusSelect.disabled = true;
        statusSelect.style.opacity = '0.6';
        statusSelect.style.cursor = 'not-allowed';
        statusSelect.dataset.updated = 'true';
        console.log(`Pedido #${orderId} bloqueado tras llegar a 'En espera'`);
    } else {
        // Permitir seguir cambiando si es otro estado
        statusSelect.disabled = false;
        console.log(`Pedido #${orderId} actualizado a estado intermedio.`);
    }
})

            .catch(error => {
                console.error(`Error actualizando pedido #${orderId}:`, error);
                alert("No se pudo actualizar el estado del pedido.");
                
                // Revertir la selección y rehabilitar en caso de error
                statusSelect.value = statusIdToValueMap[orderData.id_status] || "proceso";
                statusSelect.disabled = false;
            });
        } else {
            console.warn("Estado no permitido para actualización.");
        }
    });

    statusWrapper.appendChild(statusSelect);
    statusCell.appendChild(statusWrapper);
    // --- FIN DE LA SECCIÓN MODIFICADA ---

    const dateCell = document.createElement('td');
    dateCell.textContent = formatDate(orderData.fecha_pedido);

    const totalCell = document.createElement('td');
    totalCell.className = 'total';
    totalCell.textContent = `$${orderData.carrito.total.toFixed(0)}`;

    row.append(idCell, productsCell, statusCell, dateCell, totalCell);
    tableBody.appendChild(row);
}

// Al cargar la página, poblar la tabla
document.addEventListener('DOMContentLoaded', () => {
    const orderPayload = {
        id_status: 1
    };

    fetch(`http://54.88.1.254:7000/api/orders/restaurant/${id_restaurante}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "X-User-NAME": `${nombre}`,
                "Content-Type": "application/json"
            }
        })
        .then(res => {
            if (!res.ok) {
                throw new Error(`Error en la respuesta del servidor: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            console.log("Pedidos recibidos:", data);
            if (Array.isArray(data)) {
                data.forEach(pedido => addOrderRow(pedido));
            } else {
                console.error('Los datos recibidos no son un array.');
            }
        })
        .catch(error => {
            console.error('Error al cargar los pedidos:', error);
            // alert('No se pudieron cargar los pedidos. Revisa la consola para más detalles.');
        });
});