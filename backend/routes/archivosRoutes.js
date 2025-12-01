// backend/routes/archivos.routes.js
import express from "express";
import {
  subirArchivosHistoria,
  obtenerArchivosPorHistoria,
  upload,
} from "../controllers/archivosController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * 📤 Subir archivos (radiografías, análisis, etc.) asociados a una historia clínica.
 * Espera: multipart/form-data con campo "archivos"
 */
router.post(
  "/historia/:historiaId",
  authMiddleware,
  upload.array("archivos", 10),
  subirArchivosHistoria
);

/**
 * 📂 Obtener todos los archivos asociados a una historia clínica
 */
router.get(
  "/historia/:historiaId",
  authMiddleware,
  obtenerArchivosPorHistoria
);

export default router;
