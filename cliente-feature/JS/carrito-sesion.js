
// Configuración de la API
const API_BASE_URL = 'http://localhost:7000/api'; // Ajusta según tu configuración

// Estado del carrito
let carritoProductos = [];
let direccionesUsuario = [];
let direccionSeleccionada = null;

let nombrestorage = localStorage.getItem("nombre")
let nombre = nombrestorage.replace(/"/g, '');
let tokenstorage = localStorage.getItem("token")
let token = tokenstorage.replace(/"/g, '');
// Elementos del DOM
const carritoVacio = document.getElementById('carrito-vacio');
const carritoLleno = document.getElementById('carrito-lleno');
const listaProductos = document.getElementById('lista-productos');
const subtotalValor = document.getElementById('subtotal-valor');
const totalValor = document.getElementById('total-valor');
const botonEncontrarProductos = document.getElementById('boton-encontrar-productos');
const seccionDireccion = document.getElementById('direccion-entrega');
const modalDireccion = document.getElementById('modal-direccion');
const formularioDireccion = document.getElementById('formulario-direccion');
const botonRegresarCarrito = document.getElementById('boton-regresar-carrito');
const botonConfirmarPedido = document.getElementById('boton-confirmar-pedido');
const avisoFormulario = document.getElementById('aviso-formulario');

// Constantes
const CUOTA_SERVICIO = 8;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    verificarAutenticacion();
    cargarCarritoDesdeStorage();
    cargarDireccionesUsuario();
    actualizarVistaCarrito();
    configurarEventListeners();
});

// Verificar si el usuario está autenticado
function verificarAutenticacion() {
    const token = localStorage.getItem('token');
    if (!token) {
        // Redirigir al login si no hay token
        window.location.href = '../pages/index.html';
        return false;
    }
    return true;
}

// Obtener datos del usuario desde localStorage
function obtenerDatosUsuario() {
    return {
        id_usuario: localStorage.getItem('id_usuario'),
        token: token
    };
}

// Configurar event listeners
function configurarEventListeners() {
    botonEncontrarProductos.addEventListener('click', () => {
        window.location.href = '../pages/sesion-iniciada.html';
    });

    seccionDireccion.addEventListener('click', () => {
        if (verificarAutenticacion()) {
            mostrarModalDireccion();
        }
    });

    botonRegresarCarrito.addEventListener('click', cerrarModalDireccion);

    formularioDireccion.addEventListener('submit', manejarEnvioDireccion);

    botonConfirmarPedido.addEventListener('click', confirmarPedido);

    // Cerrar modal al hacer clic fuera
    modalDireccion.addEventListener('click', (e) => {
        if (e.target === modalDireccion) {
            cerrarModalDireccion();
        }
    });
}

// Cargar carrito desde localStorage
function cargarCarritoDesdeStorage() {
    const carritoGuardado = localStorage.getItem('carrito');
    console.log("carrito",carritoGuardado)
    if (carritoGuardado) {
        try {
            carritoProductos = JSON.parse(carritoGuardado);
        } catch (error) {
            console.error('Error al cargar carrito:', error);
            carritoProductos = [];
        }
    }
}

// Guardar carrito en localStorage
function guardarCarritoEnStorage() {
    localStorage.setItem('carrito', JSON.stringify(carritoProductos));
}

// Cargar direcciones del usuario
async function cargarDireccionesUsuario() {
    const { id_usuario, token } = obtenerDatosUsuario();
    if (!id_usuario || !token) return;

    try {
        const response = await fetch(`${API_BASE_URL}/address/${id_usuario}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "X-User-NAME": `${nombre}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            direccionesUsuario = await response.json();
            console.log(direccionesUsuario)
            actualizarSeccionDireccion();
        }
    } catch (error) {
        console.error('Error al cargar direcciones:', error);
    }
}

// Actualizar sección de dirección
function actualizarSeccionDireccion() {
    const infoDireccion = seccionDireccion.querySelector('.info-direccion p');
    
    if (direccionSeleccionada) {
        infoDireccion.textContent = `${direccionSeleccionada.calle}, ${direccionSeleccionada.colonia}`;
    } else if (direccionesUsuario.length > 0) {
        direccionSeleccionada = direccionesUsuario[0];
        infoDireccion.textContent = `${direccionSeleccionada.calle}, ${direccionSeleccionada.colonia}`;
    } else {
        infoDireccion.textContent = 'Agrega tu dirección';
    }
}

// Actualizar vista del carrito
function actualizarVistaCarrito() {
    if (carritoProductos.length === 0) {
        carritoVacio.classList.remove('oculto');
        carritoVacio.classList.add('visible');
        carritoLleno.classList.add('oculto');
    } else {
        carritoVacio.classList.add('oculto');
        carritoVacio.classList.remove('visible');
        carritoLleno.classList.remove('oculto');
        renderizarProductos();
        actualizarTotales();
    }
}

// Renderizar productos en el carrito
function renderizarProductos() {
    listaProductos.innerHTML = '';
    
    carritoProductos.forEach((item, index) => {
        const productoElement = crearElementoProducto(item, index);
        listaProductos.appendChild(productoElement);
    });
}

// Crear elemento HTML para un producto
function crearElementoProducto(item, index) {
    console.log(item.url_imagen)
    console.log(item)
    const div = document.createElement('div');
    div.className = 'producto-item';
    
    div.innerHTML = `
        <img src="${item.url_imagen}" alt="${item.nombre}" class="producto-imagen">
        <div class="producto-info">
            <h3>${item.nombre}</h3>
            <p>${item.descripcion}</p>
        </div>
        <div class="producto-precio">$${(item.precio * item.cantidad).toFixed(2)}</div>
        <div class="producto-controles">
            <button onclick="cambiarCantidad(${index}, -1)" ${item.cantidad <= 1 ? 'disabled' : ''}>-</button>
            <span>${item.cantidad}</span>
            <button onclick="cambiarCantidad(${index}, 1)">+</button>
        </div>
        <button class="boton-eliminar" onclick="eliminarProducto(${index})">
            <img src="../../Assets/eliminar.png" alt="Eliminar">
        </button>
    `;
    
    return div;
}

// Cambiar cantidad de un producto
function cambiarCantidad(index, cambio) {
    if (index >= 0 && index < carritoProductos.length) {
        carritoProductos[index].cantidad += cambio;
        
        if (carritoProductos[index].cantidad <= 0) {
            eliminarProducto(index);
        } else {
            guardarCarritoEnStorage();
            actualizarVistaCarrito();
        }
    }
}

// Eliminar producto del carrito
function eliminarProducto(index) {
    if (index >= 0 && index < carritoProductos.length) {
        carritoProductos.splice(index, 1);
        guardarCarritoEnStorage();
        actualizarVistaCarrito();
    }
}

// Actualizar totales
function actualizarTotales() {
    const subtotal = carritoProductos.reduce((total, item) => {
        return total + (item.precio * item.cantidad);
    }, 0);
    
    const total = subtotal + CUOTA_SERVICIO;
    
    subtotalValor.textContent = `$${subtotal.toFixed(2)}`;
    totalValor.textContent = `$${total.toFixed(2)}`;
}

// Mostrar modal de dirección
function mostrarModalDireccion() {
    modalDireccion.classList.remove('oculto');
    
    // Si hay direcciones, mostrar selector en lugar del formulario
    if (direccionesUsuario.length > 0) {
        mostrarSelectorDirecciones();
    }
}

// Mostrar selector de direcciones existentes
function mostrarSelectorDirecciones() {
    const modalContent = modalDireccion.querySelector('.modal-contenido');
    const formularioContainer = modalContent.querySelector('.formulario-direccion');
    
    // Crear selector de direcciones
    let selectorHTML = `
        <div class="selector-direcciones">
            <h3>Selecciona una dirección:</h3>
            <div class="lista-direcciones">
    `;
    
    direccionesUsuario.forEach((direccion, index) => {
        selectorHTML += `
            <div class="direccion-opcion ${direccionSeleccionada?.id_direccion === direccion.id_direccion ? 'seleccionada' : ''}" 
                 onclick="seleccionarDireccion(${index})">
                <strong>${direccion.calle}</strong><br>
                ${direccion.colonia}, ${direccion.codigo_postal}<br>
                <small>${direccion.referencias || ''}</small>
            </div>
        `;
    });
    
    selectorHTML += `
            </div>
            <button type="button" class="boton-secundario" onclick="mostrarFormularioNuevaDireccion()">
                Agregar nueva dirección
            </button>
            <div class="botones-formulario">
                <button type="button" id="boton-regresar-carrito-selector" class="boton-secundario">
                    Regresar al carrito
                </button>
                <button type="button" class="boton-principal" onclick="confirmarSeleccionDireccion()">
                    Confirmar dirección
                </button>
            </div>
        </div>
    `;
    
    formularioContainer.innerHTML = selectorHTML;
    
    // Agregar event listener al botón regresar
    document.getElementById('boton-regresar-carrito-selector').addEventListener('click', cerrarModalDireccion);
}

// Seleccionar dirección existente
function seleccionarDireccion(index) {
    direccionSeleccionada = direccionesUsuario[index];
    
    // Actualizar UI
    document.querySelectorAll('.direccion-opcion').forEach(el => el.classList.remove('seleccionada'));
    document.querySelectorAll('.direccion-opcion')[index].classList.add('seleccionada');
}

// Confirmar selección de dirección
function confirmarSeleccionDireccion() {
    if (direccionSeleccionada) {
        actualizarSeccionDireccion();
        cerrarModalDireccion();
    }
}

// Mostrar formulario para nueva dirección
function mostrarFormularioNuevaDireccion() {
    const formularioContainer = modalDireccion.querySelector('.formulario-direccion');
    formularioContainer.innerHTML = `
        <div class="campo-formulario">
            <label for="calle">Calle*</label>
            <input type="text" id="calle" name="calle" placeholder="Ingresa la calle" required>
        </div>
        <div class="campo-formulario">
            <label for="colonia">Colonia*</label>
            <input type="text" id="colonia" name="colonia" placeholder="Ingresa la colonia" required>
        </div>
        <div class="campo-formulario">
            <label for="numero_casa">No. Edificio*</label>
            <input type="text" id="numero_casa" name="numero_casa" placeholder="Número de casa/edificio" required>
        </div>
        <div class="campo-formulario">
            <label for="codigo_postal">Código Postal*</label>
            <input type="text" id="codigo_postal" name="codigo_postal" placeholder="Código postal" required>
        </div>
        <div class="campo-formulario">
            <label for="referencias">Referencias o indicaciones adicionales*</label>
            <input type="text" id="referencias" name="referencias" placeholder="Referencias adicionales" required>
        </div>
        <p id="aviso-formulario" class="aviso-error oculto">Por favor ingresa todos los datos necesarios</p>
        <div class="botones-formulario">
            <button type="button" id="boton-regresar-carrito-nuevo" class="boton-secundario">Regresar al carrito</button>
            <button type="submit" class="boton-principal">Guardar dirección</button>
        </div>
    `;
    
    // Reconfigurar event listeners
    document.getElementById('boton-regresar-carrito-nuevo').addEventListener('click', cerrarModalDireccion);
    
    const nuevoFormulario = modalDireccion.querySelector('.formulario-direccion');
    nuevoFormulario.addEventListener('submit', manejarEnvioDireccion);
}

// Cerrar modal de dirección
function cerrarModalDireccion() {
    modalDireccion.classList.add('oculto');
}

// Manejar envío de dirección
async function manejarEnvioDireccion(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const direccionData = {
        calle: formData.get('calle'),
        colonia: formData.get('colonia'),
        numero_casa: formData.get('numero_casa'),
        codigo_postal: formData.get('codigo_postal'),
        referencias: formData.get('referencias'),
        id_usuario: obtenerDatosUsuario().id_usuario
    };
    
    // Validar campos
    if (!direccionData.calle || !direccionData.colonia || !direccionData.numero_casa || 
        !direccionData.codigo_postal || !direccionData.referencias) {
        mostrarAvisoError('Por favor ingresa todos los datos necesarios');
        return;
    }
    
    try {
        const { token } = obtenerDatosUsuario();
        const response = await fetch(`${API_BASE_URL}/address`, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${token}`,
                "X-User-NAME": `${nombre}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(direccionData)
        });
        
        if (response.ok) {
            const nuevaDireccion = await response.json();
            direccionesUsuario.push(nuevaDireccion);
            direccionSeleccionada = nuevaDireccion;
            actualizarSeccionDireccion();
            cerrarModalDireccion();
        } else {
            mostrarAvisoError('Error al guardar la dirección');
        }
    } catch (error) {
        console.error('Error al guardar dirección:', error);
        mostrarAvisoError('Error al conectar con el servidor');
    }
}

// Mostrar aviso de error
function mostrarAvisoError(mensaje) {
    const aviso = document.getElementById('aviso-formulario');
    if (aviso) {
        aviso.textContent = mensaje;
        aviso.classList.remove('oculto');
        setTimeout(() => aviso.classList.add('oculto'), 3000);
    }
}

// Confirmar pedido
async function confirmarPedido() {
    if (!verificarAutenticacion()) return;
    
    if (carritoProductos.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    
    if (!direccionSeleccionada) {
        alert('Por favor selecciona una dirección de entrega');
        return;
    }
    
    const pedidoData = construirPedido();
        console.log("pedido",pedidoData)
    try {
        const { token } = obtenerDatosUsuario();
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${token}`,
                "X-User-NAME": `${nombre}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pedidoData)
        });
        
        if (response.ok) {
            // Limpiar carrito
            carritoProductos = [];
            guardarCarritoEnStorage();
            alert('Pedido confirmado exitosamente');
            window.location.href = '../pages/pantalla-carga.html';
        } else {
            alert('Error al confirmar el pedido');
        }
    } catch (error) {
        console.error('Error al confirmar pedido:', error);
        alert('Error al conectar con el servidor');
    }
}

// Construir objeto pedido
function construirPedido() {
    const subtotal = carritoProductos.reduce((total, item) => {
        return total + (item.precio * item.cantidad);
    }, 0);
    
    const total = subtotal + CUOTA_SERVICIO;
    
    const detalleCarrito = carritoProductos.map(item => ({
        id_producto: item.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio
    }));
    
    // Asumir que todos los productos son del mismo restaurante (simplificación)
    const id_restaurante = carritoProductos[0]?.id_restaurante || 1;
    console.log("id_restaurante",id_restaurante)
    return {
        id_usuario: parseInt(obtenerDatosUsuario().id_usuario),
        id_direccion: direccionSeleccionada.id_direccion,
        carrito: {
            total: total,
            detalleCarrito: detalleCarrito
        },
        id_status: 1,
        tarifa: CUOTA_SERVICIO,
        id_restaurante: id_restaurante
    };
}

// Funciones para agregar productos al carrito (llamadas desde otras páginas)
function agregarAlCarrito(producto) {
    const productoExistente = carritoProductos.find(item => item.id_producto === producto.id_producto);
    
    if (productoExistente) {
        productoExistente.cantidad += 1;
    } else {
        carritoProductos.push({
            ...producto,
            cantidad: 1
        });
    }
    
    guardarCarritoEnStorage();
    actualizarVistaCarrito();
}

// Exponer funciones globalmente para uso desde HTML
window.cambiarCantidad = cambiarCantidad;
window.eliminarProducto = eliminarProducto;
window.agregarAlCarrito = agregarAlCarrito;
window.seleccionarDireccion = seleccionarDireccion;
window.confirmarSeleccionDireccion = confirmarSeleccionDireccion;
window.mostrarFormularioNuevaDireccion = mostrarFormularioNuevaDireccion;


const modalConfirmarSalidaCarrito = document.getElementById('modal-confirmar-salida-carrito');
const btnSalirCarrito = document.getElementById('btn-salir-carrito');
const btnContinuarCarrito = document.getElementById('btn-continuar-carrito');
const mainContainer = document.getElementById('main-container'); // asegúrate de que exista

let urlDestinoCarrito = null; // guarda la URL a donde se quiere salir

// Enlaces que salen hacia home
const enlacesSalirDelCarrito = document.querySelectorAll('.nav-link-home-confirm');

enlacesSalirDelCarrito.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    urlDestinoCarrito = link.href;
    mostrarModalSalidaCarrito();
  });
});

btnSalirCarrito.addEventListener('click', () => {
  localStorage.removeItem("carrito");
  window.location.href = urlDestinoCarrito;
});

btnContinuarCarrito.addEventListener('click', () => {
  ocultarModalSalidaCarrito();
});

modalConfirmarSalidaCarrito.addEventListener('click', (e) => {
  if (e.target === modalConfirmarSalidaCarrito) {
    ocultarModalSalidaCarrito();
  }
});

function mostrarModalSalidaCarrito() {
  modalConfirmarSalidaCarrito.classList.remove('oculto');
  if (mainContainer) mainContainer.classList.add('blur-effect');
}

function ocultarModalSalidaCarrito() {
  modalConfirmarSalidaCarrito.classList.add('oculto');
  if (mainContainer) mainContainer.classList.remove('blur-effect');
}

function volverAtras() {
  history.back();
}
