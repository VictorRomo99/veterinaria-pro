// backend/models/Mascota.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Usuario from "./Usuario.js";

const Mascota = sequelize.define("Mascota", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  nombre: { type: DataTypes.STRING, allowNull: false },
  especie: { type: DataTypes.STRING, allowNull: false },
  raza: { type: DataTypes.STRING, allowNull: true },

  sexo: {
    type: DataTypes.ENUM("macho", "hembra", "desconocido"),
    defaultValue: "desconocido",
  },

  edad: { type: DataTypes.STRING, allowNull: true },
  color: { type: DataTypes.STRING, allowNull: true },
  peso: { type: DataTypes.FLOAT, allowNull: true },

  vacunas: { type: DataTypes.TEXT, allowNull: true },
  desparasitacion: { type: DataTypes.TEXT, allowNull: true },

  duenoId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "Usuarios",   // 👈 tabla real
      key: "id",
    },
  },
}, {
  freezeTableName: true,
});

// relaciones
Mascota.belongsTo(Usuario, { as: "dueno", foreignKey: "duenoId" });

export default Mascota;
