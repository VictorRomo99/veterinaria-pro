// backend/models/Caja.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Caja = sequelize.define(
  "Caja",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // 👇 Quién abrió la caja
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "ID del usuario que abre la caja",
    },

    // 👇 Opcional: quién la cerró (puede ser otro usuario)
    usuarioCierreId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "ID del usuario que cierra la caja",
    },

    // 📅 Apertura
    fechaApertura: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    horaApertura: {
      type: DataTypes.TIME,
      allowNull: false,
    },

    // 📅 Cierre
    fechaCierre: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    horaCierre: {
      type: DataTypes.TIME,
      allowNull: true,
    },

    // 💵 Montos
    montoApertura: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    totalServicios: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    totalProductos: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    totalIngresosExtras: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: "Ingresos registrados manualmente (no boletas)",
    },

    totalGastos: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    totalIngresos: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    totalEgresos: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    montoFinal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: "Monto que debería haber físicamente en caja",
    },

    diferencia: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: "Cuadre entre lo esperado y lo real",
    },

    estado: {
      type: DataTypes.ENUM("abierta", "cerrada"),
      allowNull: false,
      defaultValue: "abierta",
    },
  },
  {
    freezeTableName: true, // 👈 tabla se llamará exactamente 'Caja'
  }
);

export default Caja;
