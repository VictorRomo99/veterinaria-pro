import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/roleMiddleware.js";

import {
  getDashboardResumen,
  getUsuarios,
  getProductosStock,
  getMovimientosCaja,
  getCitasResumen,
  getAtencionesResumen,
  getReportesVentas,
  getConfig,
  updateConfig,
  updateRol,
  updateEstado
} from "../controllers/adminController.js";

const router = express.Router();

// Solo ADMIN
router.use(authMiddleware, checkRole("admin"));

router.get("/dashboard", getDashboardResumen);
router.get("/usuarios", getUsuarios);

/* 🔥 RUTAS NUEVAS */
router.put("/usuarios/:id/rol", updateRol);
router.put("/usuarios/:id/estado", updateEstado);

router.get("/productos/stock-bajo", getProductosStock);
router.get("/caja/movimientos", getMovimientosCaja);
router.get("/citas/resumen", getCitasResumen);
router.get("/atenciones/resumen", getAtencionesResumen);
router.get("/reportes/ventas", getReportesVentas);

router.get("/config", getConfig);
router.put("/config", updateConfig);

export default router;
