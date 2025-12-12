// backend/routes/historiaRoutes.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  crearHistoria,
  listarHistoriasPorMascota,
  obtenerHistoriaPorMascota,
} from "../controllers/historiaClinicaController.js";

const router = express.Router();

// Crear historia (Dashboard Vet)
router.post("/", authMiddleware, crearHistoria);

// Listado completo de historias (Dashboard Vet)
router.get("/mascota/:id", authMiddleware, listarHistoriasPorMascota);

// Historia RESUMEN / ÚLTIMA / ESPECÍFICA (Mis Mascotas)
router.get("/mascota/:id/resumen", authMiddleware, obtenerHistoriaPorMascota);

export default router;
