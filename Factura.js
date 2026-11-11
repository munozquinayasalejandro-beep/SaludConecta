import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

// IMPORTANTE — alcance real de este modelo:
// Esta factura reúne los datos que una factura electrónica colombiana debe llevar
// (emisor, receptor, ítems, impuestos, numeración consecutiva), pero NO es una
// factura electrónica válida ante la DIAN. Para serlo, hace falta:
//   1) Un NIT real con resolución de facturación vigente.
//   2) Firma digital con certificado válido.
//   3) Transmisión a través de un proveedor tecnológico autorizado (o el
//      facturador gratuito de la DIAN), que devuelve el CUFE real.
// El campo "cufe" queda nulo a propósito: generarlo aquí sería simular una
// validación que no existe.
const Factura = sequelize.define("Factura", {
  idFactura: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  numero: {
    // Numeración consecutiva propia (no es la numeración autorizada por la DIAN,
    // que requiere solicitarse formalmente junto con la resolución de facturación).
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  prescripcionId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  pacienteId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  pacienteNombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pacienteTipoDocumento: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pacienteDocumento: {
    type: DataTypes.STRING,
    allowNull: false
  },
  medicamentoNombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  medicamentoCUM: {
    type: DataTypes.STRING,
    allowNull: true
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  valorUnitario: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  subtotal: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  ivaPorcentaje: {
    // Los medicamentos incluidos en el POS son un bien excluido de IVA
    // (Estatuto Tributario, Art. 424), por eso el valor por defecto es 0.
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  ivaValor: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  total: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Generada" // Generada -> Anulada
  },
  motivoAnulacion: {
    type: DataTypes.STRING,
    allowNull: true
  },
  cufe: {
    // Se deja nulo intencionalmente: ver nota superior.
    type: DataTypes.STRING,
    allowNull: true
  }
});

export default Factura;
