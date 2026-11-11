import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Paciente = sequelize.define("Paciente", {
  idPaciente: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tipoDocumento: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "CC"
  },
  edad: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  documento: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: true
  },
  direccion: {
    type: DataTypes.STRING,
    allowNull: true
  },
  epsRegimen: {
    type: DataTypes.STRING,
    allowNull: true
  },
  alergias: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "Ninguna conocida"
  },
  antecedentes: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

export default Paciente;

