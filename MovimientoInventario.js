import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

// Registra CADA movimiento de inventario: entradas (compras), salidas (dispensación
// de una prescripción), ajustes manuales y devoluciones. Es lo que permite responder,
// para cualquier unidad, "¿de dónde vino y a dónde fue?" — el requisito central de
// trazabilidad en un sistema de entrega de medicamentos.
const MovimientoInventario = sequelize.define("MovimientoInventario", {
  idMovimiento: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  medicamentoId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  medicamentoNombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lote: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tipo: {
    // Entrada: llegó al inventario (compra/donación).
    // Salida: se dispensó por una prescripción.
    // Ajuste: corrección manual (conteo físico, unidad dañada, vencida, etc.).
    // Devolucion: un paciente o repartidor devuelve unidades al inventario.
    type: DataTypes.ENUM("Entrada", "Salida", "Ajuste", "Devolucion"),
    allowNull: false
  },
  cantidad: {
    // Siempre positiva; el signo lo determina "tipo", no el número.
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cantidadResultante: {
    // Stock del medicamento inmediatamente después de este movimiento (auditoría).
    type: DataTypes.INTEGER,
    allowNull: false
  },
  prescripcionId: {
    // Solo aplica para movimientos tipo "Salida" originados por dispensación.
    type: DataTypes.INTEGER,
    allowNull: true
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  usuarioNombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  motivo: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

export default MovimientoInventario;
