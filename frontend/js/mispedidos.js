const API_URL = "http://localhost:3000/api";

document.addEventListener("DOMContentLoaded", () => {
    verificarSesion();
    cargarMisPedidos();
    document.getElementById("nav-logout").addEventListener("click", cerrarSesion);
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

async function cargarMisPedidos() {
    const token = localStorage.getItem("token");
    const container = document.getElementById("pedidos-container");

    try {
        const response = await fetch(`${API_URL}/orders/mispedidos`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const pedidos = await response.json();

        if (pedidos.length === 0) {
            container.innerHTML = `
                <div class="pedidos-vacio">
                    <p>Aún no tienes pedidos realizados.</p>
                    <a href="index.html" class="btn-primary" style="display:inline-block; width:auto; padding: 12px 28px; text-decoration:none; margin-top: 16px;">
                        Ver catálogo
                    </a>
                </div>`;
            return;
        }

        container.innerHTML = pedidos.map(pedido => {
            const fecha = new Date(pedido.fecha).toLocaleDateString("es-CO", {
                year: "numeric",
                month: "long",
                day: "numeric"
            });

            const estadoClase = {
                pendiente: "estado-pendiente",
                confirmado: "estado-confirmado",
                cancelado: "estado-cancelado"
            }[pedido.estado] || "estado-pendiente";

            const productosHTML = pedido.productos.map(p => `
                <div class="pedido-producto-fila">
                    <span class="pedido-producto-nombre">${p.nombre}</span>
                    <span class="pedido-producto-cantidad">x${p.cantidad}</span>
                    <span class="pedido-producto-subtotal">$${(p.precio * p.cantidad).toLocaleString()}</span>
                </div>
            `).join("");

            return `
                <div class="mi-pedido-card">
                    <div class="mi-pedido-header">
                        <div>
                            <p class="mi-pedido-fecha">${fecha}</p>
                            <p class="mi-pedido-id">Pedido #${pedido._id.slice(-6).toUpperCase()}</p>
                        </div>
                        <span class="estado-badge ${estadoClase}">${pedido.estado}</span>
                    </div>

                    <div class="mi-pedido-productos">
                        ${productosHTML}
                    </div>

                    <div class="mi-pedido-footer">
                        <span class="mi-pedido-total">Total: $${pedido.total.toLocaleString()}</span>
                    </div>
                </div>
            `;
        }).join("");

    } catch (error) {
        console.error("Error al cargar pedidos:", error);
        container.innerHTML = `<p style="color:#888">Error al cargar tus pedidos. Intenta de nuevo.</p>`;
    }
}