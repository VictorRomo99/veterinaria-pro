// backend/routes/mascotaRoutes.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { crearMascota, listarMascotas, listarMascotasDeUsuario, obtenerEstadoMascota,obtenerMascotaPorId  } from "../controllers/mascotaController.js";

const router = express.Router();

router.post("/", authMiddleware, crearMascota);
router.get("/", authMiddleware, listarMascotas);


// Mascotas del usuario logueado
router.get("/usuario", authMiddleware, listarMascotasDeUsuario);

// 🆕 NUEVA RUTA QUE NECESITAMOS
router.get("/:id", authMiddleware, obtenerMascotaPorId);

// 🟢 Estado general de una mascota específica
router.get("/:id/estado", authMiddleware, obtenerEstadoMascota);
export default router;
