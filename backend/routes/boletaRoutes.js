// backend/routes/boletaRoutes.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  marcarBoletaPagada,
  listarBoletasHoy,
  listarBoletasAnteriores,
} from "../controllers/boletaController.js";

import Boleta from "../models/Boleta.js";
import BoletaDetalle from "../models/BoletaDetalle.js";
import Mascota from "../models/Mascota.js";
import HistoriaClinica from "../models/HistoriaClinica.js";
import Usuario from "../models/Usuario.js";

const router = express.Router();

/* ===========================================================
   PAGAR BOLETA
=========================================================== */
router.put("/:id/pagar", authMiddleware, marcarBoletaPagada);

/* ===========================================================
   NUEVO: BOLETAS DE HOY Y ANTERIORES
=========================================================== */
router.get("/hoy", authMiddleware, listarBoletasHoy);
router.get("/anteriores", authMiddleware, listarBoletasAnteriores);

/* ===========================================================
   LISTAR TODAS
=========================================================== */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const boletas = await Boleta.findAll({
      include: [
        {
          model: Mascota,
          as: "mascota",
          include: [
            { model: Usuario, as: "dueno", attributes: ["nombre", "apellido"] },
          ],
        },
        { model: HistoriaClinica, as: "historia" },
      ],
      order: [["id", "DESC"]],
    });

    const respuesta = boletas.map((b) => ({
      id: b.id,
      mascotaNombre: b.mascota?.nombre || "-",
      dueno: b.mascota?.dueno
        ? `${b.mascota.dueno.nombre} ${b.mascota.dueno.apellido}`
        : "-",
      tipoAtencion: b.tipoAtencion,
      motivo: b.motivo,
      estado: b.estado,
      metodoPago: b.metodoPago || "-",
      total: Number(b.total),
      totalInicial: Number(b.totalInicial),
      createdAt: b.createdAt,
    }));

    res.json(respuesta);
  } catch (error) {
    console.error("❌ Error listando boletas:", error);
    res.status(500).json({ message: "Error al obtener boletas." });
  }
});

/* ===========================================================
   OBTENER BOLETA COMPLETA
=========================================================== */
router.get("/:id/completa", authMiddleware, async (req, res) => {
  try {
    const boleta = await Boleta.findByPk(req.params.id, {
      include: [
        { model: BoletaDetalle, as: "detalles" },
        {
          model: Mascota,
          as: "mascota",
          include: [
            { model: Usuario, as: "dueno", attributes: ["nombre", "apellido"] },
          ],
        },
        { model: HistoriaClinica, as: "historia" },
      ],
    });

    if (!boleta) {
      return res.status(404).json({ message: "Boleta no encontrada" });
    }

    res.json(boleta);
  } catch (error) {
    console.error("❌ Error cargando boleta completa:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

export default router;
