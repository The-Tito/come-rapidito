let tokenstorage = localStorage.getItem("token");
let nombrestorage = localStorage.getItem("nombre");
let nombre = nombrestorage ? nombrestorage.replace(/"/g, '') : 'default-user';
let token = tokenstorage ? tokenstorage.replace(/"/g, '') : 'default-token';
let id_restaurante = localStorage.getItem("id_restaurante") || '1'; // Default para prueba

// Mapeo de ID de status a texto
const statusMap = {
    1: 'En proceso',
    2: 'En preparación',
    3: 'En espera',
    4: 'En camino'
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
        <option value="proceso">En proceso</option>
        <option value="preparacion">En preparación</option>
        <option value="espera">En espera</option>
        <option value="camino" disabled>En camino</option>
    `;
    
    // Establecer la opción seleccionada según los datos del pedido
    const currentStatusKey = Object.keys(statusMap).find(key => statusMap[key] === statusMap[orderData.id_status]);
    if(currentStatusKey) {
        statusSelect.value = statusMap[currentStatusKey].toLowerCase().replace(' ', '');
    }

    // Funcionalidad al cambiar el status
    statusSelect.addEventListener('change', (event) => {
        const newStatus = event.target.options[event.target.selectedIndex].text;
        const orderId = event.target.dataset.orderId;
        console.log(`El status del Pedido #${orderId} ha cambiado a: "${newStatus}"`);
        // Aquí iría la lógica para enviar la actualización al servidor (API)
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

    fetch(`http://localhost:7000/api/orders/restaurant/${id_restaurante}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "X-User-NAME": `${nombre}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderPayload)
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