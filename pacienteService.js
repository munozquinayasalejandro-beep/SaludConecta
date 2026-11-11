import { Op } from "sequelize";
import Paciente from "../models/Paciente.js";

export async function crearPaciente(data) {
  return await Paciente.create(data);
}

export async function obtenerPacientes(termino) {
  if (!termino) return await Paciente.findAll({ order: [["nombre", "ASC"]] });
  return await Paciente.findAll({
    where: {
      [Op.or]: [
        { nombre: { [Op.like]: `%${termino}%` } },
        { documento: { [Op.like]: `%${termino}%` } }
      ]
    },
    order: [["nombre", "ASC"]]
  });
}

export async function obtenerPacientePorId(id) {
  return await Paciente.findByPk(id);
}

export async function actualizarPaciente(id, data) {
  const paciente = await Paciente.findByPk(id);
  if (!paciente) return null;
  return await paciente.update(data);
}

export async function eliminarPaciente(id) {
  const paciente = await Paciente.findByPk(id);
  if (!paciente) return null;
  await paciente.destroy();
  return paciente;
}

