import { listarFacturas, obtenerFacturaPorId, anularFactura } from "../services/facturaService.js";

export async function listar(req, res) {
  const facturas = await listarFacturas();
  res.json(facturas);
}

export async function detalle(req, res) {
  const factura = await obtenerFacturaPorId(req.params.id);
  if (!factura) return res.status(404).json({ error: "Factura no encontrada" });
  res.json(factura);
}

export async function anular(req, res) {
  try {
    const factura = await anularFactura(req.params.id, req.body.motivo);
    res.json({ mensaje: "Factura anulada correctamente", factura });
  } catch (error) {
    if (error.codigo) return res.status(400).json({ error: error.message });
    console.error("Error al anular factura:", error);
    res.status(500).json({ error: "Error interno al anular la factura" });
  }
}
