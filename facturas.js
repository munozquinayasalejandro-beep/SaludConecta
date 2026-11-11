const API_FACTURAS = "/facturas";
const rol = localStorage.getItem("rol");
const PUEDE_ANULAR = rol === "medico" || rol === "admin";

if (!localStorage.getItem("token")) {
  window.location.href = "/vista/login.html";
}

function formatoMoneda(valor) {
  return "$" + Number(valor).toLocaleString("es-CO", { minimumFractionDigits: 0 });
}

function badgeEstadoFactura(estado) {
  return estado === "Anulada"
    ? `<span class="badge badge-cancelada">Anulada</span>`
    : `<span class="badge badge-dispensada">Generada</span>`;
}

async function cargarFacturas() {
  const res = await authFetch(API_FACTURAS);
  const facturas = await res.json();
  const tbody = document.getElementById("facturasTable");
  tbody.innerHTML = "";

  if (facturas.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#999;">Aún no se han generado facturas. Se crean automáticamente al dispensar una prescripción.</td></tr>`;
    return;
  }

  facturas.forEach(f => {
    tbody.innerHTML += `
      <tr>
        <td>${f.numero}</td>
        <td>${new Date(f.createdAt).toLocaleDateString("es-CO")}</td>
        <td>${f.pacienteNombre}</td>
        <td>${f.medicamentoNombre} (x${f.cantidad})</td>
        <td>${formatoMoneda(f.total)}</td>
        <td>${badgeEstadoFactura(f.estado)}</td>
        <td>
          <button class="btn-mini ver" onclick="verFactura(${f.idFactura})">Ver / Imprimir</button>
          ${f.estado === "Generada" && PUEDE_ANULAR ? `<button class="btn-mini cancelar" onclick="anularFactura(${f.idFactura})">Anular</button>` : ""}
        </td>
      </tr>`;
  });
}

function plantillaFactura(f) {
  return `
    <div class="factura-header">
      <div>
        <h4 style="margin:0; color:#1F4E79;">SaludConecta S.A.S.</h4>
        <small>NIT: 900.000.000-0 (dato de prueba)<br>Sistema de gestión y entrega de medicamentos</small>
      </div>
      <div style="text-align:right;">
        <h5 style="margin:0;">Factura N.° ${f.numero}</h5>
        <small>Fecha: ${new Date(f.createdAt).toLocaleDateString("es-CO")}</small><br>
        <small>Estado: ${f.estado}</small>
      </div>
    </div>

    <p>
      <strong>Cliente / Paciente:</strong> ${f.pacienteNombre}<br>
      <strong>Documento:</strong> ${f.pacienteTipoDocumento} ${f.pacienteDocumento}
    </p>

    <table class="table table-sm table-bordered">
      <thead>
        <tr>
          <th>Código CUM</th>
          <th>Descripción</th>
          <th>Cantidad</th>
          <th>Valor unitario</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${f.medicamentoCUM || "—"}</td>
          <td>${f.medicamentoNombre}</td>
          <td>${f.cantidad}</td>
          <td>${formatoMoneda(f.valorUnitario)}</td>
          <td>${formatoMoneda(f.subtotal)}</td>
        </tr>
      </tbody>
    </table>

    <table style="width:100%; max-width:300px; margin-left:auto;">
      <tr><td>Subtotal</td><td style="text-align:right;">${formatoMoneda(f.subtotal)}</td></tr>
      <tr><td>IVA (${f.ivaPorcentaje}%)</td><td style="text-align:right;">${formatoMoneda(f.ivaValor)}</td></tr>
      <tr style="font-weight:bold; border-top:1px solid #333;"><td>Total</td><td style="text-align:right;">${formatoMoneda(f.total)}</td></tr>
    </table>

    ${f.ivaPorcentaje === 0 ? `<p style="font-size:0.8rem; color:#666; margin-top:10px;">
      Bien excluido de IVA conforme al Art. 424 del Estatuto Tributario (medicamento incluido en el POS).
    </p>` : ""}

    ${f.estado === "Anulada" ? `<p style="color:#c00; font-weight:bold;">FACTURA ANULADA. Motivo: ${f.motivoAnulacion || "No especificado"}</p>` : ""}

    <div class="factura-nota-legal">
      CUFE: ${f.cufe || "No generado — este documento es un prototipo interno y no constituye una factura electrónica válida ante la DIAN. Requiere transmisión a través de un proveedor tecnológico autorizado y firma digital."}
    </div>
  `;
}

async function verFactura(id) {
  const res = await authFetch(`${API_FACTURAS}/${id}`);
  if (!res.ok) return;
  const factura = await res.json();

  const html = plantillaFactura(factura);
  document.getElementById("contenidoFactura").innerHTML = html;
  document.getElementById("zonaImprimible").innerHTML = html;

  new bootstrap.Modal(document.getElementById("verFacturaModal")).show();
}

async function anularFactura(id) {
  const motivo = prompt("Motivo de anulación de la factura:");
  if (motivo === null) return;

  const res = await authFetch(`${API_FACTURAS}/${id}/anular`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ motivo })
  });
  const data = await res.json();

  if (res.ok) {
    await cargarFacturas();
  } else {
    alert(data.error || "No se pudo anular la factura");
  }
}

cargarFacturas();
