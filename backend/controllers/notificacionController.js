// backend/controllers/notificacionController.js
import Notificacion from "../models/Notificacion.js";
import { Op } from "sequelize";

export const obtenerNotificaciones = async (req, res) => {
  try {
    const usuario = req.usuario;

    if (!usuario) {
      return res.status(401).json({ message: "Usuario no autenticado." });
    }

    const rol = usuario.rol || "recepcionista"; // ✔ FIX

    const notificaciones = await Notificacion.findAll({
      where: { receptorRol: rol },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(notificaciones);
  } catch (error) {
    console.error("❌ Error al obtener notificaciones:", error);
    res.status(500).json({ message: "Error al obtener notificaciones." });
  }
};


export const marcarNotificacionLeida = async (req, res) => {
  try {
    const { id } = req.params;

    const notificacion = await Notificacion.findByPk(id);
    if (!notificacion) {
      return res.status(404).json({ message: "Notificación no encontrada." });
    }

    await notificacion.update({ leido: true });

    res.status(200).json({ message: "Notificación marcada como leída." });
  } catch (error) {
    console.error("❌ Error al marcar como leída:", error);
    res.status(500).json({ message: "Error al marcar la notificación." });
  }
};


export const marcarTodasLeidas = async (req, res) => {
  try {
    const usuario = req.usuario;

    if (!usuario) {
      return res.status(401).json({ message: "Usuario no autenticado." });
    }

    const rol = usuario.rol || "recepcionista"; // ✔ FIX

    await Notificacion.update(
      { leido: true },
      {
        where: {
          receptorRol: rol,
          leido: false,
        },
      }
    );

    res.status(200).json({ message: "Todas las notificaciones marcadas como leídas." });
  } catch (error) {
    console.error("❌ Error al marcar todas:", error);
    res.status(500).json({ message: "Error al marcar todas." });
  }
};
