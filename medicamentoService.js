import Medicamento from "../models/Medicamento.js";
import { registrarMovimiento } from "./movimientoService.js";

const DIAS_ALERTA_VENCIMIENTO = 30;

function calcularEstadoVencimiento(vencimiento) {
  const hoy = new Date();
  const fechaVencimiento = new Date(vencimiento);
  const diasRestantes = Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24));

  if (diasRestantes < 0) return { estadoVencimiento: "Vencido", diasParaVencer: diasRestantes };
  if (diasRestantes <= DIAS_ALERTA_VENCIMIENTO) return { estadoVencimiento: "Por vencer", diasParaVencer: diasRestantes };
  return { estadoVencimiento: "Vigente", diasParaVencer: diasRestantes };
}

function conEstadoVencimiento(medicamento) {
  const plano = medicamento.toJSON ? medicamento.toJSON() : medicamento;
  return { ...plano, ...calcularEstadoVencimiento(plano.vencimiento) };
}

export async function crearMedicamento(data, usuarioId) {
  const nuevo = await Medicamento.create(data);

  await registrarMovimiento({
    medicamento: nuevo,
    tipo: "Entrada",
    cantidad: nuevo.cantidad,
    cantidadResultante: nuevo.cantidad,
    usuarioId,
    motivo: "Registro inicial en inventario"
  });

  return nuevo;
}

export async function obtenerMedicamentos() {
  const medicamentos = await Medicamento.findAll();
  return medicamentos.map(conEstadoVencimiento);
}

export async function obtenerMedicamentoPorId(id) {
  const medicamento = await Medicamento.findByPk(id);
  return medicamento ? conEstadoVencimiento(medicamento) : null;
}

export async function actualizarMedicamento(id, data, usuarioId) {
  const medicamento = await Medicamento.findByPk(id);
  if (!medicamento) return null;

  const cantidadAnterior = medicamento.cantidad;
  const actualizado = await medicamento.update(data);

  // Si la cantidad cambió manualmente (edición desde el modal), se registra
  // como un Ajuste para no perder la trazabilidad de ese cambio.
  if (typeof data.cantidad === "number" && data.cantidad !== cantidadAnterior) {
    const diferencia = data.cantidad - cantidadAnterior;
    await registrarMovimiento({
      medicamento: actualizado,
      tipo: "Ajuste",
      cantidad: Math.abs(diferencia),
      cantidadResultante: actualizado.cantidad,
      usuarioId,
      motivo: diferencia > 0
        ? `Ajuste manual: incremento de ${diferencia} unidades`
        : `Ajuste manual: reducción de ${Math.abs(diferencia)} unidades`
    });
  }

  return actualizado;
}

export async function eliminarMedicamento(id) {
  const medicamento = await Medicamento.findByPk(id);
  if (!medicamento) return null;
  await medicamento.destroy();
  return medicamento;
}
