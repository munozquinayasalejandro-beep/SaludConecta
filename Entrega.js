import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Entrega = sequelize.define("Entrega", {
  idEntrega: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  paciente: {
    type: DataTypes.STRING,
    allowNull: false
  },
  medicamento: {
    type: DataTypes.STRING,
    allowNull: false
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Pendiente"
  },
  dosis: {
    type: DataTypes.STRING,
    allowNull: true
  },
  regimen: {
    type: DataTypes.STRING,
    allowNull: true
  },
  unidades: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
});

export default Entrega;

