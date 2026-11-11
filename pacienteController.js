import {
  crearPaciente,
  obtenerPacientes,
  obtenerPacientePorId,
  actualizarPaciente,
  eliminarPaciente
} from "../services/pacienteService.js";
import { crearEntrega } from "../services/entregaService.js";

export async function listarPacientes(req, res) {
  const pacientes = await obtenerPacientes(req.query.q);
  res.json(pacientes);
}

export async function crear(req, res) {
  const nuevo = await crearPaciente(req.body);
  res.json(nuevo);
}

export async function detalle(req, res) {
  const paciente = await obtenerPacientePorId(req.params.id);
  if (!paciente) return res.status(404).json({ error: "No encontrado" });
  res.json(paciente);
}

export async function actualizar(req, res) {
  const actualizado = await actualizarPaciente(req.params.id, req.body);
  if (!actualizado) return res.status(404).json({ error: "No encontrado" });
  res.json(actualizado);
}

export async function eliminar(req, res) {
  const eliminado = await eliminarPaciente(req.params.id);
  if (!eliminado) return res.status(404).json({ error: "No encontrado" });
  res.json({ mensaje: "Eliminado correctamente" });
}

export async function solicitarMedicamento(req, res) {
  const { paciente, medicamento, dosis, regimen, unidades } = req.body;

  if (!paciente || !medicamento) {
    return res.status(400).json({ error: "Paciente y medicamento son obligatorios" });
  }

  const solicitud = await crearEntrega({
    paciente,
    medicamento,
    dosis: dosis || null,
    regimen: regimen || null,
    unidades: unidades ? parseInt(unidades) : null,
    estado: "Pendiente"
  });

  res.json({ mensaje: "Solicitud registrada correctamente", solicitud });
}

