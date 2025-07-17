// =================== VARIABLES ===================
let productos = [];
let editando = false;
let productoEditandoId = null;
let imagenFile = null;

// =================== MODAL ===================
document.getElementById('btnAgregar').onclick = function () {
  document.getElementById('modalAgregarProducto').style.display = 'block';
  document.getElementById('modalTitulo').innerText = "Agregar producto";
  editando = false;
  productoEditandoId = null;
  imagenFile = null;
  document.getElementById('formAgregarProducto').reset();
  document.getElementById('previewImagen').innerHTML = '';
};

document.getElementById('cerrarModal').onclick = cerrarModal;
window.onclick = function (event) {
  var modal = document.getElementById('modalAgregarProducto');
  if (event.target == modal) cerrarModal();
};
function cerrarModal() {
  document.getElementById('modalAgregarProducto').style.display = 'none';
  document.getElementById('formAgregarProducto').reset();
  document.getElementById('previewImagen').innerHTML = '';
  imagenFile = null;
  editando = false;
  productoEditandoId = null;
}

// =================== IMAGEN: VISTA PREVIA ===================
document.getElementById('inputImagen').onchange = function (event) {
  const file = event.target.files[0];
  const preview = document.getElementById('previewImagen');
  preview.innerHTML = '';
  imagenFile = null;
  if (file) {
    imagenFile = file;
    const reader = new FileReader();
    reader.onload = function (e) {
      preview.innerHTML = '<img src="' + e.target.result + '" style="max-width:100%; max-height:170px; border-radius:8px;"/>';
    }
    reader.readAsDataURL(file);
  }
};

// =================== SUBMIT FORM ===================
document.getElementById('formAgregarProducto').onsubmit = async function (e) {
  e.preventDefault();
  const form = e.target;

  const formData = new FormData();
  formData.append("nombre", form.nombre.value);
  formData.append("descripcion", form.descripcion.value);
  formData.append("precio", form.precio.value);
  formData.append("id_categoria", form.id_categoria.value);
  formData.append("id_restaurante", form.id_restaurante.value);
  if (imagenFile) formData.append("imagen", imagenFile);

  try {
    let response;
    if (editando && productoEditandoId !== null) {
      response = await fetch(`http://localhost:7000/api/products/${productoEditandoId}`, {
        method: "PUT",
        body: formData
      });
    } else {
      if (!imagenFile) {
        alert("Selecciona una imagen antes de guardar.");
        return;
      }
      response = await fetch("http://localhost:7000/api/products", {
        method: "POST",
        body: formData
      });
    }

    if (response.ok) {
      alert(editando ? "Producto actualizado correctamente." : "Producto agregado correctamente.");
      await getProductosDesdeAPI();
      cerrarModal();
    } else {
      const errorText = await response.text();
      alert("Error al guardar: " + errorText);
    }
  } catch (err) {
    console.error(err);
    alert("Error de conexión con la API.");
  }
};

// =================== CARGAR DESDE API ===================
async function getProductosDesdeAPI() {
  try {
    let response = await fetch("http://localhost:7000/products");
    if (!response.ok) throw new Error("Error al obtener productos desde la API");

    const data = await response.json();
    productos = data;
    renderProductos();
  } catch (error) {
    console.error(error);
    alert("No se pudieron cargar los productos desde la base de datos.");
  }
}

// =================== RENDER CARDS ===================
function renderProductos() {
  const cont = document.getElementById('cardsContainer');
  cont.innerHTML = '';
  productos.forEach((prod, idx) => {
    cont.innerHTML += `
      <div class="product-card">
       <img src="${prod.url_imagen ? prod.url_imagen : 'https://via.placeholder.com/100'}" alt="Imagen">
        <div class="product-info">
          <h3>${prod.nombre}</h3>
          <p><strong>Descripción:</strong> ${prod.descripcion}</p>
          <p><strong>Precio:</strong> $${prod.precio ? parseFloat(prod.precio).toFixed(2) : '0.00'}</p>
          <div class="product-tags">
            <span class="product-tag">Categoría: ${prod.id_categoria}</span>
            <span class="product-tag">Restaurante: ${prod.id_restaurante}</span>
          </div>
          <div class="product-actions" style="margin-top:14px; display:flex; gap:8px;">
            <button class="edit-btn" data-id="${prod.id_producto}"><i class="fa fa-pen"></i> Editar</button>
            <button class="delete-btn" data-id="${prod.id_producto}"><i class="fa fa-trash"></i> Eliminar</button>
          </div>
        </div>
      </div>
    `;
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = async function () {
      const id = this.dataset.id;
      if (confirm("¿Estás seguro de eliminar este producto?")) {
        try {
          const res = await fetch(`http://localhost:7000/api/products/${id}`, { method: "DELETE" });
          if (res.ok) {
            alert("Producto eliminado.");
            await getProductosDesdeAPI();
          } else {
            alert("Error al eliminar producto.");
          }
        } catch (err) {
          console.error(err);
          alert("Error de conexión.");
        }
      }
    };
  });

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.onclick = function () {
      const id = parseInt(this.dataset.id);
      const prod = productos.find(p => p.id_producto === id);
      if (!prod) return;

      editando = true;
      productoEditandoId = id;
      document.getElementById('modalAgregarProducto').style.display = 'block';
      document.getElementById('modalTitulo').innerText = "Editar producto";

      const form = document.getElementById('formAgregarProducto');
      form.nombre.value = prod.nombre;
      form.descripcion.value = prod.descripcion;
      form.precio.value = prod.precio;
      form.id_categoria.value = prod.id_categoria;
      form.id_restaurante.value = prod.id_restaurante;
      document.getElementById('previewImagen').innerHTML =
        prod.url_imagen
          ? `<img src="http://localhost:7000/uploads/${prod.url_imagen}" style="max-width:100%; max-height:170px; border-radius:8px;"/>`
          : '';

      imagenFile = null;
    };
  });
}

// =================== INICIO ===================
getProductosDesdeAPI();
