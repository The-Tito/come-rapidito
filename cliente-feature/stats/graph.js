let btnGraph = document.getElementById("btnGraph");


btnGraph.addEventListener("click", async () => {
  try {
    
    
    
    
    const response = await fetch("http://98.86.121.57:7000/stats/sum", {
      method: "GET",
      headers: {

        "Content-Type": "application/json",
      }
    });

    if (!response.ok) throw new Error("Error al obtener los datos");

    const datos = await response.json();
    console.log(datos);
    

    //const labels = datos.map(p => p.nombre);
    //const ventas = datos.map(p => p.totalVentas);

    // Crear la gráfica con los datos dinámicos
    const ctx = document.getElementById('myChart');

    new Chart(ctx, {
      type: 'polarArea',
      data: {
        labels: datos.labels,
        datasets: [{
          label: 'Productos más vendidos',
          data: datos.data,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true
      }
    });

  } catch (err) {
    console.error("💥 Error cargando gráfica:", err);
    alert("No se pudo cargar la gráfica");
  }
});

function volverAtras() {
    window.location.href = '../pages/index.html';
    localStorage.clear();
}