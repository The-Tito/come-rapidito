const API_BASE = "http://localhost:7000";
let restauranteIdActual = null;

document.addEventListener("DOMContentLoaded", async () => {
    restauranteIdActual = obtenerRestauranteIdDesdeURL();
    if (!restauranteIdActual) {
        alert("Restaurante no válido");
        return;
    }

    await cargarDatosRestaurante(restauranteIdActual);
    inicializarModales();
});

function obtenerRestauranteIdDesdeURL() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get("id"));
}

async function cargarDatosRestaurante(restauranteId) {
    const restaurantes = JSON.parse(sessionStorage.getItem("restaurantes")) || [];

    const restaurante = restaurantes.find(r => r.id_restaurante === restauranteId);
    if (!restaurante) {
        console.error("Restaurante no encontrado");
        return;
    }

    actualizarInformacionRestaurante(restaurante);
    actualizarModalRestaurante(restaurante);
    await cargarProductosRestaurante(restauranteId);
}

function actualizarInformacionRestaurante(r) {
    document.querySelector(".seccion-hero-restaurante-banner").src = r.banner_url || "";
    document.querySelector(".informacion-logo").src = r.logo_url || "";
    document.querySelector(".informacion-nombre").textContent = r.nombre;
    document.querySelector(".informacion-detalle span b").textContent = r.telefono;
    document.querySelectorAll(".informacion-detalle span b")[1].textContent = formatearHorario(r.horario_apertura, r.horario_cierre);
    document.title = `${r.nombre} - Menú`;
}

function actualizarModalRestaurante(r) {
    document.querySelector(".modal-logo-restaurante").src = r.logo_url || "";
    document.querySelector(".modal-titulo").textContent = r.nombre;
    document.querySelector(".modal-info-detalle span").textContent = r.telefono;
    document.querySelectorAll(".modal-info-detalle span")[1].textContent = r.direccion;
    document.querySelector(".modal-horario").textContent = formatearHorario(r.horario_apertura, r.horario_cierre);
}

function formatearHorario(apertura, cierre) {
    function formato(h) {
        const t = new Date(`1970-01-01T${h}`);
        return t.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    return `${formato(apertura)} - ${formato(cierre)}`;
}

async function cargarProductosRestaurante(idRestaurante) {
    try {
        const res = await fetch(`${API_BASE}/products/${idRestaurante}`);
        if (!res.ok) throw new Error("Error cargando productos");

        const productos = await res.json();
        if (!productos.length) return mostrarMensajeVacio();

        renderizarProductos(productos);
    } catch (e) {
        console.error("Error al cargar productos:", e);
    }
}

function mostrarMensajeVacio() {
    document.querySelector(".seccion-menu-productos").innerHTML = `
        <div class="mensaje-vacio" style="text-align: center; padding: 40px;">
            <h3>No hay productos disponibles</h3>
            <p>Este restaurante aún no tiene productos en su menú.</p>
        </div>
    `;
}

function renderizarProductos(productos) {
    const contenedor = document.querySelector(".seccion-menu-productos");
    contenedor.innerHTML = "";

    productos.forEach(prod => {
        const article = document.createElement("article");
        article.classList.add("producto-contenedor");

        article.innerHTML = `
            <img src="${prod.url_imagen || '../../Assets/pizzaPepperoni.png'}" alt="${prod.nombre}" class="producto-contenedor-imagen">
            <div class="producto-contenedor-detalles">
                <h4 class="detalles-nombre">${prod.nombre}</h4>
                <p class="detalles-descripcion">${prod.descripcion}</p>
                <p class="detalles-precio">$${prod.precio.toFixed(2)}</p>
            </div>
            <button class="producto-contenedor-agregar" data-id="${prod.id_producto}" data-nombre="${prod.nombre}" data-precio="${prod.precio}">
                <img src="../../Assets/agregarCarrito.png" alt="Agregar al carrito">
            </button>
        `;

        contenedor.appendChild(article);
    });

    agregarListenersAgregar();
}

function agregarListenersAgregar() {
    const botones = document.querySelectorAll(".producto-contenedor-agregar");
    const modalAgregado = document.getElementById("modal-agregado");

    botones.forEach(boton => {
        boton.addEventListener("click", async (e) => {
            const btn = e.currentTarget;
            const idProducto = parseInt(btn.dataset.id);
            const nombre = btn.dataset.nombre;
            const precio = parseFloat(btn.dataset.precio);

            await agregarProductoAlCarrito({ id: idProducto, nombre, precio });

            modalAgregado.classList.remove("oculto");
            setTimeout(() => modalAgregado.classList.add("oculto"), 2500);
        });
    });
}

async function agregarProductoAlCarrito(producto) {
    try {
        const idUsuario = parseInt(localStorage.getItem("id_usuario"));
        if (!idUsuario) return alert("Inicia sesión para agregar productos al carrito.");

        const carrito = await obtenerOCrearCarritoActivo(idUsuario);

        const body = {
            id_carrito: carrito.id_carrito,
            id_producto: producto.id,
            cantidad: 1,
            precio_unitario: producto.precio
        };

        const res = await fetch(`${API_BASE}/carrito/detalle`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (!res.ok) throw new Error("No se pudo agregar producto al carrito");

        console.log(`Producto "${producto.nombre}" agregado al carrito`);
    } catch (err) {
        console.error("Error al agregar producto:", err);
    }
}

async function obtenerOCrearCarritoActivo(idUsuario) {
    const res = await fetch(`${API_BASE}/carrito/activo/${idUsuario}`);
    if (res.ok) return await res.json();

    const crear = await fetch(`${API_BASE}/carrito`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id_usuario: idUsuario,
            fecha_creacion: new Date().toISOString(),
            activo: true
        })
    });

    if (!crear.ok) throw new Error("Error creando carrito");

    return await crear.json();
}

function inicializarModales() {
    const mainContainer = document.getElementById("main-container");

    const bannerRestaurante = document.getElementById("banner-restaurante");
    const modalInfo = document.getElementById("modal-info-restaurante");
    const btnCerrarInfo = document.getElementById("cerrar-modal-info");

    const linksConfirmar = document.querySelectorAll(".nav-link-confirm");
    const modalConfirmar = document.getElementById("modal-confirmar-salida");
    const btnSalir = document.getElementById("btn-salir");
    const btnContinuar = document.getElementById("btn-continuar");

    bannerRestaurante.addEventListener("click", () => {
        modalInfo.classList.remove("oculto");
        mainContainer.classList.add("blur-effect");
    });

    btnCerrarInfo.addEventListener("click", () => {
        modalInfo.classList.add("oculto");
        mainContainer.classList.remove("blur-effect");
    });

    modalInfo.addEventListener("click", (e) => {
        if (e.target === modalInfo) {
            modalInfo.classList.add("oculto");
            mainContainer.classList.remove("blur-effect");
        }
    });

    let urlParaRedirigir = null;

    linksConfirmar.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            urlParaRedirigir = e.currentTarget.href;
            modalConfirmar.classList.remove("oculto");
            mainContainer.classList.add("blur-effect");
        });
    });

    btnSalir.addEventListener("click", () => {
        if (urlParaRedirigir) {
            window.location.href = urlParaRedirigir;
        }
    });

    btnContinuar.addEventListener("click", () => {
        modalConfirmar.classList.add("oculto");
        mainContainer.classList.remove("blur-effect");
    });

    modalConfirmar.addEventListener("click", (e) => {
        if (e.target === modalConfirmar) {
            modalConfirmar.classList.add("oculto");
            mainContainer.classList.remove("blur-effect");
        }
    });
}
