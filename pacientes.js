// pacientes.js — Módulo de Pacientes y Prescripciones (SaludConecta)

const API_PACIENTES = "/pacientes";
const API_PRESCRIPCIONES = "/prescripciones";
const API_MEDICAMENTOS = "/medicamentos";

let pacienteSeleccionadoId = null;
const rol = localStorage.getItem("rol");
const PUEDE_PRESCRIBIR = rol === "medico" || rol === "admin";
const PUEDE_EDITAR_PACIENTE = rol === "medico" || rol === "admin";

// --- Guard de sesión: si no hay token, no tiene sentido seguir cargando la vista ---
if (!localStorage.getItem("token")) {
  window.location.href = "/vista/login.html";
}

// ============================================================
// Utilidades
// ============================================================
function badgeEstado(estado) {
  const clase = estado === "Dispensada" ? "badge-dispensada"
    : estado === "Cancelada" ? "badge-cancelada"
    : "badge-pendiente";
  return `<span class="badge ${clase}">${estado}</span>`;
}

function formatearFecha(fechaISO) {
  if (!fechaISO) return "—";
  return new Date(fechaISO).toLocaleDateString("es-CO");
}

// ============================================================
// Inventario de medicamentos en los selects (con stock visible)
// ============================================================
async function cargarMedicamentosEnSelects() {
  try {
    const res = await authFetch(API_MEDICAMENTOS);
    const medicamentos = await res.json();

    const opciones = medicamentos
      .map(m => `<option value="${m.idMedicamento}" ${m.cantidad <= 0 ? "disabled" : ""}>
        ${m.nombre} (stock: ${m.cantidad}${m.cantidad <= 0 ? " — agotado" : ""})
      </option>`)
      .join("");

    const selectRx = document.getElementById("rx-medicamento");
    if (selectRx) selectRx.innerHTML = `<option value="" disabled selected>Selecciona un medicamento</option>${opciones}`;

    const selectSolicitud = document.getElementById("medicamento-select");
    if (selectSolicitud) {
      selectSolicitud.innerHTML = `<option value="" disabled selected>Escoge un medicamento</option>` +
        medicamentos.map(m => `<option value="${m.nombre}">${m.nombre} (stock: ${m.cantidad})</option>`).join("");
    }
  } catch (error) {
    console.error("Error al cargar medicamentos:", error);
  }
}

// ============================================================
// Listado y búsqueda de pacientes
// ============================================================
async function cargarPacientes(termino) {
  try {
    const url = termino ? `${API_PACIENTES}?q=${encodeURIComponent(termino)}` : API_PACIENTES;
    const res = await authFetch(url);
    const pacientes = await res.json();

    const tbody = document.getElementById("pacTable");
    tbody.innerHTML = "";

    if (pacientes.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#999;">No se encontraron pacientes.</td></tr>`;
      return;
    }

    pacientes.forEach(p => {
      tbody.innerHTML += `
        <tr>
          <td>${p.nombre}</td>
          <td>${p.tipoDocumento || ""} ${p.documento}</td>
          <td>${p.edad}</td>
          <td>${p.telefono || "—"}</td>
          <td>${p.epsRegimen || "—"}</td>
          <td>
            <button class="btn-mini ver" onclick="seleccionarPaciente(${p.idPaciente})">Ver</button>
            ${PUEDE_EDITAR_PACIENTE ? `<button class="btn-mini editar" onclick="abrirEdicionPaciente(${p.idPaciente})">Editar</button>` : ""}
            ${PUEDE_EDITAR_PACIENTE ? `<button class="btn-mini eliminar" onclick="eliminarPaciente(${p.idPaciente})">Eliminar</button>` : ""}
          </td>
        </tr>`;
    });
  } catch (error) {
    console.error("Error al cargar pacientes:", error);
  }
}

document.getElementById("btn-buscar-paciente").addEventListener("click", () => {
  cargarPacientes(document.getElementById("buscador-paciente").value.trim());
});
document.getElementById("buscador-paciente").addEventListener("keyup", e => {
  if (e.key === "Enter") cargarPacientes(e.target.value.trim());
});
document.getElementById("btn-limpiar-busqueda").addEventListener("click", () => {
  document.getElementById("buscador-paciente").value = "";
  cargarPacientes();
});

// ============================================================
// Perfil del paciente seleccionado + historial de prescripciones
// ============================================================
async function seleccionarPaciente(id) {
  try {
    const res = await authFetch(`${API_PACIENTES}/${id}`);
    if (!res.ok) return;
    const paciente = await res.json();

    pacienteSeleccionadoId = id;
    document.getElementById("panel-perfil-paciente").classList.remove("oculto");
    document.getElementById("perfil-nombre-paciente").textContent = paciente.nombre;

    document.getElementById("perfil-datos-container").innerHTML = `
      <div class="info-group"><label>Documento</label><p>${paciente.tipoDocumento || ""} ${paciente.documento}</p></div>
      <div class="info-group"><label>Edad</label><p>${paciente.edad} años</p></div>
      <div class="info-group"><label>Teléfono</label><p>${paciente.telefono || "No registrado"}</p></div>
      <div class="info-group"><label>Dirección</label><p>${paciente.direccion || "No registrada"}</p></div>
      <div class="info-group"><label>EPS / Régimen</label><p>${paciente.epsRegimen || "No registrado"}</p></div>
      <div class="info-group"><label>Alergias</label><p>${paciente.alergias || "Ninguna conocida"}</p></div>
      <div class="info-group"><label>Antecedentes médicos</label><p>${paciente.antecedentes || "Sin antecedentes registrados"}</p></div>
    `;

    if (PUEDE_PRESCRIBIR) {
      document.getElementById("seccion-nueva-prescripcion").classList.remove("oculto");
    }

    await cargarPrescripciones(id);
    document.getElementById("panel-perfil-paciente").scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    console.error("Error al seleccionar paciente:", error);
  }
}

document.getElementById("btn-deseleccionar").addEventListener("click", () => {
  pacienteSeleccionadoId = null;
  document.getElementById("panel-perfil-paciente").classList.add("oculto");
  document.getElementById("seccion-nueva-prescripcion").classList.add("oculto");
});

async function cargarPrescripciones(pacienteId) {
  try {
    const res = await authFetch(`${API_PRESCRIPCIONES}?pacienteId=${pacienteId}`);
    const prescripciones = await res.json();

    const tbody = document.getElementById("prescripcionesTable");
    tbody.innerHTML = "";

    if (prescripciones.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#999;">Este paciente no tiene prescripciones registradas.</td></tr>`;
      return;
    }

    prescripciones.forEach(rx => {
      const acciones = rx.estado === "Pendiente" && PUEDE_PRESCRIBIR
        ? `<button class="btn-mini dispensar" onclick="dispensarPrescripcion(${rx.idPrescripcion})">Dispensar</button>
           <button class="btn-mini cancelar" onclick="cancelarPrescripcion(${rx.idPrescripcion})">Cancelar</button>`
        : "—";

      tbody.innerHTML += `
        <tr>
          <td>${rx.medicamentoNombre}</td>
          <td>${rx.dosis}</td>
          <td>${rx.frecuencia}</td>
          <td>${rx.duracionDias} días</td>
          <td>${rx.diagnostico} <span style="color:#888;">(${rx.codigoCIE10})</span></td>
          <td>${rx.medicoNombre}</td>
          <td>${badgeEstado(rx.estado)}</td>
          <td>${acciones}</td>
        </tr>`;
    });
  } catch (error) {
    console.error("Error al cargar prescripciones:", error);
  }
}

async function dispensarPrescripcion(id) {
  if (!confirm("¿Confirmar la dispensación? Esto descontará el medicamento del inventario.")) return;
  const res = await authFetch(`${API_PRESCRIPCIONES}/${id}/dispensar`, { method: "PUT" });
  const data = await res.json();
  if (!res.ok) {
    alert(data.error || "No se pudo dispensar la prescripción");
    return;
  }
  await cargarPrescripciones(pacienteSeleccionadoId);
  await cargarMedicamentosEnSelects();
}

async function cancelarPrescripcion(id) {
  if (!confirm("¿Cancelar esta prescripción?")) return;
  const res = await authFetch(`${API_PRESCRIPCIONES}/${id}/cancelar`, { method: "PUT" });
  const data = await res.json();
  if (!res.ok) {
    alert(data.error || "No se pudo cancelar la prescripción");
    return;
  }
  await cargarPrescripciones(pacienteSeleccionadoId);
}

// ============================================================
// Nueva Prescripción
// ============================================================
const prescripcionForm = document.getElementById("prescripcionForm");
prescripcionForm.addEventListener("submit", async e => {
  e.preventDefault();
  const mensaje = document.getElementById("mensaje-prescripcion");

  if (!pacienteSeleccionadoId) {
    mensaje.innerHTML = `<span class="text-danger">Selecciona un paciente antes de registrar la prescripción.</span>`;
    return;
  }

  const body = {
    pacienteId: pacienteSeleccionadoId,
    medicamentoId: parseInt(document.getElementById("rx-medicamento").value),
    diagnostico: document.getElementById("rx-diagnostico").value,
    codigoCIE10: document.getElementById("rx-cie10").value,
    dosis: document.getElementById("rx-dosis").value,
    frecuencia: document.getElementById("rx-frecuencia").value,
    duracionDias: parseInt(document.getElementById("rx-duracion").value),
    unidades: parseInt(document.getElementById("rx-unidades").value)
  };

  const res = await authFetch(API_PRESCRIPCIONES, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json();

  if (res.ok) {
    mensaje.innerHTML = `<span class="text-success">${data.mensaje}</span>`;
    prescripcionForm.reset();
    await cargarPrescripciones(pacienteSeleccionadoId);
  } else {
    mensaje.innerHTML = `<span class="text-danger">${data.error}</span>`;
  }
});

// ============================================================
// Registrar Paciente
// ============================================================
const pacForm = document.getElementById("pacForm");
pacForm.addEventListener("submit", async e => {
  e.preventDefault();
  const mensaje = document.getElementById("mensaje-paciente");

  const body = {
    nombre: document.getElementById("nombre").value,
    tipoDocumento: document.getElementById("tipoDocumento").value,
    documento: document.getElementById("documento").value,
    edad: parseInt(document.getElementById("edad").value),
    telefono: document.getElementById("telefono").value,
    direccion: document.getElementById("direccion").value,
    epsRegimen: document.getElementById("epsRegimen").value,
    alergias: document.getElementById("alergias").value || "Ninguna conocida",
    antecedentes: document.getElementById("antecedentes").value
  };

  const res = await authFetch(API_PACIENTES, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json();

  if (res.ok) {
    mensaje.innerHTML = `<span class="text-success">Paciente registrado correctamente</span>`;
    pacForm.reset();
    await cargarPacientes();
  } else {
    mensaje.innerHTML = `<span class="text-danger">${data.error || "No se pudo registrar el paciente"}</span>`;
  }
});

// ============================================================
// Editar Paciente (modal)
// ============================================================
async function abrirEdicionPaciente(id) {
  const res = await authFetch(`${API_PACIENTES}/${id}`);
  if (!res.ok) return;
  const p = await res.json();

  document.getElementById("editId").value = p.idPaciente;
  document.getElementById("editNombre").value = p.nombre;
  document.getElementById("editTipoDocumento").value = p.tipoDocumento || "CC";
  document.getElementById("editDocumento").value = p.documento;
  document.getElementById("editEdad").value = p.edad;
  document.getElementById("editTelefono").value = p.telefono || "";
  document.getElementById("editDireccion").value = p.direccion || "";
  document.getElementById("editEpsRegimen").value = p.epsRegimen || "";
  document.getElementById("editAlergias").value = p.alergias || "";
  document.getElementById("editAntecedentes").value = p.antecedentes || "";

  const modal = new bootstrap.Modal(document.getElementById("editPacienteModal"));
  modal.show();
}

document.getElementById("editPacienteForm").addEventListener("submit", async e => {
  e.preventDefault();
  const id = document.getElementById("editId").value;

  const body = {
    nombre: document.getElementById("editNombre").value,
    tipoDocumento: document.getElementById("editTipoDocumento").value,
    documento: document.getElementById("editDocumento").value,
    edad: parseInt(document.getElementById("editEdad").value),
    telefono: document.getElementById("editTelefono").value,
    direccion: document.getElementById("editDireccion").value,
    epsRegimen: document.getElementById("editEpsRegimen").value,
    alergias: document.getElementById("editAlergias").value,
    antecedentes: document.getElementById("editAntecedentes").value
  };

  const res = await authFetch(`${API_PACIENTES}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (res.ok) {
    bootstrap.Modal.getInstance(document.getElementById("editPacienteModal")).hide();
    await cargarPacientes();
    if (pacienteSeleccionadoId === parseInt(id)) await seleccionarPaciente(parseInt(id));
  } else {
    const data = await res.json();
    alert(data.error || "No se pudo actualizar el paciente");
  }
});

// ============================================================
// Eliminar Paciente
// ============================================================
async function eliminarPaciente(id) {
  if (!confirm("¿Eliminar este paciente? Esta acción no se puede deshacer.")) return;
  const res = await authFetch(`${API_PACIENTES}/${id}`, { method: "DELETE" });
  if (res.ok) {
    if (pacienteSeleccionadoId === id) {
      document.getElementById("panel-perfil-paciente").classList.add("oculto");
      pacienteSeleccionadoId = null;
    }
    await cargarPacientes();
  } else {
    const data = await res.json();
    alert(data.error || "No se pudo eliminar el paciente");
  }
}

// ============================================================
// Solicitud rápida de medicamento (sin prescripción formal)
// ============================================================
document.getElementById("form-solicitud-medicamento").addEventListener("submit", async e => {
  e.preventDefault();
  const mensaje = document.getElementById("mensaje-solicitud");

  const paciente = document.getElementById("sol-paciente").value;
  const medicamentoSelect = document.getElementById("medicamento-select");
  const regimenSelect = document.getElementById("regimen-select");
  const medicamento = medicamentoSelect.options[medicamentoSelect.selectedIndex].text;
  const regimen = regimenSelect.options[regimenSelect.selectedIndex].text;
  const dosis = document.getElementById("dosis-input").value;
  const unidades = document.getElementById("unidades-input").value;

  const res = await authFetch(`${API_PACIENTES}/solicitudes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paciente, medicamento, dosis, regimen, unidades })
  });

  const data = await res.json();
  if (res.ok) {
    mensaje.innerHTML = `<span class="text-success">${data.mensaje}</span>`;
    e.target.reset();
  } else {
    mensaje.innerHTML = `<span class="text-danger">${data.error || "No se pudo registrar la solicitud"}</span>`;
  }
});

// ============================================================
// Inicialización
// ============================================================
cargarPacientes();
cargarMedicamentosEnSelects();
