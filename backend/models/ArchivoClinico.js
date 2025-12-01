// backend/models/ArchivoClinico.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import HistoriaClinica from "./HistoriaClinica.js";

const ArchivoClinico = sequelize.define(
  "ArchivoClinico",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    nombreArchivo: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    tipo: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    urlArchivo: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    historiaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "HistoriaClinica",   // ✅ NOMBRE CORRECTO DE TABLA
        key: "id",
      },
    },
  },
  {
    freezeTableName: true,
  }
);

// Relaciones correctas
ArchivoClinico.belongsTo(HistoriaClinica, {
  foreignKey: "historiaId",
  as: "historia",
});
HistoriaClinica.hasMany(ArchivoClinico, {
  foreignKey: "historiaId",
  as: "archivos",
});

export default ArchivoClinico;
