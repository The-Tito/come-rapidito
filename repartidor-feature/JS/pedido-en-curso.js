document.addEventListener("DOMContentLoaded", () => {
  const pedidoGuardado = localStorage.getItem("pedido_en_curso");

  if (!pedidoGuardado) {
    console.error("No hay datos del pedido en curso.");
    return;
  }

  const pedido = JSON.parse(pedidoGuardado);

  // Inserta datos en el HTML
  document.querySelector(".restaurante-nombre").textContent = pedido.restaurante.nombre_restaurante;
  document.querySelector(".restaurante-direccion").textContent = pedido.restaurante.direccion;
  document.querySelector(".nombre_cliente").textContent = pedido.nombre;
  document.querySelector(".cliente-telefono").textContent = `Teléfono: ${pedido.numero_telefono}`;
  document.querySelector(".cliente-direccion").textContent =
    `Dirección: ${pedido.direccion.calle}, ${pedido.direccion.colonia}, ${pedido.direccion.numero_casa}, CP ${pedido.direccion.codigo_postal}. Ref: ${pedido.direccion.referencia}`;
  document.querySelector(".cliente-subtotal").textContent = `Subtotal: $${pedido.total.toFixed(2)}`;

  // ✅ Cambiar logo del restaurante dinámicamente
  const logoImg = document.querySelector(".logo_restaurante");
  if (logoImg && pedido.restaurante.logo_url) {
    logoImg.src = pedido.restaurante.logo_url;
  }
});
    