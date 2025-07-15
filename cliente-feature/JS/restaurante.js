// Script para cargar datos del restaurante dinámicamente
// Asume que tienes un array de restaurantes llamado 'restaurantes'
// y el ID del restaurante actual en 'restauranteId'

function cargarDatosRestaurante(restauranteId) {
    const restaurantes = JSON.parse(sessionStorage.getItem('restaurantes'));

    if (!restaurantes || restaurantes.length === 0) {
        console.error('No se encontraron restaurantes en sessionStorage');
        return;
    }

    const restaurante = restaurantes.find(r => r.id_restaurante === restauranteId);
    
    if (!restaurante) {
        console.error('Restaurante no encontrado');
        return;
    }

    actualizarInformacionRestaurante(restaurante);
    cargarMenuRestaurante(restauranteId); // si deseas cargar el menú automáticamente
}
function actualizarInformacionRestaurante(restaurante) {
    // Actualizar banner
    const banner = document.querySelector('.seccion-hero-restaurante-banner');
    if (banner && restaurante.banner_url) {
        banner.src = restaurante.banner_url;
        banner.alt = `Banner de ${restaurante.nombre_restaurante}`;
    }
    
    // Actualizar logo
    const logo = document.querySelector('.informacion-logo');
    if (logo && restaurante.logo_url) {
        logo.src = restaurante.logo_url;
        logo.alt = `Logo de ${restaurante.nombre_restaurante}`;
    }
    
    // Actualizar nombre del restaurante
    const nombreElement = document.querySelector('.informacion-nombre');
    if (nombreElement && restaurante.nombre_restaurante) {
        nombreElement.textContent = restaurante.nombre_restaurante;
    }
    
    // Actualizar teléfono
    const telefonoElement = document.querySelector('.informacion-detalle span b');
    if (telefonoElement && restaurante.telefono) {
        telefonoElement.textContent = restaurante.telefono;
    }
    
    // Actualizar horario
    const horarioElement = document.querySelectorAll('.informacion-detalle span b')[1];
    if (horarioElement && restaurante.horario_apertura && restaurante.horario_cierre) {
        const horarioTexto = formatearHorario(restaurante.horario_apertura, restaurante.horario_cierre);
        horarioElement.textContent = horarioTexto;
    }
    
    // Actualizar título de la página
    document.title = `${restaurante.nombre} - Menú`;
}

function formatearHorario(apertura, cierre) {
    // Función para formatear las horas desde el formato de la base de datos
    // Asumiendo que vienen en formato HH:mm:ss
    
    function formatearHora(timeString) {
        const time = new Date(`1970-01-01T${timeString}`);
        return time.toLocaleTimeString('es-MX', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    }
    
    const horaApertura = formatearHora(apertura);
    const horaCierre = formatearHora(cierre);
    
    return `${horaApertura} - ${horaCierre}`;
}

// Función para obtener el ID del restaurante desde la URL
function obtenerRestauranteIdDesdeURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(urlParams.get('id')) || null;
}

// Función para cargar el menú específico del restaurante (opcional)
function cargarMenuRestaurante(restauranteId) {
    // Aquí puedes hacer una llamada AJAX para obtener el menú específico
    // o filtrar productos desde un array global
    
    fetch(`/api/menu/${restauranteId}`)
        .then(response => response.json())
        .then(productos => {
            actualizarMenuHTML(productos);
        })
        .catch(error => {
            console.error('Error al cargar el menú:', error);
        });
}

function actualizarMenuHTML(productos) {
    const contenedorProductos = document.querySelector('.seccion-menu-productos');
    contenedorProductos.innerHTML = ''; // Limpiar productos existentes
    
    productos.forEach(producto => {
        const productoHTML = crearProductoHTML(producto);
        contenedorProductos.appendChild(productoHTML);
    });
}

function crearProductoHTML(producto) {
    const article = document.createElement('article');
    article.className = 'producto-contenedor';
    
    article.innerHTML = `
        <img src="${producto.imagen_url}" alt="${producto.nombre}" class="producto-contenedor-imagen">
        <div class="producto-contenedor-detalles">
            <h4 class="detalles-nombre">${producto.nombre}</h4>
            <p class="detalles-descripcion">${producto.descripcion}</p>
            <p class="detalles-precio">$${producto.precio}</p>
        </div>
        <button class="producto-contenedor-agregar" onclick="agregarAlCarrito(${producto.id})">
            <img src="../../Assets/agregarCarrito.png" alt="Agregar al carrito">
        </button>
    `;
    
    return article;
}

// Función para agregar productos al carrito
function agregarAlCarrito(productoId) {
    // Implementar lógica del carrito aquí
    console.log(`Producto ${productoId} agregado al carrito`);
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Obtener ID del restaurante desde la URL
    const restauranteId = obtenerRestauranteIdDesdeURL();
    
    if (restauranteId) {
        cargarDatosRestaurante(restauranteId);
    } else {
        console.error('No se encontró ID del restaurante en la URL');
        // Redirigir a la página principal o mostrar error
        window.location.href = '/index.html';
    }
});

