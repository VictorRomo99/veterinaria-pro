// backend/routes/authRoutes.js
import express from "express";
import {
  registrarUsuario,
  loginUsuario,
  forgotPassword,
  resetPassword,
  habilitar2FA,
  verificar2FA,
  solicitarReset2FA,
  confirmarReset2FA,
  buscarUsuarios,
  crearClienteRapido,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// 🧍‍♂️ Registro de usuario (público)
router.post("/register", registrarUsuario);

// 🔑 Inicio de sesión
router.post("/login", loginUsuario);

// 🔄 Recuperar contraseña
router.post("/forgot-password", forgotPassword);

// 🔐 Restablecer contraseña
router.post("/reset-password", resetPassword);

// 🔢 Autenticación en dos pasos (2FA)
router.post("/enable-2fa", habilitar2FA);
router.post("/verify-2fa", verificar2FA);

// 🔄 Restablecer autenticación 2FA
router.post("/solicitar-reset-2fa", solicitarReset2FA);
router.post("/confirmar-reset-2fa", confirmarReset2FA);

// 🔍 Buscar usuarios por DNI (solo autenticado)
router.get("/buscar", authMiddleware, buscarUsuarios);

// 🆕 Crear cliente rápido desde recepción
router.post("/crear-cliente", authMiddleware, crearClienteRapido);

export default router;
