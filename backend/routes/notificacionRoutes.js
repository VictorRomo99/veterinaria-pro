// backend/routes/notificacionRoutes.js
import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  obtenerNotificaciones,
  marcarNotificacionLeida,
  marcarTodasLeidas,
} from "../controllers/notificacionController.js";

const router = Router();

router.get("/", authMiddleware, obtenerNotificaciones);
router.put("/:id/leida", authMiddleware, marcarNotificacionLeida);
router.put("/leertodas", authMiddleware, marcarTodasLeidas);

export default router;
