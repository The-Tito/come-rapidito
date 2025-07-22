

let tokenstorage = localStorage.getItem("token")
let nombrestorage = localStorage.getItem("nombre")
let nombre = nombrestorage.replace(/"/g, '');
let token = tokenstorage.replace(/"/g, '');
let id_restaurante = localStorage.getItem("id_restaurante");

// Datos de ejemplo y el JSON proporcionado


// Mapeo de ID de status a texto
const statusMap = {
    4: 'Entregado',
    5: `Cancelado`
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

    // Formatear información de productos
    const productsInfo = orderData.carrito.detalleCarrito
        .map(item => `${item.cantidad} -- ${item.nombre}`)
        .join('\n');

    // Crear celda de ID
    const idCell = document.createElement('td');
    idCell.className = 'order-id';
    idCell.textContent = `#${orderData.id_pedido}`;

    // Crear celda de productos
    const productsCell = document.createElement('td');
    productsCell.className = 'product-info';
    productsCell.textContent = productsInfo;

    // Crear celda de status
    const statusCell = document.createElement('td');
  
    
    const statusSelect = document.createElement('tr');
    statusSelect.className = 'status';
    const currentStatus = statusMap[orderData.id_status] || 'Desconocido';
    statusSelect.innerHTML = `<option selected>${currentStatus}</option>`;

    
    statusCell.appendChild(statusSelect)

    // Crear celdas de fecha y total
    const dateCell = document.createElement('td');
    dateCell.textContent = formatDate(orderData.fecha_pedido);

    const totalCell = document.createElement('td');
    totalCell.className = 'total';
    totalCell.textContent = `$${orderData.carrito.total.toFixed(0)}`;

    // Añadir celdas a la fila
    row.append(idCell, productsCell, statusCell, dateCell, totalCell);

    // Añadir fila a la tabla
    tableBody.appendChild(row);
}

/**
 * Crea y añade una fila estática a la tabla
 * @param {object} staticOrder
 */

// Al cargar la página, poblar la tabla
document.addEventListener('DOMContentLoaded', () => {

    // Añadir la fila desde el JSON
    const order = {
  id_status: 4
};

fetch(`http://localhost:7000/api/orders/restaurant/${id_restaurante}/history`, {
  method: "GET",
  headers: {
    "Authorization": `Bearer ${token}`,
    "X-User-NAME": `${nombre}`,
    "Content-Type": "application/json"
  }
})
  .then(res => res.json())
  .then(data => {
     // Asegúrate de que es un array

    // data debe ser un array con los pedidos
    for (const pedido of data) {
      addOrderRow(pedido); // Llamas la función con un pedido individual
    }
  })
  .catch(error => {
    console.error('Error al cargar los pedidos:', error);
    alert('Error al cargar los pedidos:', error)
  });

});