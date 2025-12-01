import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  agregarDetalle,
  listarDetalles,
  actualizarDetalle,
  eliminarDetalle
} from "../controllers/boletaDetalleController.js";

const router = Router();

// LISTAR DETALLES DE UNA BOLETA
router.get("/:boletaId", authMiddleware, listarDetalles);

// AGREGAR DETALLE
router.post("/:boletaId", authMiddleware, agregarDetalle);

// ACTUALIZAR DETALLE
router.put("/item/:id", authMiddleware, actualizarDetalle);

// ELIMINAR DETALLE
router.delete("/item/:id", authMiddleware, eliminarDetalle);

export default router;

