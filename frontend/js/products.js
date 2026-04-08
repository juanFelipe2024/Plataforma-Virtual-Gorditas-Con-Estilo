const API_URL = "http://localhost:3000/api";
let todosLosProductos = [];

document.addEventListener("DOMContentLoaded", () => {
    verificarSesion();
    cargarProductos();
    document.getElementById("nav-logout").addEventListener("click", cerrarSesion);
});

function verificarSesion() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (usuario) {
        document.getElementById("nav-usuario").textContent = `Hola, ${usuario.nombre}`;
    }
}

function cerrarSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "login.html";
}

async function cargarProductos() {
    try {
        const response = await fetch(`${API_URL}/products`);
        todosLosProductos = await response.json();
        renderProductos(todosLosProductos);
    } catch (error) {
        console.error("Error al cargar productos:", error);
    }
}

function filtrarCategoria(categoria, boton) {
    // Actualizar botón activo
    document.querySelectorAll(".categoria-btn").forEach(btn => {
        btn.classList.remove("activa");
    });
    if (boton) boton.classList.add("activa");

    // Actualizar título
    const titulo = document.getElementById("titulo-categoria");
    titulo.textContent = categoria === "todas" ? "Nuestras prendas" : categoria;

    // Filtrar
    const filtrados = categoria === "todas"
        ? todosLosProductos
        : todosLosProductos.filter(p =>
            p.categoria?.toLowerCase() === categoria.toLowerCase()
          );

    renderProductos(filtrados);
}

function renderProductos(productos) {
    const grid = document.getElementById("productos-grid");

    if (productos.length === 0) {
        grid.innerHTML = "<p class='carrito-vacio'>No hay productos en esta categoría.</p>";
        return;
    }

    grid.innerHTML = productos.map((producto, index) => `
        <div class="producto-card" onclick="window.location.href='product.html?id=${producto._id}'" style="cursor:pointer; --i:${index}">
            <img src="${producto.imagen || 'img/placeholder.jpg'}" alt="${producto.nombre}">
            <div class="producto-info">
                <p class="producto-nombre">${producto.nombre}</p>
                <p class="producto-precio">$${producto.precio.toLocaleString()}</p>
                <p class="producto-tallas">Tallas: ${producto.tallas.join(", ")}</p>
            </div>
        </div>
    `).join("");
}