const API_URL = "http://localhost:3000/api";
let productoEditandoId = null;

document.addEventListener("DOMContentLoaded", () => {
    verificarAdmin();
    cargarPedidos();
    cargarProductos();

    document.getElementById("nav-logout").addEventListener("click", cerrarSesion);
    document.getElementById("btn-agregar").addEventListener("click", agregarProducto);
});

function verificarAdmin() {
    const token = localStorage.getItem("token");
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    if (!token || !usuario) {
        window.location.href = "login.html";
        return;
    }

    if (usuario.rol !== "admin") {
        window.location.href = "index.html";
        return;
    }

    document.getElementById("nav-usuario").textContent = `Hola, ${usuario.nombre}`;
}

function cerrarSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "login.html";
}

async function agregarProducto() {
    const token = localStorage.getItem("token");
    const errorDiv = document.getElementById("error-message");
    const successDiv = document.getElementById("success-message");

    errorDiv.classList.add("hidden");
    successDiv.classList.add("hidden");

    const nombre = document.getElementById("nombre").value.trim();
    const precio = document.getElementById("precio").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const categoria = document.getElementById("categoria").value.trim();
    const color = document.getElementById("color").value.trim();
    const tallasInput = document.getElementById("tallas").value.trim();
    const stock = document.getElementById("stock").value.trim();
    const imagen = document.getElementById("imagen").value.trim();

    if (!nombre || !precio || !stock) {
        errorDiv.textContent = "Nombre, precio y stock son obligatorios";
        errorDiv.classList.remove("hidden");
        return;
    }

    const tallas = tallasInput.split(",").map(t => t.trim()).filter(t => t !== "");

    try {
        const response = await fetch(`${API_URL}/products`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                nombre,
                precio: Number(precio),
                descripcion,
                categoria,
                color,
                tallas,
                stock: Number(stock),
                imagen
            })
        });

        const data = await response.json();

        if (response.ok) {
            successDiv.textContent = "Producto agregado correctamente";
            successDiv.classList.remove("hidden");
            limpiarFormulario();
            cargarProductos();
        } else {
            errorDiv.textContent = data.error;
            errorDiv.classList.remove("hidden");
        }

    } catch (error) {
        errorDiv.textContent = "Error de conexión, intenta de nuevo";
        errorDiv.classList.remove("hidden");
    }
}

function limpiarFormulario() {
    document.getElementById("nombre").value = "";
    document.getElementById("precio").value = "";
    document.getElementById("descripcion").value = "";
    document.getElementById("categoria").value = "";
    document.getElementById("color").value = "";
    document.getElementById("tallas").value = "";
    document.getElementById("stock").value = "";
    document.getElementById("imagen").value = "";
}

async function cargarPedidos() {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`${API_URL}/orders`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const pedidos = await response.json();
        const container = document.getElementById("pedidos-container");

        if (pedidos.length === 0) {
            container.innerHTML = "<p style='color:#888'>No hay pedidos todavía.</p>";
            return;
        }

        container.innerHTML = pedidos.map(pedido => {
            const fecha = new Date(pedido.fecha).toLocaleDateString("es-CO", {
                year: "numeric", month: "long", day: "numeric"
            });

            return `
                <div class="pedido-card" id="pedido-${pedido._id}">
                    <div class="pedido-header">
                        <div>
                            <span class="pedido-cliente">
                                ${pedido.usuario.nombre} — ${pedido.usuario.email}
                            </span>
                            <p class="pedido-fecha">${fecha}</p>
                        </div>
                        <span class="pedido-total">$${pedido.total.toLocaleString()}</span>
                    </div>

                    <div class="pedido-productos">
                        ${pedido.productos.map(p =>
                            `${p.nombre} x${p.cantidad}`
                        ).join(", ")}
                    </div>

                    <div class="pedido-estado-row">
                        <select
                            class="select-estado estado-${pedido.estado}"
                            onchange="actualizarEstado('${pedido._id}', this)">
                            <option value="pendiente"   ${pedido.estado === "pendiente"   ? "selected" : ""}>Pendiente</option>
                            <option value="confirmado"  ${pedido.estado === "confirmado"  ? "selected" : ""}>Confirmado</option>
                            <option value="cancelado"   ${pedido.estado === "cancelado"   ? "selected" : ""}>Cancelado</option>
                        </select>
                        <span class="estado-feedback hidden" id="feedback-${pedido._id}">✓ Guardado</span>
                    </div>
                </div>
            `;
        }).join("");

    } catch (error) {
        console.error("Error al cargar pedidos:", error);
    }
}

async function cargarProductos() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const productos = await response.json();
        const container = document.getElementById("productos-container");

        if (productos.length === 0) {
            container.innerHTML = "<p class='carrito-vacio'>No hay productos en el catálogo.</p>";
            return;
        }

        container.innerHTML = productos.map((producto, index) => `
            <div class="admin-producto-card" style="--i:${index}">
                <div class="admin-producto-info">
                    <strong>${producto.nombre}</strong>
                    <p>Precio: $${producto.precio.toLocaleString()} — Stock: ${producto.stock}</p>
                    <p>Tallas: ${producto.tallas.join(", ")}</p>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn-editar-producto"
                        onclick="abrirModalEditar('${producto._id}')">
                        Editar
                    </button>
                    <button class="btn-eliminar-producto"
                        onclick="eliminarProducto('${producto._id}')">
                        Eliminar
                    </button>
                </div>
            </div>
        `).join("");

    } catch (error) {
        console.error("Error al cargar productos:", error);
    }
}

async function eliminarProducto(productoId) {
    const token = localStorage.getItem("token");

    if (!confirm("¿Estás seguro de eliminar este producto?")) return;

    try {
        const response = await fetch(`${API_URL}/products/${productoId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
            cargarProductos();
        }

    } catch (error) {
        alert("Error de conexión, intenta de nuevo");
    }
}

async function actualizarEstado(pedidoId, selectEl) {
    const token = localStorage.getItem("token");
    const nuevoEstado = selectEl.value;

    // Actualizar color del select inmediatamente
    selectEl.className = `select-estado estado-${nuevoEstado}`;

    try {
        const response = await fetch(`${API_URL}/orders/${pedidoId}/estado`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ estado: nuevoEstado })
        });

        if (response.ok) {
            const feedback = document.getElementById(`feedback-${pedidoId}`);
            feedback.classList.remove("hidden");
            setTimeout(() => feedback.classList.add("hidden"), 2000);
        } else {
            alert("Error al actualizar el estado");
            cargarPedidos();
        }

    } catch (error) {
        alert("Error de conexión, intenta de nuevo");
        cargarPedidos();
    }
}

async function abrirModalEditar(productoId) {
    productoEditandoId = productoId;

    // Limpiar mensajes previos
    document.getElementById("editar-error").classList.add("hidden");
    document.getElementById("editar-success").classList.add("hidden");

    try {
        const response = await fetch(`${API_URL}/products/${productoId}`);
        const producto = await response.json();

        // Precargar los datos actuales
        document.getElementById("editar-nombre").value      = producto.nombre || "";
        document.getElementById("editar-precio").value      = producto.precio || "";
        document.getElementById("editar-descripcion").value = producto.descripcion || "";
        document.getElementById("editar-categoria").value   = producto.categoria || "";
        document.getElementById("editar-color").value       = producto.color || "";
        document.getElementById("editar-tallas").value      = producto.tallas?.join(", ") || "";
        document.getElementById("editar-stock").value       = producto.stock || "";
        document.getElementById("editar-imagen").value      = producto.imagen || "";

        // Mostrar preview de la imagen actual
        const preview = document.getElementById("editar-preview");
        if (producto.imagen) {
            preview.src = producto.imagen;
            preview.style.display = "block";
        } else {
            preview.style.display = "none";
        }

        // Actualizar preview cuando cambie la URL
        document.getElementById("editar-imagen").oninput = function () {
            if (this.value) {
                preview.src = this.value;
                preview.style.display = "block";
            } else {
                preview.style.display = "none";
            }
        };

        document.getElementById("modal-editar").classList.remove("hidden");

    } catch (error) {
        alert("Error al cargar el producto");
    }
}

function cerrarModalEditar() {
    document.getElementById("modal-editar").classList.add("hidden");
    productoEditandoId = null;
}

async function guardarEdicion() {
    const token = localStorage.getItem("token");
    const errorDiv   = document.getElementById("editar-error");
    const successDiv = document.getElementById("editar-success");

    errorDiv.classList.add("hidden");
    successDiv.classList.add("hidden");

    const nombre = document.getElementById("editar-nombre").value.trim();
    const precio = document.getElementById("editar-precio").value.trim();
    const stock  = document.getElementById("editar-stock").value.trim();

    if (!nombre || !precio || !stock) {
        errorDiv.textContent = "Nombre, precio y stock son obligatorios";
        errorDiv.classList.remove("hidden");
        return;
    }

    const tallasInput = document.getElementById("editar-tallas").value.trim();
    const tallas = tallasInput.split(",").map(t => t.trim()).filter(t => t !== "");

    const body = {
        nombre,
        precio:      Number(precio),
        descripcion: document.getElementById("editar-descripcion").value.trim(),
        categoria:   document.getElementById("editar-categoria").value.trim(),
        color:       document.getElementById("editar-color").value.trim(),
        tallas,
        stock:       Number(stock),
        imagen:      document.getElementById("editar-imagen").value.trim()
    };

    try {
        const response = await fetch(`${API_URL}/products/${productoEditandoId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (response.ok) {
            successDiv.textContent = "Producto actualizado correctamente";
            successDiv.classList.remove("hidden");
            cargarProductos();
            setTimeout(() => cerrarModalEditar(), 1500);
        } else {
            errorDiv.textContent = data.error;
            errorDiv.classList.remove("hidden");
        }

    } catch (error) {
        errorDiv.textContent = "Error de conexión, intenta de nuevo";
        errorDiv.classList.remove("hidden");
    }
}