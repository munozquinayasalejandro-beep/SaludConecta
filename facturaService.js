import Factura from "../models/Factura.js";

export async function generarNumeroConsecutivo() {
  const total = await Factura.count();
  return `FE-${String(total + 1).padStart(6, "0")}`;
}

export async function crearFacturaPorDispensacion({ prescripcion, medicamento, paciente, transaction }) {
  const numero = await generarNumeroConsecutivo();
  const subtotal = medicamento.precioUnitario * prescripcion.unidades;
  const ivaPorcentaje = 0; // Medicamentos POS: bien excluido de IVA (Art. 424 E.T.)
  const ivaValor = subtotal * (ivaPorcentaje / 100);
  const total = subtotal + ivaValor;

  return await Factura.create({
    numero,
    prescripcionId: prescripcion.idPrescripcion,
    pacienteId: paciente.idPaciente,
    pacienteNombre: paciente.nombre,
    pacienteTipoDocumento: paciente.tipoDocumento,
    pacienteDocumento: paciente.documento,
    medicamentoNombre: medicamento.nombre,
    medicamentoCUM: medicamento.codigoCUM || null,
    cantidad: prescripcion.unidades,
    valorUnitario: medicamento.precioUnitario,
    subtotal,
    ivaPorcentaje,
    ivaValor,
    total,
    estado: "Generada"
  }, { transaction });
}

export async function listarFacturas() {
  return await Factura.findAll({ order: [["createdAt", "DESC"]] });
}

export async function obtenerFacturaPorId(id) {
  return await Factura.findByPk(id);
}

export async function anularFactura(id, motivo) {
  const factura = await Factura.findByPk(id);
  if (!factura) {
    const err = new Error("Factura no encontrada");
    err.codigo = "NO_ENCONTRADA";
    throw err;
  }
  if (factura.estado === "Anulada") {
    const err = new Error("La factura ya se encuentra anulada");
    err.codigo = "ESTADO_INVALIDO";
    throw err;
  }
  factura.estado = "Anulada";
  factura.motivoAnulacion = motivo || "Sin motivo especificado";
  return await factura.save();
}
