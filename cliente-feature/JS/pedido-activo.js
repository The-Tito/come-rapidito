
const params = new URLSearchParams(window.location.search);
const idPedido = params.get("id");


document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const idPedido = params.get("id");
  const contenedorOrderId = document.querySelector(".order-id");
  const contenedorStepper = document.querySelector(".stepper");
  const restaurantLogo = document.querySelector(".restaurant-logo");
  const restaurantNameSpan = document.querySelector(".order-summary .restaurant-info span");
  const priceDetails = document.querySelector(".price-details");
  const priceTotal = document.querySelector(".price-total span:last-child");
  const tiempoEspera = document.querySelector(".delivery-details .detail-value");
  const direccionEntrega = document.querySelector(".delivery-details .detail-item:last-child .detail-value");

  const token = localStorage.getItem("token")?.replace(/"/g, '');
  const nombre = localStorage.getItem("nombre")?.replace(/"/g, '');

  if (!idPedido) {
    alert("No se especificó el pedido");
    return;
  }

  fetch(`http://localhost:7000/api/users/${idPedido}/orders/actual`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "X-User-NAME": nombre,
      "Content-Type": "application/json"
    }
  })
  .then(res => {
    if (!res.ok) throw new Error("No se encontró el pedido");
    return res.json();
  })
  .then(pedido => {
    document.querySelector("main").className = `tracking-container status-${pedido.id_status}`;
    // Actualizar número de pedido
    contenedorOrderId.textContent = `Pedido #${pedido.id_pedido} realizado`;

    // Actualizar stepper según estado
    contenedorStepper.innerHTML = "";
    const pasos = ["EN PREPARACION", "EN ESPERA", "EN CAMINO"];
    pasos.forEach((paso, idx) => {
      const div = document.createElement("div");
      div.classList.add("step", `step-${idx + 1}`);

      // Marca según status (1, 2, 3)
      if (pedido.id_status === 1 && idx === 0) {
        div.classList.add("activo");
      } else if (pedido.id_status === 2 && idx <= 1) {
        div.classList.add(idx === 0 ? "activo" : "en-camino");
      } else if (pedido.id_status === 3) {
        if (idx === 0) div.classList.add("activo");
        else if (idx === 1) div.classList.add("en-camino");
        else if (idx === 2) div.classList.add("entregado");
      }

      div.textContent = paso;
      contenedorStepper.appendChild(div);
    });

    // Nombre restaurante (sin logo, ya que no viene en JSON)
    restaurantNameSpan.textContent = pedido.restaurante.nombre_restaurante;
    

    // Precio detalle (usa carrito.total como subtotal y totalFinal)
    priceDetails.innerHTML = `
      <div class="price-item">
        <span>Subtotal</span>
        <span>$${pedido.carrito.total.toFixed(2)}</span>
      </div>
      <div class="price-item">
        <span>Costo de envío</span>
        <span>$25.00</span> <!-- fijo, puedes cambiar si tienes ese dato -->
      </div>
      <div class="price-item">
        <span>Cuota de servicio</span>
        <span>$8.00</span> <!-- fijo, puedes cambiar si tienes ese dato -->
      </div>
    `;

    // Total
    priceTotal.textContent = `$${pedido.totalFinal.toFixed(2)}`;

    // Tiempo estimado (puedes modificar si tienes ese dato)
    tiempoEspera.textContent = "20-30 minutos";

    // Dirección entrega: arma con la info de dirección
    const dir = pedido.direccion;
    direccionEntrega.textContent = `${dir.calle} ${dir.numero_casa}, ${dir.colonia}, CP ${dir.codigo_postal} - ${dir.referencia}`;

  })
  .catch(err => {
    alert("Error al cargar pedido: " + err.message);
    console.error(err);
  });
});

const pasos = ["EN PREPARACIÓN", "EN CAMINO", "ENTREGADO"];
contenedorStepper.innerHTML = pasos.map((paso, idx) => {
  return `<div class="step step-${idx + 1}">${paso}</div>`;
}).join("");
