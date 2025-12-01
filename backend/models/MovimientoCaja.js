// backend/models/MovimientoCaja.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Usuario from "./Usuario.js";
const MovimientoCaja = sequelize.define(
  "MovimientoCaja",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // Relación con la caja del día
    cajaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // Quién registró el movimiento (recepcionista normalmente)
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // ingreso | gasto
    tipo: {
      type: DataTypes.ENUM("ingreso", "gasto"),
      allowNull: false,
    },

    // Ej: "Almuerzo", "Ingreso extra por donación", etc.
    descripcion: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // Monto del movimiento
    monto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    // Opcional: categoría para reportes
    categoria: {
      type: DataTypes.STRING,
      allowNull: true, // Ej: "almuerzo", "ingreso_extra", "ajuste"
    },
     // ⭐ NUEVO: método de pago usado en este movimiento
    metodoPago: {
      type: DataTypes.ENUM("efectivo", "tarjeta", "yape", "plin"),
      allowNull: true,
    },

    // ⭐ NUEVO: boleta origen (si viene de una boleta)
    boletaId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    fechaMovimiento: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    freezeTableName: true, // tabla 'MovimientoCaja'
  }
  
);


MovimientoCaja.belongsTo(Usuario, { foreignKey: "usuarioId", as: "usuario" });

export default MovimientoCaja;
