document.addEventListener("DOMContentLoaded", () => {
    const id_usuario = localStorage.getItem("id_usuario");
    const nombrestorage = localStorage.getItem("nombre");
    const tokenstorage = localStorage.getItem("token");

    const nombre = nombrestorage.replace(/"/g, '');
    const token = tokenstorage.replace(/"/g, '');

    // Cargar datos existentes del usuario
    fetch(`http://54.88.1.254/api/users/${id_usuario}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "X-User-NAME": nombre,
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        if (!response.ok) throw new Error("Error al obtener datos");
        return response.json();
    })
    .then(usuario => {
        document.getElementById("nombre").value = usuario.nombre || "";
        document.getElementById("apellido").value = usuario.apellido || "";
        document.getElementById("telefono").value = usuario.numero_telefono || "";
        document.getElementById("email").value = usuario.correo_electronico || "";
    })
    .catch(error => console.error("Error al cargar datos del usuario:", error));

    // Guardar cambios con PUT
    const formulario = document.querySelector(".formulario-perfil");
    formulario.addEventListener("submit", (event) => {
        event.preventDefault();

        const datosActualizados = {
            nombre: document.getElementById("nombre").value,
            apellido: document.getElementById("apellido").value,
            numero_telefono: document.getElementById("telefono").value,
            correo_electronico: document.getElementById("email").value
        };

        fetch(`http://54.88.1.254/api/users/${id_usuario}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "X-User-NAME": nombre,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datosActualizados)
        })
        .then(response => {
            if (!response.ok) throw new Error("Error al actualizar usuario");
            return response.json();
        })
        .then(data => {
            alert("✅ ¡Datos actualizados correctamente!");
        })
        .catch(error => {
            console.error("Error al actualizar datos:", error);
            alert("❌ Error al actualizar datos.");
        });
    });
});
