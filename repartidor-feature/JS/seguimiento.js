document.addEventListener("DOMContentLoaded", () => {
  const etapas = [
    document.getElementById("En preparación"),
    document.getElementById("En camino"),
    document.getElementById("Entregado")
  ];

  const statusMap = {
    "En preparación": 1,
    "En camino": 3,
    "Entregado": 4
  };

  const pedidoId = localStorage.getItem("pedido_id_seguimiento"); // Obtener el id_pedido de localStorage


  if (!pedidoId) {
    console.warn("No se encontró el id_pedido en la URL.");
    return;
  }

  const modal = document.getElementById("modal-confirmacion");
  const btnContinuar = document.querySelector(".btn-continuar");

  const estadoGuardado = localStorage.getItem(`estadoPedido_${pedidoId}`);
  if (estadoGuardado) {
    etapas.forEach((checkbox, index) => {
      if (checkbox.id === estadoGuardado) {
        checkbox.checked = true;

        for (let i = 0; i < index; i++) {
          etapas[i].disabled = true;
        }

        if (estadoGuardado === "Entregado") {
          etapas.forEach(cb => cb.disabled = true);
        }
      }
    });
  }
  

  etapas.forEach((checkbox, index) => {
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        etapas.forEach((cb, i) => {
          cb.checked = i === index;
          cb.disabled = i < index;
        });

        localStorage.setItem(`estadoPedido_${pedidoId}`, checkbox.id);
        const id_status = statusMap[checkbox.id];

        fetch(`http://localhost:7000/api/orders/${pedidoId}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ id_status })
        })
        .then(res => {
          if (!res.ok) throw new Error("Error en la actualización");
          return res.json();
        })
        .then(data => {
          console.log("Estado actualizado:", data);

          if (checkbox.id === "Entregado") {
            etapas.forEach(cb => cb.disabled = true);
            
            modal.classList.remove("oculto");
          }
        })
        .catch(err => {
          console.error("Error al actualizar estado:", err);
          alert("Hubo un problema al actualizar el estado del pedido.");
        });
      } else {
        const estadoActual = localStorage.getItem(`estadoPedido_${pedidoId}`);
        if (estadoActual !== "Entregado") {
          etapas.forEach(cb => cb.disabled = false);
        }
      }
    });
  });

  // 🧹 Ocultar el modal al hacer clic en "Continuar"
  btnContinuar.addEventListener("click", () => {
  modal.classList.add("oculto");
  window.location.href = "../pages/index.html";
});
});