    // Simula el estado recibido (lo reemplazarás con fetch más adelante)
    const idStatus = 5; // puedes probar con 8 o cualquier otro

    let mensaje = "Realizando tu pedido...";

    if (idStatus === 5) {
      mensaje = "El repartidor ha cancelado<br>Tu pedido se está redirigiendo a otro repartidor";
    } else if (idStatus === 8) {
      mensaje = "El restaurante ha cancelado tu pedido";
    }

    document.getElementById("estado-pedido").innerHTML = mensaje;