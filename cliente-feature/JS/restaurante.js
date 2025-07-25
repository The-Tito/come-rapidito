// Variable para almacenar el ID del restaurante actual
let currentRestauranteId = null;
// Variable para almacenar todos los productos del restaurante para poder filtrar
let todosLosProductos = [];

/**
 * Función principal que se ejecuta al cargar la página.
 */
document.addEventListener('DOMContentLoaded', function() {
    const restauranteId = obtenerRestauranteIdDesdeURL();
    
    if (restauranteId) {
        cargarDatosRestaurante(restauranteId);
    } else {
        console.error('No se encontró ID del restaurante en la URL');
        // Opcional: Redirigir o mostrar un mensaje de error en la página
    }
    
    inicializarModales();
    inicializarFiltros();
});

/**
 * Obtiene el ID del restaurante desde el parámetro 'id' en la URL.
 */
function obtenerRestauranteIdDesdeURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(urlParams.get('id'), 10) || null;
}

/**
 * Carga los datos del restaurante (info y productos).
 */
function cargarDatosRestaurante(restauranteId) {
    const restaurantes = JSON.parse(sessionStorage.getItem('restaurantes'));
    if (!restaurantes) return console.error('No hay datos de restaurantes en sessionStorage.');

    const restaurante = restaurantes.find(r => r.id_restaurante === restauranteId);
    if (!restaurante) return console.error('Restaurante no encontrado.');

    currentRestauranteId = restauranteId;
    actualizarInformacionRestaurante(restaurante);
    cargarProductosRestaurante(restauranteId);
}

/**
 * Actualiza la información visible del restaurante en la página (banner, logo, nombre, etc.).
 */
function actualizarInformacionRestaurante(restaurante) {
    document.title = `${restaurante.nombre_restaurante || 'Menú'} - Come Rapidito`;

    // Actualizar elementos de la página principal
    const banner = document.querySelector('.seccion-hero-restaurante-banner');
    if (banner) banner.src = restaurante.banner_url || '';

    const logo = document.querySelector('.informacion-logo');
    if (logo) logo.src = restaurante.logo_url || '';

    const nombre = document.querySelector('.informacion-nombre');
    if (nombre) nombre.textContent = restaurante.nombre_restaurante || 'Nombre no disponible';

    const telefono = document.querySelector('.informacion-detalle span b');
    if (telefono) telefono.textContent = restaurante.telefono || 'N/A';

    const horarioElement = document.querySelectorAll('.informacion-detalle span b')[1];
    if (horarioElement && restaurante.horario_apertura && restaurante.horario_cierre) {
        horarioElement.textContent = formatearHorario(restaurante.horario_apertura, restaurante.horario_cierre);
    }
    
    // Actualizar elementos del modal de información
    const logoModal = document.querySelector('.modal-logo-restaurante');
    if (logoModal) logoModal.src = restaurante.logo_url || '';

    const nombreModal = document.querySelector('.modal-titulo');
    if (nombreModal) nombreModal.textContent = restaurante.nombre_restaurante || '';
    
    // ... (puedes continuar actualizando los demás campos del modal si es necesario)
}

/**
 * Carga los productos del restaurante desde la API.
 */
async function cargarProductosRestaurante(restauranteId) {
    try {
        const response = await fetch(`http://98.86.121.57:7000/products/${restauranteId}`);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        
        const productos = await response.json();
        todosLosProductos = productos; // Guarda todos los productos en la variable global
        
        if (productos && productos.length > 0) {
            actualizarMenuHTML(productos); // Muestra todos los productos inicialmente
        } else {
            mostrarMensajeVacio('Este restaurante aún no tiene productos en su menú.');
        }
    } catch (error) {
        console.error('Error al cargar productos:', error);
        mostrarMensajeVacio('No se pudieron cargar los productos. Intenta de nuevo más tarde.');
    }
}

/**
 * Muestra un mensaje en la sección de productos cuando no hay nada que mostrar.
 */
function mostrarMensajeVacio(mensaje) {
    const contenedorProductos = document.querySelector('.seccion-menu-productos');
    if (!contenedorProductos) return;
    contenedorProductos.innerHTML = `
        <div class="mensaje-vacio" style="text-align: center; padding: 40px;">
            <h3>Lo sentimos</h3>
            <p>${mensaje}</p>
        </div>`;
}

/**
 * Actualiza el DOM con la lista de productos proporcionada.
 */
function actualizarMenuHTML(productos) {
    const contenedorProductos = document.querySelector('.seccion-menu-productos');
    if (!contenedorProductos) return;
    
    contenedorProductos.innerHTML = ''; // Limpia el contenedor

    if (!productos || productos.length === 0) {
        mostrarMensajeVacio('No hay productos en esta categoría.');
        return;
    }

    productos.forEach(producto => {
        const productoHTML = crearProductoHTML(producto);
        contenedorProductos.appendChild(productoHTML);
    });
    
    reagregarEventListenersProductos();
}

/**
 * Crea el elemento HTML para un solo producto.
 */
function crearProductoHTML(producto) {
    const article = document.createElement('article');
    article.className = 'producto-contenedor';
    
    const { id_producto, nombre, descripcion, precio, url_imagen } = producto;
    const imagenSegura = url_imagen || '/Assets/pizzaPepperoni.png'; // Imagen por defecto

    article.innerHTML = `
        <img src="${imagenSegura}" alt="${nombre}" class="producto-contenedor-imagen" onerror="this.src='/Assets/pizzaPepperoni.png'">
        <div class="producto-contenedor-detalles">
            <h4 class="detalles-nombre">${nombre || 'Producto'}</h4>
            <p class="detalles-descripcion">${descripcion || ''}</p>
            <p class="detalles-precio">$${(precio || 0).toFixed(2)}</p>
        </div>
        <button class="producto-contenedor-agregar" 
                data-producto-id="${id_producto}" 
                data-producto-nombre="${nombre}" 
                data-producto-precio="${precio}"
                data-producto-url-imagen="${imagenSegura}">
            <img src="/Assets/agregarCarrito.png" alt="Agregar al carrito">
        </button>`;
    return article;
}

/**
 * Inicializa los listeners para los botones de "Agregar al carrito" y el modal de confirmación.
 */
function reagregarEventListenersProductos() {
    const botonesAgregar = document.querySelectorAll('.producto-contenedor-agregar');
    const modalAgregado = document.getElementById('modal-agregado');
    
    botonesAgregar.forEach(boton => {
        boton.addEventListener('click', (e) => {
            const productoData = e.currentTarget.dataset;
            
            agregarAlCarrito({
                id: productoData.productoId,
                nombre: productoData.productoNombre,
                precio: parseFloat(productoData.productoPrecio),
                url_imagen: productoData.productoUrlImagen,
                id_restaurante: currentRestauranteId, 
            });
            
            if (modalAgregado) {
                modalAgregado.classList.remove('oculto');
                setTimeout(() => modalAgregado.classList.add('oculto'), 2000);
            }
        });
    });
}

/**
 * Lógica para agregar un producto al carrito en localStorage.
 */
function agregarAlCarrito(producto) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    // IMPORTANTE: Lógica para manejar el cambio de restaurante
    if (carrito.length > 0 && carrito[0].id_restaurante !== producto.id_restaurante) {
        // Si el producto es de un restaurante diferente, se vacía el carrito.
        // Podrías mostrar una advertencia aquí si quisieras.
        carrito = []; 
    }

    const productoExistente = carrito.find(item => item.id === producto.id);
    
    if (productoExistente) {
        productoExistente.cantidad += 1;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }
    
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

/**
 * Inicializa los botones de filtro de categorías.
 */
function inicializarFiltros() {
    const categoriasBotones = document.querySelectorAll('.categoria-item');

    categoriasBotones.forEach(boton => {
        boton.addEventListener('click', () => {
            categoriasBotones.forEach(btn => btn.classList.remove('active'));
            boton.classList.add('active');

            const categoriaId = parseInt(boton.dataset.categoryId, 10);
            
            const productosFiltrados = (categoriaId === 0)
                ? todosLosProductos // Si es "Todo", muestra todos los productos
                : todosLosProductos.filter(p => p.id_categoria === categoriaId);
            
            actualizarMenuHTML(productosFiltrados);
        });
    });
}

/**
 * Inicializa toda la lógica de los modales (info y confirmación de salida).
 */
function inicializarModales() {
    const mainContainer = document.getElementById('main-container');
    const modalConfirmar = document.getElementById('modal-confirmar-salida');
    const btnSalir = document.getElementById('btn-salir');
    const btnContinuar = document.getElementById('btn-continuar');
    let urlParaRedirigir = null;

    const mostrarModal = (modal) => {
    if (!modal) return;
    modal.classList.remove('oculto');
    modal.classList.add('visible'); // Añade esta línea
    if (mainContainer) mainContainer.classList.add('blur-effect');
};

    const ocultarModal = (modal) => {
    if (!modal) return;
    modal.classList.remove('visible'); // Añade esta línea
    modal.classList.add('oculto');
    if (mainContainer) mainContainer.classList.remove('blur-effect');
};
    
    // Lógica para el modal de confirmación de salida
    const linksDeNavegacion = document.querySelectorAll(
        '.encabezado-logo, .encabezado-enlace, .encabezado-iconos > a:not([href*="carrito"]), .dropdown-content a:not([id="cerrar-sesion"])'
    );

    linksDeNavegacion.forEach(link => {
        link.addEventListener('click', (e) => {
            const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
            
            // Muestra el modal solo si el carrito tiene productos
            if (carrito.length > 0) {
                e.preventDefault();
                urlParaRedirigir = e.currentTarget.href;
                mostrarModal(modalConfirmar);
            }
        });
    });

    if (btnSalir) {
        btnSalir.addEventListener('click', () => {
            if (urlParaRedirigir) {
                localStorage.removeItem("carrito"); // Vacía el carrito
                window.location.href = urlParaRedirigir; // Y luego redirige
            }
        });
    }
    
    if (btnContinuar) {
        btnContinuar.addEventListener('click', () => {
            ocultarModal(modalConfirmar);
            urlParaRedirigir = null;
        });
    }
    
    if (modalConfirmar) {
        modalConfirmar.addEventListener('click', (e) => {
            if (e.target === modalConfirmar) {
                ocultarModal(modalConfirmar);
                urlParaRedirigir = null;
            }
        });
    }
}

// Función auxiliar para formatear el horario
function formatearHorario(apertura, cierre) {
    const formatear = (timeString) => new Date(`1970-01-01T${timeString}`).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${formatear(apertura)} - ${formatear(cierre)}`;
}