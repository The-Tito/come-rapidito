document.addEventListener('DOMContentLoaded', () => {

    const addProductBtn = document.getElementById('add-product-btn');
    const productList = document.getElementById('product-list');

    // Función para AGREGAR un nuevo producto
    addProductBtn.addEventListener('click', () => {
        // Encontramos la primera tarjeta para usarla como plantilla
        const firstCard = productList.querySelector('.product-card');
        
        if (firstCard) {
            // Clonamos la tarjeta con todo su contenido
            const newCard = firstCard.cloneNode(true);
            
            // Limpiamos los campos del formulario en la nueva tarjeta clonada
            newCard.querySelector('input[type="text"]').value = '';
            newCard.querySelector('textarea').value = '';
            
            // Opcional: Resetear los selectores a la primera opción
            const selects = newCard.querySelectorAll('select');
            selects.forEach(select => {
                select.selectedIndex = 0;
            });
            
            // Añadimos la nueva tarjeta al final de la lista
            productList.appendChild(newCard);
        } else {
            // En caso de que no haya ninguna tarjeta para clonar (opcional)
            console.error('No hay una tarjeta de producto para clonar.');
        }
    });

    // Función para ELIMINAR un producto (usando delegación de eventos)
    // Esto asegura que los botones "Eliminar" de las nuevas tarjetas también funcionen
    productList.addEventListener('click', (event) => {
        // Buscamos si el clic fue en un botón de eliminar o su ícono/texto
        const deleteButton = event.target.closest('.btn-delete');
        
        if (deleteButton) {
            // Encontramos la tarjeta padre del botón y la eliminamos
            const cardToRemove = deleteButton.closest('.product-card');
            if (cardToRemove) {
                cardToRemove.remove();
            }
        }
    });

});