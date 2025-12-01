// backend/routes/cajaRoutes.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  abrirCaja,
  obtenerCajaConTotales,   // 🔥 NUEVO IMPORT CORRECTO
  registrarIngresoExtra,
  registrarGasto,
  cerrarCaja,
  historialCajas,
  obtenerMovimientosCaja 
} from "../controllers/cajaController.js";

const router = express.Router();

// 🟢 Caja del día con totales correctos (SERVICIOS + PRODUCTOS)
router.get("/dia", authMiddleware, obtenerCajaConTotales);   // 🔥 CORREGIDO

// 🟢 Abrir caja
router.post("/abrir", authMiddleware, abrirCaja);

// 🟢 Registrar ingreso extra
router.post("/ingreso-extra", authMiddleware, registrarIngresoExtra);

// 🟢 Registrar gasto
router.post("/gasto", authMiddleware, registrarGasto);

// 🟢 Cerrar caja
router.post("/cerrar", authMiddleware, cerrarCaja);

// 🟢 Historial
router.get("/historial", authMiddleware, historialCajas);

router.get("/movimientos/:cajaId", authMiddleware, obtenerMovimientosCaja);

export default router;
