// backend/routes/citaRoutes.js
import express from "express";
import {
  crearCita,
  obtenerCitasUsuario,
  obtenerCitasRecepcion,
  verificarDisponibilidad,
  actualizarCita,
  cancelarCita,
  confirmarCita,
  postergarCita,
  cancelarCitaRecepcion,
  enviarRecordatorio,
  reprogramarCitaCliente,
} from "../controllers/citaController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// 🧩 Citas del cliente
router.post("/", authMiddleware, crearCita);
router.get("/", authMiddleware, obtenerCitasUsuario);
router.get("/disponibilidad", verificarDisponibilidad);
router.put("/:id", authMiddleware, actualizarCita);
router.delete("/:id", authMiddleware, cancelarCita);

// 🔵 NUEVO — reprogramar por cliente (solo 1 vez)
router.put("/:id/reprogramar-cliente", authMiddleware, reprogramarCitaCliente);

// 🧩 Recepción
router.get("/recepcion", authMiddleware, obtenerCitasRecepcion);
router.put("/:id/confirmar", authMiddleware, confirmarCita);
router.put("/:id/postergar", authMiddleware, postergarCita);
router.put("/:id/cancelar", authMiddleware, cancelarCitaRecepcion);
router.post("/:id/recordatorio", authMiddleware, enviarRecordatorio);

export default router;
