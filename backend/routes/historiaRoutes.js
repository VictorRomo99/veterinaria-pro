// backend/routes/historiaRoutes.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  crearHistoria,
  listarHistoriasPorMascota,
  obtenerHistoriaPorMascota,
} from "../controllers/historiaClinicaController.js";

const router = express.Router();

router.post("/", authMiddleware, crearHistoria);
router.get("/mascota/:id", authMiddleware, listarHistoriasPorMascota);
router.get("/mascota/:id", authMiddleware, obtenerHistoriaPorMascota);


export default router;
