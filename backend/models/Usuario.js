// backend/models/Usuario.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import bcrypt from "bcryptjs";

const Usuario = sequelize.define("Usuarios", {   // 👈 nombre EXACTO de la tabla
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  nombre: { type: DataTypes.STRING, allowNull: false },
  apellido: { type: DataTypes.STRING, allowNull: false },

  dni: {
    type: DataTypes.STRING(8),
    allowNull: false,
    unique: true,
    validate: { len: [8, 8], isNumeric: true },
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },

  password: { type: DataTypes.STRING, allowNull: false },

  fechaNacimiento: { type: DataTypes.DATEONLY, allowNull: false },

  celular: {
    type: DataTypes.STRING(15),
    allowNull: true,
    validate: { isNumeric: true, len: [9, 15] },
  },

  direccion: { type: DataTypes.STRING, allowNull: true },

  autorizacionDatos: { type: DataTypes.BOOLEAN, defaultValue: false },
  aceptaPoliticas: { type: DataTypes.BOOLEAN, defaultValue: false },

  resetToken: { type: DataTypes.STRING, allowNull: true },
  resetTokenExpira: { type: DataTypes.DATE, allowNull: true },

  rol: {
    type: DataTypes.ENUM("admin", "medico", "recepcionista", "cliente"),
    defaultValue: "cliente",
  },
   // 🔥 Nuevo: estado del usuario
  estado: {
    type: DataTypes.ENUM("activo", "inactivo"),
    defaultValue: "activo",
  },

  secret2FA: { type: DataTypes.STRING, allowNull: true },

}, {
  freezeTableName: true,        // 👈 evita que Sequelize pluralice
});

// Hasheos
Usuario.beforeCreate(async (u) => {
  if (u.password) u.password = await bcrypt.hash(u.password, 10);
});
Usuario.beforeUpdate(async (u) => {
  if (u.changed("password")) u.password = await bcrypt.hash(u.password, 10);
});

export default Usuario;
