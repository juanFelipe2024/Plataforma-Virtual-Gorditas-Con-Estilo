const API_URL = "http://localhost:3000/api";
let todosLosProductos = [];

document.addEventListener("DOMContentLoaded", () => {
    verificarSesion();
    cargarProductos();
    actualizarBadgeCarrito();
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
        grid.innerHTML = "<p style='color:#888'>No hay productos en esta categoría.</p>";
        return;
    }

    grid.innerHTML = productos.map(producto => {
        const agotado = producto.stock === 0;

        return `
            <div class="producto-card ${agotado ? "producto-agotado" : ""}"
                onclick="${agotado ? "" : `window.location.href='product.html?id=${producto._id}'`}"
                style="cursor: ${agotado ? "default" : "pointer"}">
                <div class="producto-imagen-wrapper">
                    <img src="${producto.imagen || 'img/placeholder.jpg'}" alt="${producto.nombre}">
                    ${agotado ? `<div class="etiqueta-agotado">Agotado</div>` : ""}
                </div>
                <div class="producto-info">
                    <p class="producto-nombre">${producto.nombre}</p>
                    <p class="producto-precio">$${producto.precio.toLocaleString()}</p>
                    <p class="producto-tallas">Tallas: ${producto.tallas.join(", ")}</p>
                </div>
            </div>
        `;
    }).join("");
}

async function actualizarBadgeCarrito() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        const response = await fetch(`${API_URL}/cart`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await response.json();
        const badge = document.getElementById("carrito-badge");
        if (!badge) return;

        const total = data.productos
            ? data.productos.reduce((sum, item) => sum + item.cantidad, 0)
            : 0;

        if (total > 0) {
            badge.textContent = total;
            badge.classList.remove("hidden");
        } else {
            badge.classList.add("hidden");
        }

    } catch (error) {
        console.error("Error al obtener badge del carrito:", error);
    }
}