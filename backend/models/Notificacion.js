// backend/models/Notificacion.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Notificacion = sequelize.define("Notificacion", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  titulo: { type: DataTypes.STRING, allowNull: false },

  mensaje: { type: DataTypes.TEXT, allowNull: false },

  tipo: { type: DataTypes.STRING, defaultValue: "cita" },

  leido: { type: DataTypes.BOOLEAN, defaultValue: false },

  relacionadaId: { type: DataTypes.INTEGER, allowNull: true },

  receptorRol: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "recepcionista",   // <- CORRECTO
  },
});

export default Notificacion;
