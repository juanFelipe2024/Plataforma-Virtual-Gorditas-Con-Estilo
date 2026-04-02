const API_URL = "http://localhost:3000/api";

document.addEventListener("DOMContentLoaded", () => {
    verificarSesion();
    cargarCarrito();

    document.getElementById("nav-logout").addEventListener("click", cerrarSesion);
    document.getElementById("btn-confirmar").addEventListener("click", confirmarCompra);
});

function verificarSesion() {
    const token = localStorage.getItem("token");
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    if (usuario) {
        document.getElementById("nav-usuario").textContent = `Hola, ${usuario.nombre}`;
    }
}

function cerrarSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "login.html";
}

async function cargarCarrito() {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`${API_URL}/cart`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await response.json();
        const itemsDiv = document.getElementById("carrito-items");
        const resumenDiv = document.getElementById("carrito-resumen");

        if (!data.productos || data.productos.length === 0) {
            itemsDiv.innerHTML = `
                <p class="carrito-vacio">Tu carrito está vacío. 
                <a href="index.html">Ver catálogo</a></p>
            `;
            resumenDiv.classList.add("hidden");
            return;
        }

        let total = 0;

        itemsDiv.innerHTML = data.productos.map(item => {
            const subtotal = item.productoId.precio * item.cantidad;
            total += subtotal;
            return `
                <div class="carrito-item">
                    <div class="carrito-item-info">
                        <p class="carrito-item-nombre">${item.productoId.nombre}</p>
                        <p class="carrito-item-precio">$${item.productoId.precio.toLocaleString()}</p>
                        <p class="carrito-item-cantidad">Talla: ${item.talla} - Cantidad: ${item.cantidad}</p>
                    </div>
                    <button class="btn-eliminar" 
                        onclick="eliminarDelCarrito('${item.productoId._id}', '${item.talla}')">
                        Eliminar
                    </button>
                </div>
            `;
        }).join("");

        document.getElementById("carrito-total").textContent = `$${total.toLocaleString()}`;
        resumenDiv.classList.remove("hidden");

    } catch (error) {
        console.error("Error al cargar el carrito:", error);
    }
}

async function eliminarDelCarrito(productoId, talla) {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`${API_URL}/cart/${productoId}?talla=${talla}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
            cargarCarrito();
        }

    } catch (error) {
        alert("Error de conexión, intenta de nuevo");
    }
}

async function confirmarCompra() {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`${API_URL}/cart/confirmar`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await response.json();

        if (response.ok) {
            alert(`Compra confirmada. Total: $${data.pedido.total.toLocaleString()}`);
            window.location.href = "index.html";
        } else {
            alert(data.error);
        }

    } catch (error) {
        alert("Error de conexión, intenta de nuevo");
    }
}