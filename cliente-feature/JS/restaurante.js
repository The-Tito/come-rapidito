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


document.addEventListener('DOMContentLoaded', () => {
     const mainContainer = document.getElementById('main-container');

    // Modal 1: Info Restaurante
    const bannerRestaurante = document.getElementById('banner-restaurante');
    const modalInfo = document.getElementById('modal-info-restaurante');
    const btnCerrarInfo = document.getElementById('cerrar-modal-info');

    // Modal 2: Notificación Producto Agregado
    const botonesAgregar = document.querySelectorAll('.producto-contenedor-agregar');
    const modalAgregado = document.getElementById('modal-agregado');

    // Modal 3: Confirmación de Salida
    const linksConfirmar = document.querySelectorAll('.nav-link-confirm');
    const modalConfirmar = document.getElementById('modal-confirmar-salida');
    const btnSalir = document.getElementById('btn-salir');
    const btnContinuar = document.getElementById('btn-continuar');

    let urlParaRedirigir = null; // Variable para guardar la URL del enlace

    // ===== FUNCIONES GENERALES PARA MODALES =====
    
    // Muestra un modal y aplica el efecto blur
    function mostrarModal(modal) {
        modal.classList.remove('oculto');
        mainContainer.classList.add('blur-effect');
    }

    // Oculta un modal y quita el efecto blur
    function ocultarModal(modal) {
        modal.classList.add('oculto');
        mainContainer.classList.remove('blur-effect');
    }

    // ===== LÓGICA PARA MODAL 1: INFO RESTAURANTE =====
    
    // Abrir modal de info al hacer clic en el banner
    bannerRestaurante.addEventListener('click', () => {
        mostrarModal(modalInfo);
    });

    // Cerrar modal de info con el botón 'X'
    btnCerrarInfo.addEventListener('click', () => {
        ocultarModal(modalInfo);
    });
    
    // Cerrar modal de info al hacer clic fuera del contenido
    modalInfo.addEventListener('click', (e) => {
        if (e.target === modalInfo) {
            ocultarModal(modalInfo);
        }
    });


    // ===== LÓGICA PARA MODAL 2: NOTIFICACIÓN PRODUCTO AGREGADO =====
    
    botonesAgregar.forEach(boton => {
        boton.addEventListener('click', () => {
            // Muestra la notificación
            modalAgregado.classList.remove('oculto');
            
            // Oculta la notificación después de 2.5 segundos
            setTimeout(() => {
                modalAgregado.classList.add('oculto');
            }, 2500);
        });
    });

    
    // ===== LÓGICA PARA MODAL 3: CONFIRMACIÓN DE SALIDA =====

    // Abrir modal de confirmación al hacer clic en un enlace de navegación
    linksConfirmar.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Previene la navegación inmediata
            urlParaRedirigir = e.currentTarget.href; // Guarda la URL del enlace
            mostrarModal(modalConfirmar);
        });
    });

    // Acción del botón "Salir": redirige a la URL guardada
    btnSalir.addEventListener('click', () => {
        if (urlParaRedirigir) {
            window.location.href = urlParaRedirigir;
        }
    });
    
    // Acción del botón "Continuar aquí": simplemente cierra el modal
    btnContinuar.addEventListener('click', () => {
        ocultarModal(modalConfirmar);
    });
    
    // Cerrar modal de confirmación al hacer clic fuera del contenido
    modalConfirmar.addEventListener('click', (e) => {
        if (e.target === modalConfirmar) {
            ocultarModal(modalConfirmar);
        }
    });

})


