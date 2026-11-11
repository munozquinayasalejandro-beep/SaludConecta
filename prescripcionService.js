import Prescripcion from "../models/Prescripcion.js";
import Medicamento from "../models/Medicamento.js";
import Paciente from "../models/Paciente.js";
import Usuario from "../models/Usuario.js";
import sequelize from "../config/database.js";
import { registrarMovimiento } from "./movimientoService.js";
import { crearFacturaPorDispensacion } from "./facturaService.js";

export async function crearPrescripcion({
  pacienteId, medicamentoId, medicoId, diagnostico, codigoCIE10, dosis, frecuencia, duracionDias, unidades
}) {
  const paciente = await Paciente.findByPk(pacienteId);
  if (!paciente) {
    const err = new Error("El paciente indicado no existe");
    err.codigo = "PACIENTE_NO_ENCONTRADO";
    throw err;
  }

  const medicamento = await Medicamento.findByPk(medicamentoId);
  if (!medicamento) {
    const err = new Error("El medicamento indicado no existe en el inventario");
    err.codigo = "MEDICAMENTO_NO_ENCONTRADO";
    throw err;
  }

  const medico = await Usuario.findByPk(medicoId);
  if (!medico) {
    const err = new Error("El usuario médico no existe");
    err.codigo = "MEDICO_NO_ENCONTRADO";
    throw err;
  }

  return await Prescripcion.create({
    pacienteId,
    medicamentoId,
    medicamentoNombre: medicamento.nombre,
    medicoId,
    medicoNombre: medico.nombre,
    diagnostico,
    codigoCIE10,
    dosis,
    frecuencia,
    duracionDias,
    unidades: unidades || 1,
    estado: "Pendiente"
  });
}

export async function listarPrescripciones() {
  return await Prescripcion.findAll({ order: [["createdAt", "DESC"]] });
}

export async function listarPrescripcionesPorPaciente(pacienteId) {
  return await Prescripcion.findAll({
    where: { pacienteId },
    order: [["createdAt", "DESC"]]
  });
}

export async function dispensarPrescripcion(id, usuarioId) {
  return await sequelize.transaction(async (t) => {
    const prescripcion = await Prescripcion.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!prescripcion) {
      const err = new Error("Prescripción no encontrada");
      err.codigo = "NO_ENCONTRADA";
      throw err;
    }
    if (prescripcion.estado !== "Pendiente") {
      const err = new Error(`La prescripción ya se encuentra en estado "${prescripcion.estado}"`);
      err.codigo = "ESTADO_INVALIDO";
      throw err;
    }

    const medicamento = await Medicamento.findByPk(prescripcion.medicamentoId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!medicamento) {
      const err = new Error("El medicamento asociado ya no existe en el inventario");
      err.codigo = "MEDICAMENTO_NO_ENCONTRADO";
      throw err;
    }
    if (medicamento.cantidad < prescripcion.unidades) {
      const err = new Error(
        `Stock insuficiente: quedan ${medicamento.cantidad} unidades de ${medicamento.nombre} y se requieren ${prescripcion.unidades}`
      );
      err.codigo = "STOCK_INSUFICIENTE";
      throw err;
    }

    medicamento.cantidad -= prescripcion.unidades;
    await medicamento.save({ transaction: t });

    prescripcion.estado = "Dispensada";
    await prescripcion.save({ transaction: t });

    const paciente = await Paciente.findByPk(prescripcion.pacienteId, { transaction: t });

    await registrarMovimiento({
      medicamento,
      tipo: "Salida",
      cantidad: prescripcion.unidades,
      cantidadResultante: medicamento.cantidad,
      prescripcionId: prescripcion.idPrescripcion,
      usuarioId,
      motivo: `Dispensación para el paciente ${paciente ? paciente.nombre : prescripcion.pacienteId} (Rx #${prescripcion.idPrescripcion})`,
      transaction: t
    });

    const factura = paciente
      ? await crearFacturaPorDispensacion({ prescripcion, medicamento, paciente, transaction: t })
      : null;

    return { prescripcion, factura };
  });
}

export async function cancelarPrescripcion(id) {
  const prescripcion = await Prescripcion.findByPk(id);
  if (!prescripcion) {
    const err = new Error("Prescripción no encontrada");
    err.codigo = "NO_ENCONTRADA";
    throw err;
  }
  if (prescripcion.estado !== "Pendiente") {
    const err = new Error(`No se puede cancelar: la prescripción ya está "${prescripcion.estado}"`);
    err.codigo = "ESTADO_INVALIDO";
    throw err;
  }
  prescripcion.estado = "Cancelada";
  return await prescripcion.save();
}
