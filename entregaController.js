import {
  crearEntrega,
  obtenerEntregas,
  obtenerEntregaPorId,
  actualizarEntrega,
  eliminarEntrega
} from "../services/entregaService.js";

export async function listarEntregas(req, res) {
  const entregas = await obtenerEntregas();
  res.json(entregas);
}

export async function crear(req, res) {
  const nueva = await crearEntrega(req.body);
  res.json(nueva);
}

export async function detalle(req, res) {
  const entrega = await obtenerEntregaPorId(req.params.id);
  if (!entrega) return res.status(404).json({ error: "No encontrada" });
  res.json(entrega);
}

export async function actualizar(req, res) {
  const actualizado = await actualizarEntrega(req.params.id, req.body);
  if (!actualizado) return res.status(404).json({ error: "No encontrada" });
  res.json(actualizado);
}

export async function eliminar(req, res) {
  const eliminado = await eliminarEntrega(req.params.id);
  if (!eliminado) return res.status(404).json({ error: "No encontrada" });
  res.json({ mensaje: "Eliminada correctamente" });
}

