document.addEventListener("DOMContentLoaded", () => {
  const modalPedido = document.getElementById("modal-pedido");
  const btnRegresar = document.querySelector(".btn-regresar");
  const btnAceptar = document.querySelector(".btn-aceptar");

  const modalTarifa = document.getElementById("modal_tarifa");
  const btnRegresarTarifa = document.querySelector(".btn-regresar-tarifa");
  const btnAceptarTarifa = document.querySelector(".btn-aceptar-tarifa");

  const tarifaSelect = document.getElementById("tarifa");
  const errorMensaje = document.getElementById("tarifa-error");

  const modalConfirmacion = document.getElementById("modal-confirmacion");
  const tarifaConfirmadaTexto = document.getElementById("tarifa-confirmada");
  const btnContinuar = document.querySelector(".btn-continuar");

  console.log("modalPedido:", modalPedido);
  console.log("modalTarifa:", modalTarifa);

  // Mostrar modal de pedido
  document.querySelectorAll(".card-pedido").forEach(pedido => {
    pedido.addEventListener("click", () => {
      modalPedido.classList.remove("oculto");
    });
  });

  // Cerrar modal de pedido
  btnRegresar.addEventListener("click", () => {
    modalPedido.classList.add("oculto");
  });

  // Aceptar pedido y  mostrar modal de tarifa
  btnAceptar.addEventListener("click", () => {
    modalPedido.classList.add("oculto");
    modalTarifa.classList.remove("oculto");
  });

  // Cerrar modal de tarifa
  btnRegresarTarifa.addEventListener("click", () => {
    modalTarifa.classList.add("oculto");
  });

  // Validar selección de tarifa
btnAceptarTarifa.addEventListener("click", (event) => {
  if (tarifaSelect.value === "") {
    event.preventDefault();
    errorMensaje.classList.remove("oculto");
  } else {
    errorMensaje.classList.add("oculto");
    modalTarifa.classList.add("oculto");

    // Mostrar nuevo modal de confirmación
    tarifaConfirmadaTexto.textContent = `$${tarifaSelect.value}`;
    modalConfirmacion.classList.remove("oculto");
  }
});

// Acción para botón "Continuar"
btnContinuar.addEventListener("click", () => {
  window.location.href = "../pages/pedido-en-curso.html";
});

});