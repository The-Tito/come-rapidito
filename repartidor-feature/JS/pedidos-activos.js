document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal-pedido");
  const btnRegresar = document.querySelector(".btn-regresar");
  const btnAceptar = document.querySelector(".btn-aceptar");

  document.querySelectorAll(".card-pedido").forEach(pedido => {
    pedido.addEventListener("click", () => {
      modal.classList.remove("oculto");
    });
  });

  btnRegresar.addEventListener("click", () => {
    modal.classList.add("oculto");
  });

  btnAceptar.addEventListener("click", () => {
    modal.classList.add("oculto");
  });
});