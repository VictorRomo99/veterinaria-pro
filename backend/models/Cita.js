// backend/models/Cita.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Usuario from "./Usuario.js";

const Cita = sequelize.define("Cita", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  servicio: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  hora: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  comentario: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  direccion: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  referencia: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  tipoAtencion: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "presencial", // presencial | domicilio
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "pendiente",
    validate: {
      isIn: [["pendiente", "confirmada", "postergada", "cancelada", "reprogramada_cliente"]],
    },
  },
  postergaciones: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  notificacionesEnviadas: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  // 🔴 NUEVO: para controlar que el cliente solo reprograme 1 vez
  reprogramadaPorCliente: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

// Relación con usuario (dueño)
Cita.belongsTo(Usuario, {
  foreignKey: "usuarioId",
  as: "usuario",
});

export default Cita;
