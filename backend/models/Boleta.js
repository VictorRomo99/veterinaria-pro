// backend/models/Boleta.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Mascota from "./Mascota.js";
import HistoriaClinica from "./HistoriaClinica.js";
import BoletaDetalle from "./BoletaDetalle.js";

const Boleta = sequelize.define(
  "Boleta",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    historiaId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "HistoriaClinica",   // ✅ corregido
        key: "id",
      },
    },

    mascotaId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Mascota",           // 🔥 asegurado
        key: "id",
      },
    },

    tipoAtencion: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    motivo: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    totalInicial: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    tipoBoleta: {
      type: DataTypes.ENUM("servicio", "producto", "mixto"),
      defaultValue: "servicio",
    },

    metodoPago: {
      type: DataTypes.ENUM("efectivo", "tarjeta", "yape", "plin"),
      allowNull: true,
    },

    estado: {
      type: DataTypes.ENUM("pendiente", "pagado", "anulado"),
      defaultValue: "pendiente",
    },
  },
  {
    freezeTableName: true,
  }
);

// Relaciones
Boleta.belongsTo(HistoriaClinica, { foreignKey: "historiaId", as: "historia" });
Boleta.belongsTo(Mascota, { foreignKey: "mascotaId", as: "mascota" });

Mascota.hasMany(Boleta, { foreignKey: "mascotaId", as: "boletas" });
HistoriaClinica.hasOne(Boleta, { foreignKey: "historiaId", as: "boleta" });

Boleta.hasMany(BoletaDetalle, { foreignKey: "boletaId", as: "detalles" });
BoletaDetalle.belongsTo(Boleta, { foreignKey: "boletaId", as: "boleta" });

export default Boleta;
