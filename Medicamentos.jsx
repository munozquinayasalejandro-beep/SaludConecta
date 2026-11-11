// src/components/Medicamentos.jsx
// Módulo de gestión de medicamentos en React
// Autor: Alejandro
// Fecha: Julio 2026

import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:3000/medicamentos";

const Medicamentos = () => {
  const [medicamentos, setMedicamentos] = useState([]);
  const [nuevoMed, setNuevoMed] = useState({ nombre: "", lote: "", cantidad: "", vencimiento: "" });
  const [error, setError] = useState("");
  const [editandoId, setEditandoId] = useState(null); // Estado para controlar si estamos editando

  // Cargar medicamentos al montar el componente
  useEffect(() => {
    cargarMedicamentos();
  }, []);

  const cargarMedicamentos = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Error al obtener los datos del servidor");
      const data = await res.json();
      setMedicamentos(data);
    } catch (err) {
      setError("No se pudo conectar con el servidor. Inténtalo más tarde.");
    }
  };

  const handleChange = (e) => {
    setNuevoMed({ ...nuevoMed, [e.target.name]: e.target.value });
  };

  const guardarMedicamento = async (e) => {
    e.preventDefault();
    setError(""); // Limpiar errores previos

    // Validaciones básicas
    if (parseInt(nuevoMed.cantidad) <= 0) {
      setError("La cantidad debe ser mayor a 0.");
      return;
    }

    // Validación de fecha futura ajustando las horas a cero para evitar conflictos de zona horaria
    const fechaVencimiento = new Date(nuevoMed.vencimiento + "T00:00:00");
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaVencimiento < hoy) {
      setError("La fecha de vencimiento debe ser hoy o una fecha futura.");
      return;
    }

    try {
      const url = editandoId ? `${API_URL}/${editandoId}` : API_URL;
      const method = editandoId ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoMed),
      });

      if (!res.ok) throw new Error("No se pudo guardar el medicamento.");

      // Resetear estados
      setNuevoMed({ nombre: "", lote: "", cantidad: "", vencimiento: "" });
      setEditandoId(null);
      cargarMedicamentos();
    } catch (err) {
      setError(err.message);
    }
  };

  const iniciarEdicion = (med) => {
    setEditandoId(med.idMedicamento);
    // Ajustar el formato de fecha para el input type="date" (YYYY-MM-DD)
    const fechaFormateada = med.vencimiento.split("T")[0];
    setNuevoMed({
      nombre: med.nombre,
      lote: med.lote,
      cantidad: med.cantidad,
      vencimiento: fechaFormateada
    });
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setNuevoMed({ nombre: "", lote: "", cantidad: "", vencimiento: "" });
  };

  const eliminarMedicamento = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este medicamento?")) return;
    
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo eliminar el medicamento.");
      cargarMedicamentos();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container py-4">
      <h2 className="text-primary mb-4">Gestión de Medicamentos</h2>

      {/* Alerta de Error amigable en vez de un alert() molesto */}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Formulario con estructura correcta de rejilla de Bootstrap */}
      <form onSubmit={guardarMedicamento} className="row g-3 mb-5 p-3 bg-light border rounded">
        <h5 className="text-secondary">{editandoId ? "Editar Medicamento" : "Agregar Nuevo Medicamento"}</h5>
        
        <div className="col-md-3">
          <label className="form-label small fw-bold">Nombre</label>
          <input type="text" name="nombre" value={nuevoMed.nombre} onChange={handleChange} className="form-control" placeholder="Ej. Paracetamol" required />
        </div>
        
        <div className="col-md-3">
          <label className="form-label small fw-bold">Lote</label>
          <input type="text" name="lote" value={nuevoMed.lote} onChange={handleChange} className="form-control" placeholder="Ej. L-4512" required />
        </div>
        
        <div className="col-md-2">
          <label className="form-label small fw-bold">Cantidad</label>
          <input type="number" name="cantidad" value={nuevoMed.cantidad} onChange={handleChange} className="form-control" placeholder="0" required />
        </div>
        
        <div className="col-md-2">
          <label className="form-label small fw-bold">Vencimiento</label>
          <input type="date" name="vencimiento" value={nuevoMed.vencimiento} onChange={handleChange} className="form-control" required />
        </div>
        
        <div className="col-md-2 d-flex gap-2 align-items-end">
          <button type="submit" className={`btn w-100 ${editandoId ? 'btn-warning' : 'btn-success'}`}>
            {editandoId ? "Actualizar" : "Agregar"}
          </button>
          {editandoId && (
            <button type="button" onClick={cancelarEdicion} className="btn btn-secondary">✕</button>
          )}
        </div>
      </form>

      {/* Tabla de Datos */}
      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Lote</th>
              <th>Cantidad</th>
              <th>Vencimiento</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {medicamentos.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-muted py-3">No hay medicamentos registrados.</td>
              </tr>
            ) : (
              medicamentos.map((m) => (
                <tr key={m.idMedicamento}>
                  <td>{m.idMedicamento}</td>
                  <td className="fw-semibold">{m.nombre}</td>
                  <td><span className="badge bg-secondary">{m.lote}</span></td>
                  <td>{m.cantidad}</td>
                  <td>{new Date(m.vencimiento + "T00:00:00").toLocaleDateString()}</td>
                  <td className="text-center">
                    <button className="btn btn-primary btn-sm me-2" onClick={() => iniciarEdicion(m)}>Editar</button>
                    <button className="btn btn-danger btn-sm" onClick={() => eliminarMedicamento(m.idMedicamento)}>Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Medicamentos;