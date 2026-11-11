import {
  crearPrescripcion,
  listarPrescripciones,
  listarPrescripcionesPorPaciente,
  dispensarPrescripcion,
  cancelarPrescripcion
} from "../services/prescripcionService.js";

export async function listar(req, res) {
  try {
    const { pacienteId } = req.query;
    const prescripciones = pacienteId
      ? await listarPrescripcionesPorPaciente(pacienteId)
      : await listarPrescripciones();
    res.json(prescripciones);
  } catch (error) {
    console.error("Error al listar prescripciones:", error);
    res.status(500).json({ error: "Error interno al listar prescripciones" });
  }
}

export async function crear(req, res) {
  try {
    const { pacienteId, medicamentoId, diagnostico, codigoCIE10, dosis, frecuencia, duracionDias, unidades } = req.body;

    if (!pacienteId || !medicamentoId || !diagnostico || !codigoCIE10 || !dosis || !frecuencia || !duracionDias) {
      return res.status(400).json({
        error: "pacienteId, medicamentoId, diagnostico, codigoCIE10, dosis, frecuencia y duracionDias son obligatorios"
      });
    }

    const prescripcion = await crearPrescripcion({
      pacienteId,
      medicamentoId,
      medicoId: req.usuario.id,
      diagnostico,
      codigoCIE10,
      dosis,
      frecuencia,
      duracionDias,
      unidades
    });

    res.json({ mensaje: "Prescripción registrada correctamente", prescripcion });
  } catch (error) {
    if (error.codigo) return res.status(400).json({ error: error.message });
    console.error("Error al crear prescripción:", error);
    res.status(500).json({ error: "Error interno al crear la prescripción" });
  }
}

export async function dispensar(req, res) {
  try {
    const { prescripcion, factura } = await dispensarPrescripcion(req.params.id, req.usuario.id);
    res.json({
      mensaje: factura
        ? `Prescripción dispensada correctamente. Factura ${factura.numero} generada.`
        : "Prescripción dispensada correctamente",
      prescripcion,
      factura
    });
  } catch (error) {
    if (error.codigo) return res.status(400).json({ error: error.message });
    console.error("Error al dispensar prescripción:", error);
    res.status(500).json({ error: "Error interno al dispensar la prescripción" });
  }
}

export async function cancelar(req, res) {
  try {
    const prescripcion = await cancelarPrescripcion(req.params.id);
    res.json({ mensaje: "Prescripción cancelada correctamente", prescripcion });
  } catch (error) {
    if (error.codigo) return res.status(400).json({ error: error.message });
    console.error("Error al cancelar prescripción:", error);
    res.status(500).json({ error: "Error interno al cancelar la prescripción" });
  }
}
