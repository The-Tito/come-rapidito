document.addEventListener("DOMContentLoaded", () => {
    const idPedido = localStorage.getItem("id_pedido"); // Asegúrate que guardas esto al confirmar el pedido
    const token = localStorage.getItem("token")?.replace(/"/g, '');
    const nombre = localStorage.getItem("nombre")?.replace(/"/g, '');
    const API_BASE_URL = 'http://98.86.121.57:7000/api';

    async function verificarTarifaAsignada() {
        
        try {
            const response = await fetch(`${API_BASE_URL}/users/${idPedido}/orders/actual`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "X-User-NAME": `${nombre}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                
                // Si la tarifa ya fue asignada y es distinta de 0
                if (data.tarifa && data.tarifa !== 0) {
                    clearInterval(intervaloVerificacion);
                    sessionStorage.setItem("tarifa", data.tarifa);
                    sessionStorage.setItem("totalFinal", data.totalFinal)
                    sessionStorage.setItem("id_pedido", idPedido); 
                    sessionStorage.setItem("desdePantallaCarga", "1");
                    window.location.href = `/cliente-feature/pages/pedidos-sesion.html?id=${idPedido}`;
                }
            } else {
                console.error("No se pudo obtener el pedido");
            }
        } catch (error) {
            console.error("Error al consultar el pedido:", error);
        }
    }

    // Verificamos cada 3 segundos si ya hay tarifa
    const intervaloVerificacion = setInterval(verificarTarifaAsignada, 3000);
});
