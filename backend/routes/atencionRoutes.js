// backend/routes/atencionRoutes.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  crearAtencion,
  obtenerAtencionesPorMascota,
  obtenerAtencionesDeCliente,
  obtenerAtencionesDeVeterinario,
} from "../controllers/atencionController.js";

const router = express.Router();

// 👉 crear una atención (solo vet/admin, validado en el controller)
router.post("/", authMiddleware, crearAtencion);

// 👉 historial clínico de una mascota
router.get("/mascota/:id", authMiddleware, obtenerAtencionesPorMascota);

// 👉 lo que ve el cliente (sus atenciones)
router.get("/mis", authMiddleware, obtenerAtencionesDeCliente);

// 👉 lo que ve el veterinario (lo que él registró)
router.get("/veterinario/mias", authMiddleware, obtenerAtencionesDeVeterinario);

export default router;
