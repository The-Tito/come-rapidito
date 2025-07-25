
document.addEventListener('DOMContentLoaded', async () => {
  const main = document.querySelector('main');
  const idPedido = obtenerIdPedidoDesdeURL(); // <- función para sacar ID del pedido

  try {
    const res = await fetch(`http://98.86.121.57:7000/api/orders/${idPedido}`);
    if (!res.ok) throw new Error('No se pudo obtener el pedido');

    const pedido = await res.json();
    const idStatus = pedido.id_status;

    if (idStatus === 5) {
      // pa redirigir si cancelan el pedido
      window.location.href = "/cliente-feature/pages/pantalla-carga.html";
      return;
    }

    //cambiar la clase de status del main
    if ([1, 2, 3].includes(idStatus)) {
      main.classList.remove('status-1', 'status-2', 'status-3');
      main.classList.add(`status-${idStatus}`);
    }
//errores
  } catch (err) {
    console.error('Error al cargar seguimiento:', err.message);
    alert('Error al cargar el estado del pedido');
  }
});

function obtenerIdPedidoDesdeURL() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get("id")); // ejemplo: seguimiento.html?id=123
}


