// backend/models/MovimientoInventario.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Producto from "./Producto.js";
import Usuario from "./Usuario.js";

const MovimientoInventario = sequelize.define(
  "MovimientoInventario",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    productoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // entrada = agregan stock
    // salida = venta o uso interno
    tipo: {
      type: DataTypes.ENUM("entrada", "salida"),
      allowNull: false,
    },

    // cuántas unidades entran o salen
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    motivo: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // boleta que originó la salida (si es venta)
    boletaId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    // quién registró el movimiento
    usuarioId: {
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
    freezeTableName: true,
  }
);

// Relaciones
MovimientoInventario.belongsTo(Producto, {
  foreignKey: "productoId",
  as: "producto",
});

MovimientoInventario.belongsTo(Usuario, {
  foreignKey: "usuarioId",
  as: "usuario",
});

export default MovimientoInventario;
