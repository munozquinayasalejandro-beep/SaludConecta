import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Medicamento = sequelize.define("Medicamento", {
  idMedicamento: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  codigoCUM: {
    // Código Único de Medicamento asignado por el INVIMA. Es el identificador
    // estándar que permite que cualquier sistema de salud colombiano (EPS, IPS,
    // MinSalud) reconozca exactamente qué medicamento es, sin depender del
    // nombre comercial que cada institución use.
    type: DataTypes.STRING,
    allowNull: true
  },
  lote: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  precioUnitario: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  vencimiento: {
    type: DataTypes.DATE,
    allowNull: false
  }
}); 

export default Medicamento;