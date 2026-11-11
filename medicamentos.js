const API_URL = "/medicamentos";

function badgeVencimiento(estado) {
  const clases = {
    "Vencido": "bg-danger",
    "Por vencer": "bg-warning text-dark",
    "Vigente": "bg-success"
  };
  return `<span class="badge ${clases[estado] || "bg-secondary"}">${estado}</span>`;
}

async function cargarMedicamentos() {
  const res = await authFetch(API_URL);
  const data = await res.json();
  const tbody = document.getElementById("medTable");
  tbody.innerHTML = "";
  data.forEach(med => {
    tbody.innerHTML += `
      <tr>
        <td>${med.idMedicamento}</td>
        <td>${med.nombre}</td>
        <td>${med.codigoCUM || "—"}</td>
        <td>${med.lote}</td>
        <td>${med.cantidad}</td>
        <td>$${Number(med.precioUnitario).toLocaleString("es-CO")}</td>
        <td>${new Date(med.vencimiento).toLocaleDateString()}</td>
        <td>${badgeVencimiento(med.estadoVencimiento)}</td>
        <td>
          <button class="btn btn-info btn-sm" onclick="verHistorial(${med.idMedicamento}, '${med.nombre.replace(/'/g, "\\'")}')">Historial</button>
          <button class="btn btn-warning btn-sm" onclick="abrirModal(${med.idMedicamento})">Editar</button>
          <button class="btn btn-danger btn-sm" onclick="eliminarMedicamento(${med.idMedicamento})">Eliminar</button>
        </td>
      </tr>`;
  });
}

document.getElementById("medForm").addEventListener("submit", async e => {
  e.preventDefault();
  const cantidad = parseInt(document.getElementById("cantidad").value);
  const vencimiento = new Date(document.getElementById("vencimiento").value);

  if (cantidad <= 0) {
    alert("La cantidad debe ser mayor a 0");
    return;
  }
  if (vencimiento <= new Date()) {
    alert("La fecha de vencimiento debe ser futura");
    return;
  }

  const nuevo = {
    nombre: document.getElementById("nombre").value,
    codigoCUM: document.getElementById("codigoCUM").value || null,
    lote: document.getElementById("lote").value,
    cantidad,
    precioUnitario: parseFloat(document.getElementById("precioUnitario").value),
    vencimiento
  };
  await authFetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nuevo)
  });
  e.target.reset();
  cargarMedicamentos();
});

async function eliminarMedicamento(id) {
  if (!confirm("¿Eliminar este medicamento del inventario?")) return;
  await authFetch(`${API_URL}/${id}`, { method: "DELETE" });
  cargarMedicamentos();
}

async function abrirModal(id) {
  const res = await authFetch(`${API_URL}/${id}`);
  if (!res.ok) return;
  const med = await res.json();

  document.getElementById("editId").value = med.idMedicamento;
  document.getElementById("editNombre").value = med.nombre;
  document.getElementById("editCodigoCUM").value = med.codigoCUM || "";
  document.getElementById("editLote").value = med.lote;
  document.getElementById("editCantidad").value = med.cantidad;
  document.getElementById("editPrecioUnitario").value = med.precioUnitario;
  document.getElementById("editVencimiento").value = med.vencimiento.split("T")[0];
  new bootstrap.Modal(document.getElementById("editModal")).show();
}

document.getElementById("editForm").addEventListener("submit", async e => {
  e.preventDefault();
  const id = document.getElementById("editId").value;
  const cantidad = parseInt(document.getElementById("editCantidad").value);
  const vencimiento = new Date(document.getElementById("editVencimiento").value);

  if (cantidad <= 0) {
    alert("La cantidad debe ser mayor a 0");
    return;
  }
  if (vencimiento <= new Date()) {
    alert("La fecha de vencimiento debe ser futura");
    return;
  }

  const actualizado = {
    nombre: document.getElementById("editNombre").value,
    codigoCUM: document.getElementById("editCodigoCUM").value || null,
    lote: document.getElementById("editLote").value,
    cantidad,
    precioUnitario: parseFloat(document.getElementById("editPrecioUnitario").value),
    vencimiento
  };
  await authFetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(actualizado)
  });
  cargarMedicamentos();
  bootstrap.Modal.getInstance(document.getElementById("editModal")).hide();
});

async function verHistorial(id, nombre) {
  const res = await authFetch(`${API_URL}/${id}/movimientos`);
  const movimientos = await res.json();

  document.getElementById("historialNombreMed").textContent = nombre;
  const tbody = document.getElementById("historialTable");
  tbody.innerHTML = "";

  if (movimientos.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Sin movimientos registrados.</td></tr>`;
  } else {
    const clasesTipo = { Entrada: "bg-success", Salida: "bg-primary", Ajuste: "bg-warning text-dark", Devolucion: "bg-info" };
    movimientos.forEach(m => {
      tbody.innerHTML += `
        <tr>
          <td>${new Date(m.createdAt).toLocaleString("es-CO")}</td>
          <td><span class="badge ${clasesTipo[m.tipo] || "bg-secondary"}">${m.tipo}</span></td>
          <td>${m.cantidad}</td>
          <td>${m.cantidadResultante}</td>
          <td>${m.usuarioNombre}</td>
          <td>${m.motivo || "—"}</td>
        </tr>`;
    });
  }

  new bootstrap.Modal(document.getElementById("historialModal")).show();
}

cargarMedicamentos();
