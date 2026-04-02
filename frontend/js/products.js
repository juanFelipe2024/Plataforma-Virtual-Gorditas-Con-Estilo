const API_URL = "http://localhost:3000/api";

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
        const productos = await response.json();

        const grid = document.getElementById("productos-grid");

        if (productos.length === 0) {
            grid.innerHTML = "<p>No hay productos disponibles.</p>";
            return;
        }

        grid.innerHTML = productos.map(producto => `
            <div class="producto-card">
                <img src="${producto.imagen || 'img/placeholder.jpg'}" alt="${producto.nombre}">
                <div class="producto-info">
                    <p class="producto-nombre">${producto.nombre}</p>
                    <p class="producto-precio">$${producto.precio.toLocaleString()}</p>
                    <div class="form-group">
                        <label>Talla</label>
                        <select id="talla-${producto._id}" class="select-talla">
                            <option value="">Selecciona una talla</option>
                            ${producto.tallas.map(t => `
                                <option value="${t}">${t}</option>
                            `).join("")}
                        </select>
                    </div>
                    <button class="btn-agregar" onclick="agregarAlCarrito('${producto._id}')">
                        Agregar al carrito
                    </button>
                </div>
            </div>
        `).join("");

    } catch (error) {
        console.error("Error al cargar productos:", error);
    }
}

async function agregarAlCarrito(productoId) {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    const selectTalla = document.getElementById(`talla-${productoId}`);
    const talla = selectTalla.value;

    if (!talla) {
        alert("Por favor selecciona una talla");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/cart`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ productoId, cantidad: 1, talla })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Producto agregado al carrito");
        } else {
            alert(data.error);
        }

    } catch (error) {
        alert("Error de conexión, intenta de nuevo");
    }
}