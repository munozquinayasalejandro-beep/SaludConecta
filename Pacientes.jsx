// src/components/Pacientes.jsx
// Módulo de gestión de pacientes en React
// Permite crear, listar y eliminar pacientes.
// Cumple con estándares de codificación y buenas prácticas.

import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:3000/pacientes";

const Pacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [nuevoPac, setNuevoPac] = useState({ nombre: "", edad: "", documento: "" });

  useEffect(() => {
    cargarPacientes();
  }, []);

  const cargarPacientes = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setPacientes(data);
  };

  const handleChange = (e) => {
    setNuevoPac({ ...nuevoPac, [e.target.name]: e.target.value });
  };

  const agregarPaciente = async (e) => {
    e.preventDefault();
    if (nuevoPac.edad <= 0) {
      alert("La edad debe ser mayor a 0");
      return;
    }
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoPac),
    });
    setNuevoPac({ nombre: "", edad: "", documento: "" });
    cargarPacientes();
  };

  const eliminarPaciente = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    cargarPacientes();
  };

  return (
    <div className="container py-4">
      <h2 className="text-primary">Gestión de Pacientes</h2>
      <form onSubmit={agregarPaciente} className="row g-3 mb-4">
        <input type="text" name="nombre" placeholder="Nombre" value={nuevoPac.nombre} onChange={handleChange} className="form-control col" required />
        <input type="number" name="edad" placeholder="Edad" value={nuevoPac.edad} onChange={handleChange} className="form-control col" required />
        <input type="text" name="documento" placeholder="Documento" value={nuevoPac.documento} onChange={handleChange} className="form-control col" required />
        <button type="submit" className="btn btn-success col">Agregar</button>
      </form>

      <table className="table table-dark table-striped">
        <thead>
          <tr><th>ID</th><th>Nombre</th><th>Edad</th><th>Documento</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {pacientes.map((p) => (
            <tr key={p.idPaciente}>
              <td>{p.idPaciente}</td>
              <td>{p.nombre}</td>
              <td>{p.edad}</td>
              <td>{p.documento}</td>
              <td>
                <button className="btn btn-danger btn-sm" onClick={() => eliminarPaciente(p.idPaciente)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Pacientes;

