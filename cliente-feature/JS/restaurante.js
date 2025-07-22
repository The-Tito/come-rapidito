let currentRestauranteId = null; // Variable para almacenar el ID del restaurante
let todosLosProductos = []; // NUEVO: Variable para almacenar todos los productos del restaurante

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
    currentRestauranteId = restauranteId; 
    actualizarInformacionRestaurante(restaurante);
    actualizarModalRestaurante(restaurante); 
    cargarProductosRestaurante(restauranteId);
}

function actualizarInformacionRestaurante(restaurante) {
    const banner = document.querySelector('.seccion-hero-restaurante-banner');
    if (banner && restaurante.banner_url) {
        banner.src = restaurante.banner_url;
        banner.alt = `Banner de ${restaurante.nombre_restaurante}`;
    }
    const logo = document.querySelector('.informacion-logo');
    if (logo && restaurante.logo_url) {
        logo.src = restaurante.logo_url;
        logo.alt = `Logo de ${restaurante.nombre_restaurante}`;
    }
    const nombreElement = document.querySelector('.informacion-nombre');
    if (nombreElement && restaurante.nombre_restaurante) {
        nombreElement.textContent = restaurante.nombre_restaurante;
    }
    const telefonoElement = document.querySelector('.informacion-detalle span b');
    if (telefonoElement && restaurante.telefono) {
        telefonoElement.textContent = restaurante.telefono;
    }
    const horarioElement = document.querySelectorAll('.informacion-detalle span b')[1];
    if (horarioElement && restaurante.horario_apertura && restaurante.horario_cierre) {
        const horarioTexto = formatearHorario(restaurante.horario_apertura, restaurante.horario_cierre);
        horarioElement.textContent = horarioTexto;
    }
    document.title = `${restaurante.nombre_restaurante} - Menú`;
}

function actualizarModalRestaurante(restaurante) {
    const logoModal = document.querySelector('.modal-logo-restaurante');
    if (logoModal && restaurante.logo_url) {
        logoModal.src = restaurante.logo_url;
        logoModal.alt = `Logo de ${restaurante.nombre_restaurante}`;
    }
    const nombreModal = document.querySelector('.modal-titulo');
    if (nombreModal && restaurante.nombre_restaurante) {
        nombreModal.textContent = restaurante.nombre_restaurante;
    }
    const telefonoModal = document.querySelector('.modal-info-detalle span');
    if (telefonoModal && restaurante.telefono) {
        telefonoModal.textContent = restaurante.telefono;
    }
    const direccionModal = document.querySelectorAll('.modal-info-detalle span')[1];
    if (direccionModal && restaurante.direccion) {
        direccionModal.textContent = restaurante.direccion;
    }
    const horarioModal = document.querySelector('.modal-horario');
    if (horarioModal && restaurante.horario_apertura && restaurante.horario_cierre) {
        const horarioTexto = formatearHorario(restaurante.horario_apertura, restaurante.horario_cierre);
        horarioModal.textContent = horarioTexto;
    }
}

function formatearHorario(apertura, cierre) {
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

function obtenerRestauranteIdDesdeURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return parseInt(urlParams.get('id')) || null;
}

async function cargarProductosRestaurante(restauranteid) {
    try {
        const response = await fetch(`http://localhost:7000/products/${restauranteid}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const productos = await response.json();
        todosLosProductos = productos; // NUEVO: Guardamos la lista completa de productos
        
        if (productos && productos.length > 0) {
            actualizarMenuHTML(productos); // Mostramos todos los productos inicialmente
            console.log(`Se cargaron ${productos.length} productos del restaurante`);
        } else {
            mostrarMensajeVacio();
        }
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}

function mostrarMensajeVacio() {
    const contenedorProductos = document.querySelector('.seccion-menu-productos');
    contenedorProductos.innerHTML = `
        <div class="mensaje-vacio" style="text-align: center; padding: 40px;">
            <h3>No hay productos disponibles</h3>
            <p>Este restaurante aún no tiene productos en su menú.</p>
        </div>
    `;
}

// ACTUALIZADO: Para manejar listas de productos filtrados vacías
function actualizarMenuHTML(productos) {
    const contenedorProductos = document.querySelector('.seccion-menu-productos');
    contenedorProductos.innerHTML = ''; // Limpiar productos existentes

    if (!productos || productos.length === 0) {
        contenedorProductos.innerHTML = `
            <div class="mensaje-vacio" style="text-align: center; padding: 40px;">
                <h3>No hay productos en esta categoría</h3>
                <p>Prueba seleccionando otra categoría.</p>
            </div>
        `;
        return;
    }

    productos.forEach(producto => {
        const productoHTML = crearProductoHTML(producto);
        contenedorProductos.appendChild(productoHTML);
    });
    
    reagregarEventListenersProductos();
}

function crearProductoHTML(producto) {
    const article = document.createElement('article');
    article.className = 'producto-contenedor';
    const nombre = producto.nombre || 'Producto sin nombre';
    const descripcion = producto.descripcion || 'Sin descripción';
    const precio = producto.precio || 0;
    const imagen = producto.url_imagen || '../../Assets/pizzaPepperoni.png';
    
    article.innerHTML = `
        <img src="${imagen}" alt="${nombre}" class="producto-contenedor-imagen" onerror="this.src='../../Assets/pizzaPepperoni.png'">
        <div class="producto-contenedor-detalles">
            <h4 class="detalles-nombre">${nombre}</h4>
            <p class="detalles-descripcion">${descripcion}</p>
            <p class="detalles-precio">$${precio.toFixed(2)}</p>
        </div>
        <button class="producto-contenedor-agregar" 
                data-producto-id="${producto.id_producto}" 
                data-producto-nombre="${nombre}" 
                data-producto-precio="${precio}"
                data-producto-url-imagen="${imagen}">
            <img src="../../Assets/agregarCarrito.png" alt="Agregar al carrito">
        </button>
    `;
    return article;
}

function reagregarEventListenersProductos() {
    const botonesAgregar = document.querySelectorAll('.producto-contenedor-agregar');
    const modalAgregado = document.getElementById('modal-agregado');
    
    botonesAgregar.forEach(boton => {
        boton.addEventListener('click', (e) => {
            const productoId = e.currentTarget.dataset.productoId;
            const productoNombre = e.currentTarget.dataset.productoNombre;
            const productoPrecio = parseFloat(e.currentTarget.dataset.productoPrecio);
            const url_imagen = e.currentTarget.dataset.productoUrlImagen;
            
            agregarAlCarrito({
                id: productoId,
                nombre: productoNombre,
                precio: productoPrecio,
                id_restaurante: currentRestauranteId,
                url_imagen: url_imagen
            });
            
            modalAgregado.classList.remove('oculto');
            setTimeout(() => {
                modalAgregado.classList.add('oculto');
            }, 2500);
        });
    });
}

function agregarAlCarrito(producto) {
    try {
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        const productoExistente = carrito.find(item => item.id === producto.id);
        
        if (productoExistente) {
            productoExistente.cantidad += 1;
        } else {
            carrito.push({ ...producto, cantidad: 1 });
        }
        
        localStorage.setItem('carrito', JSON.stringify(carrito));
        actualizarContadorCarrito();
    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
    }
}

function actualizarContadorCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    const contadorCarrito = document.querySelector('.contador-carrito');
    if (contadorCarrito) {
        contadorCarrito.textContent = totalItems;
    }
}

// NUEVA FUNCIÓN: Para configurar los botones de filtro de categoría
function inicializarFiltros() {
    const categoriasBotones = document.querySelectorAll('.categoria-item');

    categoriasBotones.forEach(boton => {
        boton.addEventListener('click', () => {
            // Manejar la clase 'active' para feedback visual
            categoriasBotones.forEach(btn => btn.classList.remove('active'));
            boton.classList.add('active');

            const categoriaId = parseInt(boton.dataset.categoryId, 10);
            
            let productosFiltrados;

            if (categoriaId === 0) { // 0 es para "Todo"
                productosFiltrados = todosLosProductos;
            } else {
                productosFiltrados = todosLosProductos.filter(producto => producto.id_categoria === categoriaId);
            }
            
            actualizarMenuHTML(productosFiltrados);
        });
    });
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    const restauranteId = obtenerRestauranteIdDesdeURL();
    
    if (restauranteId) {
        cargarDatosRestaurante(restauranteId);
    } else {
        console.error('No se encontró ID del restaurante en la URL');
    }
    
    inicializarModales();
    inicializarFiltros(); // NUEVO: Llamamos a la función para activar los filtros
});

// Función separada para inicializar todos los modales (sin cambios)
function inicializarModales() {
    const mainContainer = document.getElementById('main-container');
    const bannerRestaurante = document.getElementById('banner-restaurante');
    const modalInfo = document.getElementById('modal-info-restaurante');
    const btnCerrarInfo = document.getElementById('cerrar-modal-info');
    const modalAgregado = document.getElementById('modal-agregado');
    const linksConfirmar = document.querySelectorAll('.nav-link-confirm');
    const modalConfirmar = document.getElementById('modal-confirmar-salida');
    const btnSalir = document.getElementById('btn-salir');
    const btnContinuar = document.getElementById('btn-continuar');
    let urlParaRedirigir = null;

    function mostrarModal(modal) {
        modal.classList.remove('oculto');
        if(mainContainer) mainContainer.classList.add('blur-effect');
    }

    function ocultarModal(modal) {
        modal.classList.add('oculto');
        if(mainContainer) mainContainer.classList.remove('blur-effect');
    }

    if(bannerRestaurante) bannerRestaurante.addEventListener('click', () => mostrarModal(modalInfo));
    if(btnCerrarInfo) btnCerrarInfo.addEventListener('click', () => ocultarModal(modalInfo));
    if(modalInfo) modalInfo.addEventListener('click', (e) => { if (e.target === modalInfo) ocultarModal(modalInfo); });

    linksConfirmar.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); 
            urlParaRedirigir = e.currentTarget.href; 
            mostrarModal(modalConfirmar);
        });
    });

    if(btnSalir) btnSalir.addEventListener('click', () => {
        if (urlParaRedirigir) {
            window.location.href = urlParaRedirigir;
            localStorage.removeItem("carrito");
        }
    });
    
    if(btnContinuar) btnContinuar.addEventListener('click', () => ocultarModal(modalConfirmar));
    if(modalConfirmar) modalConfirmar.addEventListener('click', (e) => { if (e.target === modalConfirmar) ocultarModal(modalConfirmar); });
}