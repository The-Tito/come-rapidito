// =================== VARIABLES ===================
let productos = [];
let editando = false;
let idxEditando = -1;
let imagenFile = null;

ocument.addEventListener('DOMContentLoaded', function() {
      const usuario = JSON.parse(sessionStorage.getItem('user'));
      const restaurant = JSON.parse(sessionStorage.getItem('restaurante'))
      const id_usuario = usuario.find(r => r.id_usuario);
      const token = usuario.find(r => r.token);
      const nombre = usuario.find(r => r.nombre);
      const idRol = usuario.find(r => r.idRol);
      const id_restaurante = restaurant.find(r => r.id_restaurante)
})
// =================== MODAL ===================
document.getElementById('btnAgregar').onclick = function() {
  document.getElementById('modalAgregarProducto').style.display = 'block';
  document.getElementById('modalTitulo').innerText = "Agregar producto";
  editando = false;
  idxEditando = -1;
  imagenFile = null;
  document.getElementById('formAgregarProducto').reset();
  document.getElementById('previewImagen').innerHTML = '';
};

document.getElementById('cerrarModal').onclick = cerrarModal;
window.onclick = function(event) {
  var modal = document.getElementById('modalAgregarProducto');
  if (event.target == modal) cerrarModal();
};
function cerrarModal() {
  document.getElementById('modalAgregarProducto').style.display = 'none';
  document.getElementById('formAgregarProducto').reset();
  document.getElementById('previewImagen').innerHTML = '';
  imagenFile = null;
  editando = false;
  idxEditando = -1;
}

// =================== IMAGEN: VISTA PREVIA ===================
document.getElementById('inputImagen').onchange = function(event) {
  const file = event.target.files[0];
  const preview = document.getElementById('previewImagen');
  preview.innerHTML = '';
  imagenFile = null;
  if (file) {
    imagenFile = file; // Guardamos archivo para el submit
    const reader = new FileReader();
    reader.onload = function(e) {
      preview.innerHTML = '<img src="' + e.target.result + '" style="max-width:100%; max-height:170px; border-radius:8px;"/>';
    }
    reader.readAsDataURL(file);
  }
};

// =================== SUBMIT FORM ===================
document.getElementById('formAgregarProducto').onsubmit = async function(e) {
  e.preventDefault();
  const form = e.target;

  // Validar imagen
  if (!imagenFile) {
    alert("Selecciona una imagen antes de guardar.");
    return;
  }

  // Prepara FormData (multipart/form-data)
  const formData = new FormData();
  formData.append("nombre", form.nombre.value);
  formData.append("descripcion", form.descripcion.value);
  formData.append("precio", form.precio.value);
  formData.append("id_categoria", form.id_categoria.value);
  formData.append("id_restaurante", id_restaurante);
  formData.append("imagen", imagenFile);

  // Envía a backend
  try {
    let response = await fetch("http://localhost:7000/api/products", {
      method: "POST",
      'Authorization': `Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJQZWRybyJ9.EtBlTRFLmyKB9U-RlcRA6afFdkaeukIY6hajCE1hLos`,
      'X-User-NAME': `Pedro`,
      // Authorization': `Bearer ${token}`,
      // 'X-User-NAME': `${nombre}`,
      body: formData // Importante: fetch maneja los headers
    });
    if (response.ok) {
      alert("Producto agregado correctamente en la base de datos.");
      // Opcional: puedes refrescar productos desde la API aquí
    } else {
      let error = '';
      try {
        const errObj = await response.json();
        error = errObj.error || '';
      } catch (e) {}
      alert("Error al guardar en la base de datos. " + error);
    }
  } catch (err) {
    alert("Error de conexión con la API.");
  }

  // Actualiza localmente
  if (editando && idxEditando !== -1) {
    productos[idxEditando] = {
      nombre: form.nombre.value,
      descripcion: form.descripcion.value,
      precio: parseFloat(form.precio.value),
      id_categoria: parseInt(form.id_categoria.value),
      id_restaurante: parseInt(form.id_restaurante.value),
      url_imagen: ''
    };
  } else {
    productos.push({
      nombre: form.nombre.value,
      descripcion: form.descripcion.value,
      precio: parseFloat(form.precio.value),
      id_categoria: parseInt(form.id_categoria.value),
      id_restaurante: parseInt(form.id_restaurante.value),
      url_imagen: ''
    });
  }

  renderProductos();
  cerrarModal();
};

// =================== CARDS ===================
function renderProductos() {
  const cont = document.getElementById('cardsContainer');
  cont.innerHTML = '';
  productos.forEach((prod, idx) => {
    cont.innerHTML += `
      <div class="product-card">
        <img src="${prod.url_imagen || 'https://via.placeholder.com/100'}" alt="Imagen">
        <div class="product-info">
          <h3>${prod.nombre}</h3>
          <p><strong>Descripción:</strong> ${prod.descripcion}</p>
          <p><strong>Precio:</strong> $${prod.precio ? prod.precio.toFixed(2) : '0.00'}</p>
          <div class="product-tags">
            <span class="product-tag">Categoría: ${prod.id_categoria}</span>
            <span class="product-tag">Restaurante: ${prod.id_restaurante}</span>
          </div>
          <div class="product-actions" style="margin-top:14px; display:flex; gap:8px;">
            <button class="edit-btn" data-idx="${idx}"><i class="fa fa-pen"></i> Editar</button>
            <button class="delete-btn" data-idx="${idx}"><i class="fa fa-trash"></i> Eliminar</button>
          </div>
        </div>
      </div>
    `;
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = function() {
      const idx = parseInt(this.dataset.idx);
      productos.splice(idx, 1);
      renderProductos();
    };
  });

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.onclick = function() {
      const idx = parseInt(this.dataset.idx);
      editarProducto(idx);
    };
  });
}

function editarProducto(idx) {
  const prod = productos[idx];
  editando = true;
  idxEditando = idx;
  document.getElementById('modalAgregarProducto').style.display = 'block';
  document.getElementById('modalTitulo').innerText = "Editar producto";
  const form = document.getElementById('formAgregarProducto');
  form.nombre.value = prod.nombre;
  form.descripcion.value = prod.descripcion;
  form.precio.value = prod.precio;
  form.id_categoria.value = prod.id_categoria;
  form.id_restaurante.value = prod.id_restaurante;
  // Imagen previa
  document.getElementById('previewImagen').innerHTML =
    prod.url_imagen
      ? `<img src="${prod.url_imagen}" style="max-width:100%; max-height:170px; border-radius:8px;"/>`
      : '';
  imagenFile = null;
}
