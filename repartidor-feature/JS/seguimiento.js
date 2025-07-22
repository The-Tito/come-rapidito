document.addEventListener("DOMContentLoaded", () => {

  let tokenstorage = localStorage.getItem("token");
  let nombrestorage = localStorage.getItem("nombre");
  let nombre = nombrestorage.replace(/"/g, '');
  let token = tokenstorage.replace(/"/g, '');
  
  const etapas = [
    document.getElementById("En espera"),
    document.getElementById("En preparación"),
    document.getElementById("En camino"),
    document.getElementById("Entregado")
  ];

  const statusMap = {
    "En espera": 2,
    "En preparación": 1,
    "En camino": 3,
    "Entregado": 4
  };

  const estadosRepartidorPuedeCambiar = [3, 4]; // solo estos puede cambiar el repartidor

  const pedidoId = localStorage.getItem("pedido_id_seguimiento");
  let pedidoStatusActual = parseInt(localStorage.getItem("pedido_id_status"));

  if (!pedidoId) {
    alert("Error: No se puede acceder al seguimiento sin un pedido válido");
    window.location.href = "../pages/pedidos-activos.html";
    return;
  }

  // Función que actualiza los checkboxes según el estado actual
  function updateCheckboxes(status) {
  // Si el estado es 8 (cancelado, eliminado, etc), desmarca y desactiva todo
  if (status === 8) {
    etapas.forEach(checkbox => {
      checkbox.checked = false;
      checkbox.disabled = true;
    });
    return;
  }

  etapas.forEach(checkbox => {
    const statusId = statusMap[checkbox.id];

    checkbox.checked = statusId === status;

    if (estadosRepartidorPuedeCambiar.includes(statusId) && statusId >= status) {
      checkbox.disabled = false;
    } else {
      checkbox.disabled = true;
    }
  });
}


  // Actualiza el UI con el estado actual de localStorage al cargar la página
  updateCheckboxes(pedidoStatusActual);

  // Actualización periódica del estado desde backend
  setInterval(() => {
    fetch(`http://localhost:7000/api/users/${pedidoId}/orders/actual`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-User-NAME': nombre
      }
    })
      .then(response => {
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return response.json();
      })
      .then(data => {
        const currentStatus = data.id_status;
        localStorage.setItem("pedido_id_status", currentStatus);
        updateCheckboxes(currentStatus);
      })
      .catch(error => {
        console.error("Error al obtener estado:", error);
        // Opcional: manejar errores de auth etc
      });
  }, 5000);

  // Manejar cambio de checkboxes que repartidor puede modificar
  ["En camino", "Entregado"].forEach(etapaId => {
    const checkbox = document.getElementById(etapaId);

    checkbox.addEventListener("change", () => {
  if (!checkbox.checked) {
    checkbox.checked = true;
    return;
  }

  const estadoPedido = statusMap[etapaId];

  if (estadoPedido < pedidoStatusActual) {
    alert("No se puede regresar a un estado anterior.");
    checkbox.checked = false;
    return;
  }

  fetch(`http://localhost:7000/api/orders/${pedidoId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-User-NAME': nombre
    },
    body: JSON.stringify({ id_status: estadoPedido })
  })
  .then(response => {
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return response.json();
  })
  .then(data => {
    pedidoStatusActual = estadoPedido;
    localStorage.setItem("pedido_id_status", estadoPedido);
    updateCheckboxes(estadoPedido);
    console.log("Estado actualizado correctamente:", data);

    // Si el estado es "Entregado", mostrar alerta y redirigir
    if (estadoPedido === 4) {
      alert("Gracias por completar el pedido");
      window.location.href = "../pages/index.html"; // Ajusta la ruta según tu estructura
    }
  })
  .catch(err => {
    console.error("Error al actualizar estado:", err);
    checkbox.checked = false;
  });
});

  });

});
