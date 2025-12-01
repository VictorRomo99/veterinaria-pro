// backend/models/Producto.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Producto = sequelize.define(
  "Productos", // 👈 nombre real de la tabla
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    nombre: { type: DataTypes.STRING, allowNull: false },
    descripcion: { type: DataTypes.STRING, allowNull: true },

    categoria: { type: DataTypes.STRING, allowNull: true },

    // 💰 Precio de venta (ya lo tenías)
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    // 🧾 Precio de compra (para contabilidad) — opcional
    precioCompra: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    },

    // 📦 Stock actual
    stockActual: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    // ⚠️ Stock mínimo para alertas
    stockMinimo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    // 🧪 Unidad de medida (unidad, caja, ml, etc.)
    unidad: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // 👍 Para desactivar productos sin borrarlos
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    freezeTableName: true,
  }
);

export default Producto;
