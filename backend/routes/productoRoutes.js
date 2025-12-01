// backend/routes/productoRoutes.js
import { Router } from "express";
import {
  crearProducto,
  listarProductos,
  actualizarProducto,
  eliminarProducto,
  ventaRapidaProducto,   // ⭐ NUEVO
} from "../controllers/productoController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// CRUD PRODUCTOS
router.post("/", authMiddleware, crearProducto);
router.get("/", authMiddleware, listarProductos);
router.put("/:id", authMiddleware, actualizarProducto);
router.delete("/:id", authMiddleware, eliminarProducto);

// ⭐ NUEVO: VENTA RÁPIDA DE PRODUCTO
router.post("/venta-rapida", authMiddleware, ventaRapidaProducto);

export default router;
