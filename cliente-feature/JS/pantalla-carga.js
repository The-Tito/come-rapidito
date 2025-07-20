const idStatus = id_status; // reemplaza esta línea según cómo recibas el status

let mensaje = "";

if (idStatus === 8) {
  mensaje = "Realizando tu pedido...";
} else if (idStatus === 5) {
  mensaje = "El repartidor ha cancelado<br>Tu pedido se está redirigiendo a otro repartidor";
}

document.getElementById("estado-pedido").innerHTML = mensaje;
