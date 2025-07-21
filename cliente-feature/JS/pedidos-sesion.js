
document.addEventListener("DOMContentLoaded", () => {
  cargarPedidosActivos();
  setInterval(cargarPedidosActivos, 10000); // cada 10 segundos
});

function cargarPedidosActivos() {
  const contenedor = document.getElementById("pedidos-activos");
  const nombre = localStorage.getItem("nombre")?.replace(/"/g, '');
    const token = localStorage.getItem("token")?.replace(/"/g, '');
    const id_usuario = localStorage.getItem("id_usuario");

  fetch(`http://localhost:7000/api/users/${id_usuario}/orders/active`, {
    method: 'GET',
            headers: {
                "Authorization": `Bearer ${token}`,
                "X-User-NAME": `${nombre}`,
                'Content-Type': 'application/json'
        }
  })
    .then(response => response.json())
    .then(data => {
      contenedor.innerHTML = ""; // limpiar anteriores
      data.forEach(pedido => {
        const card = crearCardPedido(pedido);
        contenedor.appendChild(card);
      });
    })
    .catch(err => {
      console.error("Error al cargar pedidos activos:", err);
    });
}

function crearCardPedido(pedido) {
  const estado = pedido.id_status; // 1 = preparación, 2 = camino, 3 = entregado

  const card = document.createElement("div");
  card.classList.add("card-pedido");

  const pasos = ["EN PREPARACIÓN", "EN ESPERA", "EN CAMINO"];

  const stepperHTML = pasos.map((nombrePaso, index) => {
    let clase = "";

    // Solo aplicar clases si el estado NO es 8
    if (estado !== 8) {
      if (estado > index) {
        if (index === 0) clase = "activo";
        if (index === 1) clase = "en-camino";
        if (index === 2) clase = "entregado";
      }
    }

    return `<div class="step ${clase}">${nombrePaso}</div>`;
  }).join("");

  card.innerHTML = `
  <div class="info-pedido">
    <div class="info-restaurante">
      <h3>${pedido.restaurante.nombre_restaurante}</h3>
      <p>Pedido #${pedido.id_pedido}</p>
    </div>
    <div class="info-estado">
      <p><strong>Total:</strong> $${pedido.totalFinal.toFixed(2)}</p>
      <p><strong>Tiempo estimado:</strong> 20-30 min</p>
    </div>
  </div>
  <div class="stepper">${stepperHTML}</div>
`;


  // Click para ir a detalles del pedido
  card.style.cursor = "pointer";
  card.addEventListener("click", () => {
    window.location.href = `../pages/pedido-activo.html?id=${pedido.id_pedido}`;
  });

  return card;
}
card.classList.add(`status-${estado}`);



