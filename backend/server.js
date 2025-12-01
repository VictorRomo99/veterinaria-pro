import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connectDB, sequelize } from "./config/db.js";

import Usuario from "./models/Usuario.js";
import Mascota from "./models/Mascota.js";
import HistoriaClinica from "./models/HistoriaClinica.js";
import Cita from "./models/Cita.js";
import ArchivoClinico from "./models/ArchivoClinico.js";

import Boleta from "./models/Boleta.js";
import BoletaDetalle from "./models/BoletaDetalle.js";
import Notificacion from "./models/Notificacion.js";
import MovimientoInventario from "./models/MovimientoInventario.js";

import Caja from "./models/Caja.js";
import MovimientoCaja from "./models/MovimientoCaja.js";

import authRoutes from "./routes/authRoutes.js";
import reniecRoutes from "./routes/reniecRoutes.js";
import atencionRoutes from "./routes/atencionRoutes.js";
import citaRoutes from "./routes/citaRoutes.js";
import mascotaRoutes from "./routes/mascotaRoutes.js";
import historiaRoutes from "./routes/historiaRoutes.js";
import archivosRoutes from "./routes/archivosRoutes.js";
import boletaRoutes from "./routes/boletaRoutes.js";
import productoRoutes from "./routes/productoRoutes.js";
import boletaDetalleRoutes from "./routes/boletaDetalleRoutes.js";
import notificacionRoutes from "./routes/notificacionRoutes.js";
import cajaRoutes from "./routes/cajaRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

import path from "path";
import { fileURLToPath } from "url";

import cron from "node-cron";
import moment from "moment-timezone";
import { Op } from "sequelize";

moment.tz.setDefault("America/Lima");

dotenv.config();

const app = express();

// ===================================================
//  C O R S   P R O D U C C I Ó N   S E G U R O
// ===================================================
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL // Render / Vercel
];

// No rompe nada si FRONTEND_URL no existe
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true
}));

app.use(express.json());

// ===================================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===================================================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

connectDB();

// ===================================================
//  S E Q U E L I Z E    E N   M O D O   S E G U R O
// ===================================================
const isProduction = process.env.NODE_ENV === "production";

sequelize
  .sync({ alter: !isProduction }) // alter SOLO en desarrollo
  .then(() => {
    console.log("📦 Tablas sincronizadas correctamente con Sequelize.");
  });

// ===================================================
//  R U T A S
// ===================================================
app.use("/api/auth", authRoutes);
app.use("/api/reniec", reniecRoutes);
app.use("/api/atenciones", atencionRoutes);
app.use("/api/citas", citaRoutes);
app.use("/api/mascotas", mascotaRoutes);
app.use("/api/historias", historiaRoutes);
app.use("/api/archivos", archivosRoutes);
app.use("/api/boletas", boletaRoutes);
app.use("/api/boletas/detalles", boletaDetalleRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/notificaciones", notificacionRoutes);
app.use("/api/caja", cajaRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Servidor backend funcionando 🚀");
});

// ===================================================
//  C R O N
// ===================================================
import Historia from "./models/HistoriaClinica.js";

cron.schedule("*/10 * * * *", async () => {
  try {
    console.log("⏰ Revisando próximas dosis...");

    const ahora = moment();

    const historias = await Historia.findAll({
      include: [
        {
          model: Mascota,
          as: "mascota",
          include: [{ model: Usuario, as: "dueno" }],
        },
      ],
    });

    for (const h of historias) {
      if (!h.proximaDosis) continue;

      const fechaDosis = moment(h.proximaDosis);
      const diffHoras = fechaDosis.diff(ahora, "hours");
      const diffMin = fechaDosis.diff(ahora, "minutes");

      if (diffHoras === 24) {
        await Notificacion.create({
          usuarioId: h.mascota?.dueno?.id,
          mensaje: `Recordatorio: Mañana ${h.mascota?.nombre} tiene su próxima dosis.`,
          tipo: "vacunacion",
        });
      }

      if (diffHoras === 1 && diffMin > 30) {
        await Notificacion.create({
          usuarioId: h.mascota?.dueno?.id,
          mensaje: `En 1 hora ${h.mascota?.nombre} tiene su dosis programada.`,
          tipo: "vacunacion",
        });
      }
    }
  } catch (error) {
    console.error("❌ Error en cron de próximas dosis:", error);
  }
});

// ===================================================
//  I N I C I A R   S E R V I D O R
// ===================================================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🟢 Servidor corriendo en puerto ${PORT}`));
