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
    actualizarModalRestaurante(restaurante); // Nueva función para actualizar el modal
    cargarProductosRestaurante(restauranteId)
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
        logo.alt = `Logo de ${restaurante.nombre}`;
    }
    
    // Actualizar nombre del restaurante
    const nombreElement = document.querySelector('.informacion-nombre');
    if (nombreElement && restaurante.nombre) {
        nombreElement.textContent = restaurante.nombre;
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
    document.title = `${restaurante.nombre_restaurante} - Menú`;
}

// Nueva función para actualizar el modal del restaurante
function actualizarModalRestaurante(restaurante) {
    // Actualizar logo del modal
    const logoModal = document.querySelector('.modal-logo-restaurante');
    if (logoModal && restaurante.logo_url) {
        logoModal.src = restaurante.logo_url;
        logoModal.alt = `Logo de ${restaurante.nombre_restaurante}`;
    }
    
    // Actualizar nombre del restaurante en el modal
    const nombreModal = document.querySelector('.modal-titulo');
    if (nombreModal && restaurante.nombre) {
        nombreModal.textContent = restaurante.nombre;
    }
    
    // Actualizar teléfono en el modal
    const telefonoModal = document.querySelector('.modal-info-detalle span');
    if (telefonoModal && restaurante.telefono) {
        telefonoModal.textContent = restaurante.telefono;
    }
    
    // Actualizar dirección en el modal
    const direccionModal = document.querySelectorAll('.modal-info-detalle span')[1];
    if (direccionModal && restaurante.direccion) {
        direccionModal.textContent = restaurante.direccion;
    }
    
    // Si también quieres mostrar el horario en el modal, puedes agregarlo
    // Primero necesitarías agregar un elemento en el HTML del modal para el horario
    const horarioModal = document.querySelector('.modal-horario'); // Elemento que deberías agregar al HTML
    if (horarioModal && restaurante.horario_apertura && restaurante.horario_cierre) {
        const horarioTexto = formatearHorario(restaurante.horario_apertura, restaurante.horario_cierre);
        horarioModal.textContent = horarioTexto;
    }
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



async function cargarProductosRestaurante(restauranteid) {
    try {
        
        
        const response = await fetch(`http://localhost:7000/products/${restauranteid}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Agregar headers de autenticación si es necesario
                // 'Authorization': 'Bearer ' + token
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const productos = await response.json();
        
        // Verificar si hay productos
        if (productos && productos.length > 0) {
            actualizarMenuHTML(productos);
            console.log(`Se cargaron ${productos.length} productos del restaurante`);
        } else {
            mostrarMensajeVacio();
        }
        
    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}




// Función para mostrar mensaje cuando no hay productos
function mostrarMensajeVacio() {
    const contenedorProductos = document.querySelector('.seccion-menu-productos');
    contenedorProductos.innerHTML = `
        <div class="mensaje-vacio" style="text-align: center; padding: 40px;">
            <h3>No hay productos disponibles</h3>
            <p>Este restaurante aún no tiene productos en su menú.</p>
        </div>
    `;
}

function actualizarMenuHTML(productos) {
    const contenedorProductos = document.querySelector('.seccion-menu-productos');
    contenedorProductos.innerHTML = ''; // Limpiar productos existentes

    productos.forEach(producto => {
        // Verificar que el producto esté activo (id_status = 1, asumiendo que 1 es activo)
            const productoHTML = crearProductoHTML(producto);
            contenedorProductos.appendChild(productoHTML);
    });
    
    // Reagregar los event listeners para los botones de agregar después de recrear el HTML
    reagregarEventListenersProductos();
}

function crearProductoHTML(producto) {
    const article = document.createElement('article');
    article.className = 'producto-contenedor';
    
    // Usar valores por defecto en caso de que algunos datos no estén disponibles
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
        <button class="producto-contenedor-agregar" data-producto-id="${producto.id_producto}" data-producto-nombre="${nombre}" data-producto-precio="${precio}">
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
            
            agregarAlCarrito({
                id: productoId,
                nombre: productoNombre,
                precio: productoPrecio
            });
            
            // Muestra la notificación
            modalAgregado.classList.remove('oculto');
            
            // Oculta la notificación después de 2.5 segundos
            setTimeout(() => {
                modalAgregado.classList.add('oculto');
            }, 2500);
        });
    });
}


function agregarAlCarrito(producto) {
    try {
        // Obtener carrito existente o crear uno nuevo
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        
        // Verificar si el producto ya existe en el carrito
        const productoExistente = carrito.find(item => item.id === producto.id);
        
        if (productoExistente) {
            // Si existe, incrementar la cantidad
            productoExistente.cantidad += 1;
        } else {
            // Si no existe, agregarlo con cantidad 1
            carrito.push({
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: 1
            });
        }
        
        // Guardar el carrito actualizado
        localStorage.setItem('carrito', JSON.stringify(carrito));
        
        // Actualizar contador del carrito si existe
        actualizarContadorCarrito();
        
        console.log(`Producto "${producto.nombre}" agregado al carrito`);
        
    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
    }
}

// Función para actualizar el contador del carrito
function actualizarContadorCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    
    // Buscar elemento del contador del carrito y actualizarlo
    const contadorCarrito = document.querySelector('.contador-carrito');
    if (contadorCarrito) {
        contadorCarrito.textContent = totalItems;
    }
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
    
    // Inicializar la lógica de modales
    inicializarModales();
});

// Función separada para inicializar todos los modales
function inicializarModales() {
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
        boton.addEventListener('click', (e) => {
            const productoId = e.currentTarget.dataset.productoId || 'default';
            agregarAlCarrito(productoId);
            
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
}