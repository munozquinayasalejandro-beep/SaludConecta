async function cargarDashboard() {
  // Medicamentos
  const medsRes = await authFetch("/medicamentos");
  const medicamentos = await medsRes.json();

  const stockDisponibles = medicamentos.reduce((acc, m) => acc + m.cantidad, 0);
  const stockPorVencer = medicamentos.filter(m => new Date(m.vencimiento) < new Date(Date.now() + 30*24*60*60*1000)).length;
  const stockVencidos = medicamentos.filter(m => new Date(m.vencimiento) < new Date()).length;

  new Chart(document.getElementById("stockChart"), {
    type: "pie",
    data: {
      labels: ["Disponibles", "Por vencer", "Vencidos"],
      datasets: [{
        data: [stockDisponibles, stockPorVencer, stockVencidos],
        backgroundColor: ["#1976D2", "#FBC02D", "#E53935"]
      }]
    }
  });

  // Entregas
  const entRes = await authFetch("/entregas");
  const entregas = await entRes.json();
  const pendientes = entregas.filter(e => e.estado === "Pendiente").length;
  const enCamino = entregas.filter(e => e.estado === "En camino").length;
  const entregadas = entregas.filter(e => e.estado === "Entregado").length;

  new Chart(document.getElementById("entregasChart"), {
    type: "bar",
    data: {
      labels: ["Pendientes", "En camino", "Entregadas"],
      datasets: [{
        label: "Entregas",
        data: [pendientes, enCamino, entregadas],
        backgroundColor: ["#FBC02D", "#1976D2", "#43A047"]
      }]
    }
  });

  // Tabla pacientes
  const pacRes = await authFetch("/pacientes");
  const pacientes = await pacRes.json();
  const pacTable = document.getElementById("pacTable");
  pacTable.innerHTML = "";
  pacientes.forEach(p => {
    pacTable.innerHTML += `<tr><td>${p.idPaciente}</td><td>${p.nombre}</td><td>${p.edad}</td><td>${p.documento}</td></tr>`;
  });

  // Tabla medicamentos
  const medTable = document.getElementById("medTable");
  medTable.innerHTML = "";
  medicamentos.forEach(m => {
    medTable.innerHTML += `<tr><td>${m.idMedicamento}</td><td>${m.nombre}</td><td>${m.lote}</td><td>${m.cantidad}</td><td>${new Date(m.vencimiento).toLocaleDateString()}</td></tr>`;
  });
}

cargarDashboard();

