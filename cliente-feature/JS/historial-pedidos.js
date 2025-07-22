document.addEventListener("DOMContentLoaded", async () => {
    const contenedorPedidos = document.querySelector(".cuadricula-pedidos");
    const nombre = localStorage.getItem("nombre")?.replace(/"/g, '');
    const token = localStorage.getItem("token")?.replace(/"/g, '');
    const id_usuario = localStorage.getItem("id_usuario"); // o el ID según tengas almacenado

    try {
        const response = await fetch(`http://localhost:7000/api/users/${id_usuario}/orders`, {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${token}`,
                "X-User-NAME": `${nombre}`,
                'Content-Type': 'application/json'
        }
    });
        if (!response.ok) throw new Error("Error al obtener el historial");

        const pedidos = await response.json();
        contenedorPedidos.innerHTML = ""; // limpia tarjetas dummy

        pedidos.forEach(pedido => {
            const fecha = new Date(pedido.fecha_pedido).toLocaleDateString(); // formato local
            const nombreRestaurante = pedido.restaurante.nombre_restaurante;
            const total = pedido.totalFinal.toFixed(2);
            const calificacion = pedido.puntuacion_pedido;

            const card = document.createElement("article");
            card.classList.add("tarjeta-pedido");
            card.addEventListener("click", () => {
    document.getElementById("modal-fecha").textContent = fecha;
    document.getElementById("modal-restaurante").textContent = nombreRestaurante;
    document.getElementById("modal-total").textContent = total;
    document.getElementById("modal-calificacion").textContent = calificacion;

    const listaProductos = document.getElementById("modal-productos");
    listaProductos.innerHTML = ""; // limpiar antes
    pedido.carrito.detalleCarrito.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.nombre} x${item.cantidad}`;
        listaProductos.appendChild(li);
    });

    document.getElementById("modal-pedido").style.display = "flex";
});
            card.innerHTML = `
                <p class="pedido-fecha">${fecha}</p>
                <div class="pedido-info">
                   
                    <h2 class="pedido-restaurante">${nombreRestaurante}</h2>
                </div>
                <div class="ver-productos">
                    <p>Click para ver pedido</p>
                </div>
                <p class="pedido-total">Total MX$${total}</p>
                <div class="pedido-calificacion">
                    <img src="../../Assets/estrella.png" alt="Ícono de estrella" class="estrella-icono">
                    <span>${calificacion}</span>
                </div>
            `;

            contenedorPedidos.appendChild(card);
        });

    } catch (error) {
        console.error("Error al obtener historial:", error);
    }
    
});
document.getElementById("cerrar-modal").addEventListener("click", () => {
    document.getElementById("modal-pedido").style.display = "none";
});
// Cierra el modal al hacer clic fuera del contenido
window.addEventListener("click", function(event) {
    const modal = document.getElementById("modal-pedido");
    const contenido = document.querySelector(".modal-contenido");

    if (event.target === modal) {
        modal.style.display = "none";
    }
});

