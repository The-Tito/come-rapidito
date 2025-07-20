document.addEventListener("DOMContentLoaded", () => {
  const contenedorPedidos = document.querySelector(".contenedor-pedidos");
  const modalPedido = document.getElementById("modal-pedido");
  const modalTarifa = document.getElementById("modal_tarifa");
  const modalConfirmacion = document.getElementById("modal-confirmacion");

  const btnRegresar = document.querySelector(".btn-regresar");
  const btnAceptar = document.querySelector(".btn-aceptar");
  const btnRegresarTarifa = document.querySelector(".btn-regresar-tarifa");
  const btnAceptarTarifa = document.querySelector(".btn-aceptar-tarifa");
  const btnContinuar = document.querySelector(".btn-continuar");

  const tarifaSelect = document.getElementById("tarifa");
  const errorMensaje = document.getElementById("tarifa-error");
  const tarifaConfirmadaTexto = document.getElementById("tarifa-confirmada");

  let pedidoSeleccionado = null;

  const token = localStorage.getItem("token");

if (!token) {
  console.error("❌ No hay token en localStorage, perro.");
  return;
}


  fetch("http://localhost:7000/api/orders/delivery", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    mode: "cors"
  })
    .then(res => {
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      return res.json();
    })
    .then(pedidos => {
      pedidos.forEach(pedido => {
        const card = document.createElement("div");
        card.classList.add("card-pedido");

        card.innerHTML = `
          <div class="fila-info"><strong>ID:</strong> <span>${pedido.id_pedido}</span></div>
          <div class="fila-info"><strong>Restaurante:</strong> <span>${pedido.restaurante.nombre_restaurante}</span></div>
          <div class="fila-info"><strong>Fecha:</strong> <span>${pedido.fecha_pedido}</span></div>
          <div class="fila-info"><strong>Total:</strong> <span>$${pedido.totalFinal.toFixed(2)}</span></div>
        `;

        card.addEventListener("click", () => {
          pedidoSeleccionado = pedido;
          abrirModalPedido(pedido);
        });

        contenedorPedidos.appendChild(card);
      });
    })
    .catch(err => console.error("💥 Error al cargar pedidos:", err));

  // Mostrar modal con datos del pedido
  function abrirModalPedido(pedido) {
    modalPedido.classList.remove("oculto");
    document.getElementById("nombre_restaurante").textContent = pedido.restaurante.nombre_restaurante;
    document.getElementById("direccion_restaurante").textContent = pedido.restaurante.direccion;
    document.getElementById("num_telefono").textContent = pedido.numero_telefono || "N/A";
    document.getElementById("id_direccion").textContent =
      `${pedido.direccion.calle}, ${pedido.direccion.colonia}, ${pedido.direccion.numero_casa}, ${pedido.direccion.codigo_postal}`;
    document.getElementById("subtotal").textContent = `Subtotal: $${pedido.totalFinal.toFixed(2)}`;
  }

  btnRegresar.addEventListener("click", () => {
    modalPedido.classList.add("oculto");
  });

  btnAceptar.addEventListener("click", () => {
    modalPedido.classList.add("oculto");
    modalTarifa.classList.remove("oculto");
  });

  btnRegresarTarifa.addEventListener("click", () => {
    modalTarifa.classList.add("oculto");
  });

  btnAceptarTarifa.addEventListener("click", () => {
    const tarifa = parseInt(tarifaSelect.value);
    if (!tarifa) {
      errorMensaje.classList.remove("oculto");
      return;
    }

    errorMensaje.classList.add("oculto");

    fetch(`http://localhost:7000/api/orders/${pedidoSeleccionado.id_pedido}/fee`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ tarifa })
    })
      .then(res => {
        if (!res.ok) throw new Error("Error al actualizar tarifa");
        return res.text();
      })
      .then(() => {
        modalTarifa.classList.add("oculto");
        tarifaConfirmadaTexto.textContent = `$${tarifa}`;
        modalConfirmacion.classList.remove("oculto");

        // Actualizar total en memoria y UI
        const nuevoTotal = pedidoSeleccionado.totalFinal + tarifa;
        pedidoSeleccionado.totalFinal = nuevoTotal;
        document.getElementById("subtotal").textContent = `Subtotal: $${nuevoTotal.toFixed(2)}`;
      })
      .catch(err => console.error("💥 Error PUT tarifa:", err));
  });

  btnContinuar.addEventListener("click", () => {
    modalConfirmacion.classList.add("oculto");
  });

  tarifaSelect.addEventListener("change", () => {
    if (tarifaSelect.value !== "") {
      errorMensaje.classList.add("oculto");
    }
  });
});
