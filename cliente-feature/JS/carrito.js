document.addEventListener('DOMContentLoaded', () => {

    // --- ELEMENTOS DEL DOM ---
    const tituloCarritoLink = document.querySelector('.titulo-carrito');
    const carritoVacioDiv = document.getElementById('carrito-vacio');
    const carritoLlenoDiv = document.getElementById('carrito-lleno');
    const listaProductosDiv = document.getElementById('lista-productos');
    
    const botonEncontrarProductos = document.getElementById('boton-encontrar-productos');
    
    // Resumen de pedido
    const subtotalValorSpan = document.getElementById('subtotal-valor');
    const totalValorSpan = document.getElementById('total-valor');
    const cuotaServicio = 8;
    let contadorProductos = 0;

    // Modal
    const seccionDireccion = document.getElementById('direccion-entrega');
    const modalSuperposicion = document.getElementById('modal-direccion');
    const botonRegresarAlCarrito = document.getElementById('boton-regresar-carrito');
    const formularioDireccion = document.getElementById('formulario-direccion');
    const avisoFormulario = document.getElementById('aviso-formulario');
    const cuerpoDocumento = document.querySelector('body');


    // --- FUNCIONES ---

    // Función para actualizar el resumen del pedido
    function actualizarResumen() {
        const productos = document.querySelectorAll('.producto-item');
        let subtotal = 0;
        productos.forEach(producto => {
            // Extraer el precio del texto. Ej: "$179.00" -> 179
            const precioTexto = producto.querySelector('.producto-precio').textContent;
            const precio = parseFloat(precioTexto.replace(/[^0-9.-]+/g,""));
            subtotal += precio;
        });

        const total = subtotal + cuotaServicio;

        subtotalValorSpan.textContent = `$${subtotal}`;
        totalValorSpan.textContent = `$${total}`;
    }

    // Función para crear un nuevo item de producto
    function crearProductoHTML() {
        contadorProductos++;
        const productoHTML = `
            <div class="producto-item" id="producto-${contadorProductos}">
                <img src="../../Assets/pizzaPepperoni.png" alt="imagen-pizza" class="producto-imagen">
                <div class="producto-info">
                    <h3>Pizza peperoni</h3>
                    <p>Restaurante: La casa de las pizzas</p>
                </div>
                <p class="producto-precio">$179</p>
                <div class="producto-controles">
                    <button>
                        <img src="../../Assets/disminuirProducto.png" alt="icono-eliminar">
                    </button>
                    <span>1</span>
                    <button>
                        <img src="../../Assets/agregarProducto.png" alt="icono-eliminar">
                    </button>
                </div>
                <button class="boton-eliminar" data-product-id="producto-${contadorProductos}">
                    <img src="../../Assets/eliminarProducto.png" alt="icono-eliminar">
                </button>
            </div>
        `;
        return productoHTML;
    }
    
    // Función para agregar un producto al carrito
    function agregarProducto() {
        // Cambiar de vista si es la primera vez
        if (carritoVacioDiv.classList.contains('visible')) {
            carritoVacioDiv.classList.remove('visible');
            carritoVacioDiv.classList.add('oculto');
            carritoLlenoDiv.classList.remove('oculto');
            carritoLlenoDiv.style.display = 'flex'; // Aseguramos el display correcto
        }
        
        // Agregar el producto al DOM
        const nuevoProducto = crearProductoHTML();
        listaProductosDiv.insertAdjacentHTML('beforeend', nuevoProducto);
        
        // Actualizar el resumen
        actualizarResumen();
    }
    
    // Función para eliminar un producto
    function eliminarProducto(idProducto) {
        const productoParaEliminar = document.getElementById(idProducto);
        if (productoParaEliminar) {
            productoParaEliminar.remove();
            actualizarResumen();
            
            // Si ya no quedan productos, volver a la vista de carrito vacío
            if (listaProductosDiv.children.length === 0) {
                 carritoVacioDiv.classList.add('visible');
                 carritoVacioDiv.style.display = 'flex';
                 carritoLlenoDiv.classList.add('oculto');
                 contadorProductos = 0; // resetear contador
            }
        }
    }
    
    // --- EVENT LISTENERS ---

    // 1. Agregar producto al hacer clic en "Tu carrito"
    tituloCarritoLink.addEventListener('click', (e) => {
        e.preventDefault(); // Evita que la página recargue si es un link
        agregarProducto();
    });
    
    // Event listener para los botones de eliminar (usando delegación de eventos)
    listaProductosDiv.addEventListener('click', (e) => {
        const boton = e.target.closest('.boton-eliminar');
        if (boton) {
            const id = boton.dataset.productId;
            eliminarProducto(id);
        }
    });

    // 2. Botón "Encuentra productos" regresa a la página anterior
    botonEncontrarProductos.addEventListener('click', () => {
        history.back();
    });

    // 3. Abrir el modal de dirección
    seccionDireccion.addEventListener('click', () => {
        modalSuperposicion.classList.remove('oculto');
        // Agregamos un ligero delay para la animación del blur
        setTimeout(() => {
            cuerpoDocumento.classList.add('desenfoque');
        }, 10);
    });

    // 4. Cerrar el modal de dirección con el botón "Regresar"
    botonRegresarAlCarrito.addEventListener('click', () => {
        cuerpoDocumento.classList.remove('desenfoque');
        modalSuperposicion.classList.add('oculto');
    });

    // 5. Manejo del formulario de dirección
    formularioDireccion.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevenir el envío real del formulario

        // Obtener los valores de los inputs
        const calle = document.getElementById('calle').value.trim();
        const colonia = document.getElementById('colonia').value.trim();
        const numero_casa = document.getElementById('numero_casa').value.trim();
        const codigo_postal = document.getElementById('codigo_postal').value.trim();
        const referencias = document.getElementById('referencias').value.trim();

        // Validar que los campos no estén vacíos
        if (!calle || !colonia || !numero_casa || !codigo_postal || !referencias) {
            // Mostrar la advertencia si algún campo está vacío
            avisoFormulario.classList.remove('oculto');
        } else {
            // Ocultar la advertencia si todo está bien
            avisoFormulario.classList.add('oculto');

            // Aquí puedes procesar los datos, por ejemplo, enviarlos a un servidor.
            // Por ahora, solo los mostraremos en la consola como solicitaste.
            const datosDireccion = {
                calle,
                colonia,
                numero_casa,
                codigo_postal,
                referencias
            };
            
            console.log("Datos del formulario a enviar:", datosDireccion);
            alert("¡Pedido confirmado! Revisa la consola para ver los datos de la dirección.");

            // Opcional: Cerrar el modal y redirigir a una página de éxito
            modalSuperposicion.classList.add('oculto');
            cuerpoDocumento.classList.remove('desenfoque');
            // window.location.href = 'pagina-de-exito.html';
        }
    });
});