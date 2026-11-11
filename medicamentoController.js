import {
  crearMedicamento,
  obtenerMedicamentos,
  obtenerMedicamentoPorId,
  actualizarMedicamento,
  eliminarMedicamento
} from "../services/medicamentoService.js";
import { listarMovimientosPorMedicamento, listarMovimientos } from "../services/movimientoService.js";

export async function listarMedicamentos(req, res) {
  const medicamentos = await obtenerMedicamentos();
  res.json(medicamentos);
}

export async function crear(req, res) {
  try {
    const nuevo = await crearMedicamento(req.body, req.usuario.id);
    res.json(nuevo);
  } catch (error) {
    console.error("Error al crear medicamento:", error);
    res.status(500).json({ error: "Error interno al crear el medicamento" });
  }
}

export async function detalle(req, res) {
  const medicamento = await obtenerMedicamentoPorId(req.params.id);
  if (!medicamento) return res.status(404).json({ error: "No encontrado" });
  res.json(medicamento);
}

export async function actualizar(req, res) {
  try {
    const actualizado = await actualizarMedicamento(req.params.id, req.body, req.usuario.id);
    if (!actualizado) return res.status(404).json({ error: "No encontrado" });
    res.json(actualizado);
  } catch (error) {
    console.error("Error al actualizar medicamento:", error);
    res.status(500).json({ error: "Error interno al actualizar el medicamento" });
  }
}

export async function eliminar(req, res) {
  const eliminado = await eliminarMedicamento(req.params.id);
  if (!eliminado) return res.status(404).json({ error: "No encontrado" });
  res.json({ mensaje: "Eliminado correctamente" });
}

export async function historial(req, res) {
  const movimientos = await listarMovimientosPorMedicamento(req.params.id);
  res.json(movimientos);
}

export async function historialGeneral(req, res) {
  const movimientos = await listarMovimientos();
  res.json(movimientos);
}
