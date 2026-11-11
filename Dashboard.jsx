import React, { useState, useEffect } from "react";
import { Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";

const Dashboard = () => {
  const [medicamentos, setMedicamentos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const medsRes = await fetch("http://localhost:3000/medicamentos");
    setMedicamentos(await medsRes.json());

    const pacRes = await fetch("http://localhost:3000/pacientes");
    setPacientes(await pacRes.json());

    const entRes = await fetch("http://localhost:3000/entregas");
    setEntregas(await entRes.json());
  };

  // Funciones de botones
  const seleccionarMedicamento = async (id) => {
    const res = await fetch(`http://localhost:3000/medicamentos/seleccionar/${id}`, {
      method: "POST"
    });
    const data = await res.json();
    alert(data.message);
  };

  const eliminarMedicamento = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este medicamento?")) {
      const res = await fetch(`http://localhost:3000/medicamentos/eliminar/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      alert(data.message);
      cargarDatos(); // refrescar lista
    }
  };

  const agregarMedicamento = () => {
    window.location.href = "/vista/agregarMedicamento";
  };

  const filtrarMedicamentos = async (nombre) => {
    setFiltro(nombre);
    const res = await fetch(`http://localhost:3000/medicamentos?nombre=${nombre}`);
    setMedicamentos(await res.json());
  };

  // Datos para gráficas
  const stockDisponibles = medicamentos.reduce((acc, m) => acc + m.cantidad, 0);
  const stockPorVencer = medicamentos.filter(m => new Date(m.vencimiento) < new Date(Date.now() + 30*24*60*60*1000)).length;
  const stockVencidos = medicamentos.filter(m => new Date(m.vencimiento) < new Date()).length;

  const pendientes = entregas.filter(e => e.estado === "Pendiente").length;
  const enCamino = entregas.filter(e => e.estado === "En camino").length;
  const entregadas = entregas.filter(e => e.estado === "Entregado").length;

  return (
    <div className="container py-4">
      <h2 className="text-primary mb-4">Dashboard Salud Conecta</h2>

      <div className="row mb-4">
        <div className="col-md-6">
          <Pie
            data={{
              labels: ["Disponibles", "Por vencer", "Vencidos"],
              datasets: [{
                data: [stockDisponibles, stockPorVencer, stockVencidos],
                backgroundColor: ["#1976D2", "#FBC02D", "#E53935"]
              }]
            }}
          />
        </div>
        <div className="col-md-6">
          <Bar
            data={{
              labels: ["Pendientes", "En camino", "Entregadas"],
              datasets: [{
                label: "Entregas",
                data: [pendientes, enCamino, entregadas],
                backgroundColor: ["#FBC02D", "#1976D2", "#43A047"]
              }]
            }}
          />
        </div>
      </div>

      <h3 className="text-info">Pacientes Registrados</h3>
      <table className="table table-dark table-striped mb-4">
        <thead><tr><th>ID</th><th>Nombre</th><th>Edad</th><th>Documento</th></tr></thead>
        <tbody>
          {pacientes.map(p => (
            <tr key={p.idPaciente}>
              <td>{p.idPaciente}</td>
              <td>{p.nombre}</td>
              <td>{p.edad}</td>
              <td>{p.documento}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="text-info">Medicamentos en Inventario</h3>

      <div className="mb-3">
        <input
          type="text"
          placeholder="Buscar medicamento..."
          value={filtro}
          onChange={(e) => filtrarMedicamentos(e.target.value)}
          className="form-control d-inline w-50"
        />
        <button
          className="btn btn-success ms-2"
          onClick={agregarMedicamento}
        >
          Agregar Medicamento
        </button>
      </div>

      <table className="table table-dark table-striped">
        <thead><tr><th>ID</th><th>Nombre</th><th>Lote</th><th>Cantidad</th><th>Vencimiento</th><th>Acciones</th></tr></thead>
        <tbody>
          {medicamentos.map(m => (
            <tr key={m.idMedicamento}>
              <td>{m.idMedicamento}</td>
              <td>{m.nombre}</td>
              <td>{m.lote}</td>
              <td>{m.cantidad}</td>
              <td>{new Date(m.vencimiento).toLocaleDateString()}</td>
              <td>
                <button
                  className="btn btn-info btn-sm me-2"
                  onClick={() => seleccionarMedicamento(m.idMedicamento)}
                >
                  Seleccionar
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => eliminarMedicamento(m.idMedicamento)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
