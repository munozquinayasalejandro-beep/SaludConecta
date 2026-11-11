import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

// Una Prescripcion es la orden médica formal: qué medicamento, en qué dosis,
// con qué frecuencia y por cuánto tiempo, emitida por un usuario con rol médico
// para un paciente concreto. Es distinta de una Entrega (solicitud rápida sin
// respaldo clínico) y de un Medicamento (el ítem de inventario).
const Prescripcion = sequelize.define("Prescripcion", {
  idPrescripcion: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  pacienteId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  medicamentoId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  medicamentoNombre: {
    // Copia del nombre al momento de prescribir, para conservar el historial
    // legible aunque el medicamento cambie de nombre o se elimine del inventario.
    type: DataTypes.STRING,
    allowNull: false
  },
  medicoId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  medicoNombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  diagnostico: {
    type: DataTypes.STRING,
    allowNull: false
  },
  codigoCIE10: {
    // Código estándar de diagnóstico (Clasificación Internacional de Enfermedades,
    // 10ª versión), exigido por el Ministerio de Salud en cualquier reporte oficial
    // (incluido RIPS). El campo "diagnostico" sigue existiendo como descripción
    // legible; este es el código formal.
    type: DataTypes.STRING,
    allowNull: false
  },
  dosis: {
    type: DataTypes.STRING,
    allowNull: false
  },
  frecuencia: {
    type: DataTypes.STRING,
    allowNull: false
  },
  duracionDias: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  unidades: {
    // Cuántas unidades del medicamento se descuentan del inventario al dispensar.
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Pendiente" // Pendiente -> Dispensada | Cancelada
  }
});

export default Prescripcion;
