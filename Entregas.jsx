// src/components/Entregas.jsx
// Módulo de gestión de entregas en React
// Permite crear, listar, actualizar estado y eliminar entregas.

import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:3000/entregas";

const Entregas = () => {
  const [entregas, setEntregas] = useState([]);
  const [nuevaEnt, setNuevaEnt] = useState({ paciente: "", medicamento: "" });

  useEffect(() => {
    cargarEntregas();
  }, []);

  const cargarEntregas = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setEntregas(data);
  };

  const handleChange = (e) => {
    setNuevaEnt({ ...nuevaEnt, [e.target.name]: e.target.value });
  };

  const agregarEntrega = async (e) => {
    e.preventDefault();
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevaEnt),
    });
    setNuevaEnt({ paciente: "", medicamento: "" });
    cargarEntregas();
  };

  const actualizarEstado = async (id, estado) => {
    await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    cargarEntregas();
  };

  const eliminarEntrega = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    cargarEntregas();
  };

  return (
    <div className="container py-4">
      <h2 className="text-primary">Gestión de Entregas</h2>
      <form onSubmit={agregarEntrega} className="row g-3 mb-4">
        <input type="text" name="paciente" placeholder="Paciente" value={nuevaEnt.paciente} onChange={handleChange} className="form-control col" required />
        <input type="text" name="medicamento" placeholder="Medicamento" value={nuevaEnt.medicamento} onChange={handleChange} className="form-control col" required />
        <button type="submit" className="btn btn-success col">Agregar</button>
      </form>

      <table className="table table-dark table-striped">
        <thead>
          <tr><th>ID</th><th>Paciente</th><th>Medicamento</th><th>Estado</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {entregas.map((e) => (
            <tr key={e.idEntrega}>
              <td>{e.idEntrega}</td>
              <td>{e.paciente}</td>
              <td>{e.medicamento}</td>
              <td>{e.estado}</td>
              <td>
                <button className="btn btn-info btn-sm" onClick={() => actualizarEstado(e.idEntrega, "En camino")}>En camino</button>
                <button className="btn btn-success btn-sm" onClick={() => actualizarEstado(e.idEntrega, "Entregado")}>Entregado</button>
                <button className="btn btn-danger btn-sm" onClick={() => eliminarEntrega(e.idEntrega)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Entregas;
