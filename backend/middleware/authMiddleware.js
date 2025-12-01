import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Usuario from "../models/Usuario.js";

dotenv.config();

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1️⃣ Validar si hay token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Acceso denegado. No se proporcionó un token válido.",
      });
    }

    // 2️⃣ Extraer token
    const token = authHeader.split(" ")[1];

    // 3️⃣ Verificar token con la clave secreta
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        message: "Token inválido o expirado.",
      });
    }

    // 4️⃣ Buscar usuario por ID decodificado
    const usuario = await Usuario.findByPk(decoded.id, {
      attributes: { exclude: ["password", "resetToken", "resetTokenExpira", "secret2FA"] },
    });

    if (!usuario) {
      return res.status(404).json({
        message: "El usuario asociado a este token no existe.",
      });
    }

    // 5️⃣ Guardar usuario autenticado en el request
    req.usuario = usuario;

    // 6️⃣ Permitir continuar al siguiente middleware/controlador
    next();
  } catch (error) {
    console.error("❌ Error en authMiddleware:", error);
    res.status(500).json({
      message: "Error interno en la verificación del token.",
    });
  }
};

export default authMiddleware;
