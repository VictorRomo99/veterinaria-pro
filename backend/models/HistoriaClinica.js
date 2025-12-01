// backend/models/HistoriaClinica.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Mascota from "./Mascota.js";
import Usuario from "./Usuario.js";

const HistoriaClinica = sequelize.define("HistoriaClinica", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  tipoAtencion: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Consulta",
    validate: {
      isIn: [[
        "Consulta",
        "Vacunación",
        "Desparasitación",
        "Control",
        "Cirugía",
        "Emergencia",
      ]],
    },
  },

  motivoConsulta: { type: DataTypes.TEXT, allowNull: true },
  anamnesis: { type: DataTypes.TEXT, allowNull: true },
  signosSintomas: { type: DataTypes.TEXT, allowNull: true },

  examenesRecomendados: { type: DataTypes.TEXT, allowNull: true },
  examenesRealizados: { type: DataTypes.TEXT, allowNull: true },

  diagnosticoPresuntivo: { type: DataTypes.TEXT, allowNull: true },
  diagnosticoDefinitivo: { type: DataTypes.TEXT, allowNull: true },

  planTratamiento: { type: DataTypes.TEXT, allowNull: true },
  observaciones: { type: DataTypes.TEXT, allowNull: true },

  temperatura: { type: DataTypes.STRING, allowNull: true },
  mucosas: { type: DataTypes.STRING, allowNull: true },
  frecuenciaResp: { type: DataTypes.STRING, allowNull: true },
  frecuenciaCard: { type: DataTypes.STRING, allowNull: true },
  pulso: { type: DataTypes.STRING, allowNull: true },
  tllc: { type: DataTypes.STRING, allowNull: true },
  deshidratacion: { type: DataTypes.STRING, allowNull: true },
  fecha: {
  type: DataTypes.DATE,
  allowNull: false,
  defaultValue: DataTypes.NOW
},
proximaDosis: {
  type: DataTypes.DATE,
  allowNull: true,
},

notaDosis: {
  type: DataTypes.STRING,
  allowNull: true,
},


  total: { type: DataTypes.FLOAT, allowNull: true },
}, {
  freezeTableName: true    // 👈 FIX CLAVE
});

// Relaciones
HistoriaClinica.belongsTo(Mascota, { as: "mascota", foreignKey: "mascotaId" });
HistoriaClinica.belongsTo(Usuario, { as: "veterinario", foreignKey: "veterinarioId" });
HistoriaClinica.belongsTo(Usuario, { as: "dueno", foreignKey: "duenoId" });

export default HistoriaClinica;