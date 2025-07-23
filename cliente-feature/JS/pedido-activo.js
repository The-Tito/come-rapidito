// Variable global para guardar la puntuación seleccionada
let puntuacionSeleccionada = 0;

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const idPedido = params.get("id");

    // Seleccionar elementos del DOM
    const contenedorOrderId = document.querySelector(".order-id");
    const contenedorStepper = document.querySelector(".stepper");
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
            let statusClass = pedido.id_status;

// Si el status es mayor o igual a 4 (excepto 8), lo tratamos como status-3 visualmente
if (pedido.id_status >= 4 && pedido.id_status !== 8) {
    statusClass = 3;
} else if (pedido.id_status === 8) {
    statusClass = "none"; // clase personalizada que no activa pasos
}

document.querySelector("main").className = `tracking-container${statusClass !== "none" ? ` status-${statusClass}` : ""}`;
            
            // Actualizar número de pedido
            contenedorOrderId.textContent = `Pedido #${pedido.id_pedido} realizado`;

            // Actualizar stepper visualmente
            // Actualizar stepper visualmente
const pasos = ["EN PREPARACIÓN", "EN CAMINO", "ENTREGADO"];
contenedorStepper.innerHTML = "";
pasos.forEach((paso, idx) => {
    const div = document.createElement("div");
    div.classList.add("step", `step-${idx + 1}`);

    // Solo marcar como activo si el status NO es 8
    if (pedido.id_status !== 8) {
        if ((pedido.id_status === 1 && idx === 0) ||
            (pedido.id_status === 2 && idx < 2) ||
            (pedido.id_status === 3 && idx < 3) ||
            (pedido.id_status === 4 && idx < 3)) {
            div.classList.add("activo");
        }
    }
    
    div.textContent = paso;
    contenedorStepper.appendChild(div);
});



            // Llenar detalles del pedido
            restaurantNameSpan.textContent = pedido.restaurante.nombre_restaurante;
            priceDetails.innerHTML = `
              <div class="price-item">
                <span>Subtotal</span>
                <span>$${pedido.carrito.total.toFixed(2) - 8}</span>
              </div>
              <div class="price-item">
                <span>Costo de envío</span>
                <span>$${pedido.tarifa.toFixed(2)}</span>
              </div>
              <div class="price-item">
                <span>Cuota de servicio</span>
                <span>$8.00</span>
              </div>
            `;
            const totalConTarifa = pedido.totalFinal + pedido.tarifa;
            priceTotal.textContent = `$${totalConTarifa.toFixed(2)}`;
            tiempoEspera.textContent = "20-30 minutos";
            const dir = pedido.direccion;
            direccionEntrega.textContent = `${dir.calle} ${dir.numero_casa}, ${dir.colonia}, CP ${dir.codigo_postal} - ${dir.referencia}`;

            // ---- LÓGICA DEL MODAL DE VALORACIÓN ----
            if (pedido.id_status === 4) {
                mostrarModalValoracion();
            }
        })
        .catch(err => {
            alert("Error al cargar pedido: " + err.message);
            console.error(err);
        });

    // --- MANEJO DE EVENTOS DEL MODAL ---
    const modalOverlay = document.getElementById('rating-modal-overlay');
    const mainContainer = document.querySelector('.main-container');
    const stars = document.querySelectorAll('.star');
    const closeModalBtn = document.getElementById('close-rating-modal');
    const submitBtn = document.getElementById('submit-rating-btn');

    function mostrarModalValoracion() {
        if (modalOverlay) modalOverlay.classList.add('visible');
        if (mainContainer) mainContainer.classList.add('blurred');
    }

    function cerrarModalValoracion() {
        if (modalOverlay) modalOverlay.classList.remove('visible');
        if (mainContainer) mainContainer.classList.remove('blurred');
        // Resetea las estrellas
        puntuacionSeleccionada = 0;
        actualizarEstrellasVisuales(0);
    }

    function actualizarEstrellasVisuales(valor) {
        stars.forEach(star => {
            star.classList.toggle('selected', star.dataset.value <= valor);
        });
    }

    // Eventos de las estrellas
    stars.forEach(star => {
        star.addEventListener('mouseover', () => {
            actualizarEstrellasVisuales(star.dataset.value);
        });
        star.addEventListener('mouseout', () => {
            actualizarEstrellasVisuales(puntuacionSeleccionada);
        });
        star.addEventListener('click', () => {
            puntuacionSeleccionada = star.dataset.value;
            actualizarEstrellasVisuales(puntuacionSeleccionada);
        });
    });

    // Eventos para cerrar el modal
    closeModalBtn.addEventListener('click', cerrarModalValoracion);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) { // Cierra si se hace clic en el fondo
            cerrarModalValoracion();
        }
    });

    // Evento para enviar la valoración
    submitBtn.addEventListener('click', () => {
        if (puntuacionSeleccionada === 0) {
            alert("Por favor, selecciona una puntuación antes de enviar.");
            return;
        }

        // Prepara los datos para enviar a la BD
        
        
        

       
    });
});