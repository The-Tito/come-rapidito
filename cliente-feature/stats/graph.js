let btnGraph = document.getElementById("btnGraph");
const token = localStorage.getItem("token");

btnGraph.addEventListener("click", async () => {
  try {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("nombre");
    
    console.log(token);
    console.log(name);
    
    const response = await fetch("http://localhost:7000/stats/sum", {
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
