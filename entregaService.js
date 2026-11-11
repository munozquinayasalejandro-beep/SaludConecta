import Entrega from "../models/Entrega.js";

export async function crearEntrega(data) {
  return await Entrega.create(data);
}

export async function obtenerEntregas() {
  return await Entrega.findAll();
}

export async function obtenerEntregaPorId(id) {
  return await Entrega.findByPk(id);
}

export async function actualizarEntrega(id, data) {
  const entrega = await Entrega.findByPk(id);
  if (!entrega) return null;
  return await entrega.update(data);
}

export async function eliminarEntrega(id) {
  const entrega = await Entrega.findByPk(id);
  if (!entrega) return null;
  await entrega.destroy();
  return entrega;
}

