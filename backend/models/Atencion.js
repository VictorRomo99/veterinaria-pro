import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Usuario from "./Usuario.js";
import Mascota from "./Mascota.js"; // 👈 nuevo

const Atencion = sequelize.define("Atencion", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },

  motivo: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: "Motivo de la consulta (ej. revisión, emergencia, vacunación, etc.)",
  },

  diagnostico: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: "Diagnóstico emitido por el veterinario",
  },

  tratamiento: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: "Tratamiento o medicación recetada",
  },

  total: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: "Monto total a pagar por la atención",
  },

  // 🐾 mascota atendida
  mascotaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Mascota",
      key: "id",
    },
    comment: "Mascota a la que se le realizó la atención",
  },

  // 👤 Dueño (lo puedes dejar por compatibilidad)
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: true, // lo hago opcional porque ya tenemos mascotaId
    references: {
      model: "Usuarios",
      key: "id",
    },
    comment: "Dueño de la mascota o cliente atendido",
  },

  // 👨‍👩‍🦱 Tutor responsable (si aún lo usas)
  tutorResponsableId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "Usuarios",
      key: "id",
    },
    comment: "Adulto responsable si el cliente es menor de edad",
  },

  // 🩺 Veterinario que realizó la atención
  veterinarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Usuarios",
      key: "id",
    },
    comment: "Veterinario responsable de la atención",
  },
});

// 🔗 Relaciones (Asociaciones)
Atencion.belongsTo(Usuario, { as: "cliente", foreignKey: "usuarioId" });
Atencion.belongsTo(Usuario, { as: "tutorResponsable", foreignKey: "tutorResponsableId" });
Atencion.belongsTo(Usuario, { as: "veterinario", foreignKey: "veterinarioId" });

// 👉 nueva relación: atención → mascota
Atencion.belongsTo(Mascota, { as: "mascota", foreignKey: "mascotaId" });
// y la inversa (una mascota tiene muchas atenciones)
Mascota.hasMany(Atencion, { as: "atenciones", foreignKey: "mascotaId" });

export default Atencion;
