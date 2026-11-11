import MovimientoInventario from "../models/MovimientoInventario.js";
import Usuario from "../models/Usuario.js";

export async function registrarMovimiento({
  medicamento, tipo, cantidad, cantidadResultante, prescripcionId, usuarioId, motivo, transaction
}) {
  const usuario = await Usuario.findByPk(usuarioId, { transaction });
  return await MovimientoInventario.create({
    medicamentoId: medicamento.idMedicamento,
    medicamentoNombre: medicamento.nombre,
    lote: medicamento.lote,
    tipo,
    cantidad,
    cantidadResultante,
    prescripcionId: prescripcionId || null,
    usuarioId,
    usuarioNombre: usuario ? usuario.nombre : "Usuario desconocido",
    motivo: motivo || null
  }, { transaction });
}

export async function listarMovimientos() {
  return await MovimientoInventario.findAll({ order: [["createdAt", "DESC"]] });
}

export async function listarMovimientosPorMedicamento(medicamentoId) {
  return await MovimientoInventario.findAll({
    where: { medicamentoId },
    order: [["createdAt", "DESC"]]
  });
}
