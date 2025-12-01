// backend/models/BoletaDetalle.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const BoletaDetalle = sequelize.define(
  "BoletaDetalle",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    boletaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Boleta",
        key: "id",
      },
    },

    productoId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Productos",
        key: "id",
      },
    },

    descripcion: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    precioUnitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    freezeTableName: true,
  }
);

BoletaDetalle.beforeCreate((detalle) => {
  detalle.subtotal = Number(detalle.cantidad) * Number(detalle.precioUnitario);
});

BoletaDetalle.beforeUpdate((detalle) => {
  detalle.subtotal = Number(detalle.cantidad) * Number(detalle.precioUnitario);
});

export default BoletaDetalle;
