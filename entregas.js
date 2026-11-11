const API_URL = "/entregas";

async function cargarEntregas() {
  const res = await authFetch(API_URL);
  const data = await res.json();
  const tbody = document.getElementById("entTable");
  tbody.innerHTML = "";
  data.forEach(ent => {
    tbody.innerHTML += `
      <tr>
        <td>${ent.idEntrega}</td>
        <td>${ent.paciente}</td>
        <td>${ent.medicamento}</td>
        <td>${ent.estado}</td>
        <td>
          <button class="btn btn-info btn-sm" onclick="actualizarEstado(${ent.idEntrega}, 'En camino')">En camino</button>
          <button class="btn btn-success btn-sm" onclick="actualizarEstado(${ent.idEntrega}, 'Entregado')">Entregado</button>
          <button class="btn btn-danger btn-sm" onclick="eliminarEntrega(${ent.idEntrega})">Eliminar</button>
        </td>
      </tr>`;
  });
}

document.getElementById("entForm").addEventListener("submit", async e => {
  e.preventDefault();
  const nueva = {
    paciente: document.getElementById("paciente").value,
    medicamento: document.getElementById("medicamento").value
  };
  await authFetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nueva)
  });
  cargarEntregas();
});

async function actualizarEstado(id, estado) {
  await authFetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado })
  });
  cargarEntregas();
}

async function eliminarEntrega(id) {
  await authFetch(`${API_URL}/${id}`, { method: "DELETE" });
  cargarEntregas();
}

cargarEntregas();

