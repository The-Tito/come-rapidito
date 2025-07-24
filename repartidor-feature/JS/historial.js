 document.addEventListener('DOMContentLoaded', async () => {
    
  let tokenstorage = localStorage.getItem("token");
  let nombrestorage = localStorage.getItem("nombre");
  let nombre = nombrestorage.replace(/"/g, '');
  let token = tokenstorage.replace(/"/g, '');
    const contenedorPedidos = document.querySelector('.contenedor-pedidos');
    contenedorPedidos.innerHTML = ''; // Limpiar cards de ejemplo

    try {
       // si usas token
      const response = await fetch('http://54.88.1.254:7000/api/orders/delivery/history', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'X-User-NAME': nombre // si es necesario, si no, elimina esta línea
        }
      });

      if (!response.ok) throw new Error('Error al cargar el historial');

      const pedidos = await response.json();

      if (pedidos.length === 0) {
        contenedorPedidos.innerHTML = '<p>No tienes pedidos en el historial.</p>';
        return;
      }

      pedidos.forEach(pedido => {
        // Formatear fecha (YYYY-MM-DD HH:mm:ss) a DD/MM/YY
        const fecha = new Date(pedido.fecha_pedido);
        const fechaFormateada = fecha.toLocaleDateString('es-MX', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit'
        });

        // Mapear status por id_status (ejemplo, adapta según tus status reales)
        const statusMap = {
          1: 'Pendiente',
          2: 'En preparación',
          3: 'En camino',
          4: 'Completado',
          5: 'Cancelado'
        };
        const statusTexto = statusMap[pedido.id_status] || 'Desconocido';

        // Crear card con template string
        const cardHTML = `
          <div class="card-pedido">
            <div class="fila-info">
              <strong>ID:</strong>
              <span>${pedido.id_pedido}</span>
            </div>
            <div class="fila-info">
              <strong>Restaurante:</strong>
              <span>${pedido.restaurante.nombre_restaurante}</span>
            </div>
            <div class="fila-info">
              <strong>Status:</strong>
              <span>${statusTexto}</span>
            </div>
            <div class="fila-info">
              <strong>Fecha:</strong>
              <span>${fechaFormateada}</span>
            </div>
            <div class="fila-info">
              <strong>Total:</strong>
              <span>$${pedido.total.toFixed(2)}</span>
            </div>
          </div>
        `;

        contenedorPedidos.insertAdjacentHTML('beforeend', cardHTML);
      });

    } catch (error) {
      console.error(error);
      contenedorPedidos.innerHTML = '<p>Error al cargar el historial de pedidos.</p>';
    }
  });