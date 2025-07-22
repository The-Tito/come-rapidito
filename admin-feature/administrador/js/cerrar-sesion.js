const btnCerrarSesion = document.getElementById("cerrar-sesion")
btnCerrarSesion.addEventListener("click", ()=>{
  localStorage.clear();
})