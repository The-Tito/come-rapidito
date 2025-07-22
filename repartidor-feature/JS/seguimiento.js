document.addEventListener("DOMContentLoaded", () => {
    const etapas = [
        document.getElementById("En preparación"),
        document.getElementById("En camino"),
        document.getElementById("Entregado")
    ];

    // Mapeo de estados
    const statusMap = {
        "En preparación": 1,
        "En camino": 3,
        "Entregado": 4
    };

    // Obtener el id del pedido y el estado actual del pedido desde localStorage
    const pedidoId = localStorage.getItem("pedido_id_seguimiento");
    let pedidoStatusActual = parseInt(localStorage.getItem("pedido_id_status"));

    console.log("🔍 Pedido ID:", pedidoId);
    console.log("🔍 Estado actual del pedido:", pedidoStatusActual);

    // Asegúrate de tener el id del pedido en localStorage
    if (!pedidoId) {
        console.error("❌ No se encontró el id_pedido en localStorage");
        alert("Error: No se puede acceder al seguimiento sin un pedido válido");
        window.location.href = "../pages/pedidos-activos.html";
        return;
    }

    // Si el pedido está "Entregado", deshabilitar todos los checkboxes
    if (pedidoStatusActual === 4) {
        etapas.forEach(checkbox => {
            checkbox.disabled = true;  // Desactivar todos los checkboxes si ya está entregado
            checkbox.checked = true;  // Marcar "Entregado" como checkeado
        });
    }

    // Configuración para la actualización periódica del estado del pedido
    setInterval(() => {
        fetch(`http://localhost:7000/api/users/${pedidoId}/orders/active`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
                'X-User-NAME': localStorage.getItem("nombre")
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("🔄 Estado actualizado:", data);
            // Actualizar estado según la respuesta del servidor, si se recibe un nuevo estado
            const currentStatus = data.status;
            localStorage.setItem("pedido_id_status", currentStatus);
            updateCheckboxes(currentStatus);
        })
        .catch(error => {
            console.error("💥 Error al obtener el estado del pedido:", error);
            // Verificar si el error es por no autorización (403)
            if (error.message.includes('403')) {
                alert("No autorizado. Verifica tu sesión.");
                window.location.href = "../../clientes-feature/pages/index.html";  // Redirigir a la página de login si es un error de autenticación
            } else {
                alert("Hubo un problema al actualizar el estado del pedido. Intenta de nuevo.");
            }
        });
    }, 5000); // Actualiza cada 5 segundos (ajustar según se necesite)

    // Función para actualizar los checkboxes con el estado actual
    function updateCheckboxes(status) {
        etapas.forEach(checkbox => {
            const statusId = statusMap[checkbox.id];
            if (statusId <= status) {
                checkbox.checked = true;
                checkbox.disabled = true;  // Desactivar checkbox una vez que se marca
            }
        });
    }

    // Evento para manejar el cambio de estado por medio de los checkboxes
    etapas.forEach(checkbox => {
        checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
                // Si el estado ya es "Entregado", no permitir cambiar a otro estado
                if (statusMap[checkbox.id] === 4) {
                    alert("El pedido ya ha sido entregado.");
                    checkbox.checked = false;  // Desmarcar el checkbox
                    return;
                }

                // Desactivar los checkboxes siguientes y marcarlos como checked
                etapas.forEach((cb, index) => {
                    if (index > etapas.indexOf(checkbox)) {
                        cb.disabled = true;
                        cb.checked = true;  // Marcar los checkboxes ya desactivados
                    }
                });

                // Enviar POST para actualizar el estado del pedido
                const estadoPedido = statusMap[checkbox.id];

                // Actualiza el estado en localStorage
                localStorage.setItem("pedido_id_status", estadoPedido); 

                fetch(`http://localhost:7000/api/orders/${pedidoId}/status`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem("token")}`,
                        'X-User-NAME': localStorage.getItem("nombre")
                    },
                    body: JSON.stringify({ id_status: estadoPedido })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Error HTTP: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("✔️ Estado actualizado correctamente:", data);
                })
                .catch(err => {
                    console.error("💥 Error al actualizar el estado del pedido:", err);
                    checkbox.checked = false;  // Desmarcar checkbox si hubo un error
                    etapas.forEach(cb => cb.disabled = false);  // Habilitar los checkboxes si hubo error
                });
            }
        });
    });
});
