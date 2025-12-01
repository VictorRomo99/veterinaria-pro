// backend/controllers/atencionController.js
import Atencion from "../models/Atencion.js";
import Mascota from "../models/Mascota.js";
import Usuario from "../models/Usuario.js";

/**
 * 👉 Crear una atención (solo veterinarios o admin)
 */
export const crearAtencion = async (req, res) => {
  try {
    // viene del authMiddleware
    const usuarioLogueado = req.usuario;

    // 1. validar rol
    if (!usuarioLogueado || !["medico", "admin"].includes(usuarioLogueado.rol)) {
      return res
        .status(403)
        .json({ message: "Solo veterinarios o administradores pueden registrar atenciones." });
    }

    const {
      mascotaId,
      motivo,
      diagnostico,
      tratamiento,
      total,
    } = req.body;

    // 2. validar campos mínimos
    if (!mascotaId || !motivo) {
      return res.status(400).json({ message: "Debe indicar la mascota y el motivo de la atención." });
    }

    // 3. validar que la mascota exista
    const mascota = await Mascota.findByPk(mascotaId, {
      include: [{ model: Usuario, as: "duenio", attributes: ["id", "nombre", "apellido"] }],
    });

    if (!mascota) {
      return res.status(404).json({ message: "La mascota indicada no existe." });
    }

    // 4. crear atención
    const atencion = await Atencion.create({
      mascotaId,
      usuarioId: mascota.usuarioId, // dueño
      motivo,
      diagnostico: diagnostico || null,
      tratamiento: tratamiento || null,
      total: total || null,
      veterinarioId: usuarioLogueado.id,
    });

    return res.status(201).json({
      message: "Atención registrada correctamente.",
      atencion,
    });
  } catch (error) {
    console.error("Error al crear atención:", error);
    return res.status(500).json({ message: "Error al registrar la atención." });
  }
};

/**
 * 📜 Obtener atenciones de una mascota (para historial clínico)
 * GET /api/atenciones/mascota/:id
 */
export const obtenerAtencionesPorMascota = async (req, res) => {
  try {
    const { id } = req.params;

    const atenciones = await Atencion.findAll({
      where: { mascotaId: id },
      include: [
        { model: Usuario, as: "veterinario", attributes: ["id", "nombre", "apellido"] },
      ],
      order: [["fecha", "DESC"]],
    });

    return res.json(atenciones);
  } catch (error) {
    console.error("Error al obtener atenciones por mascota:", error);
    return res.status(500).json({ message: "Error al obtener historial de la mascota." });
  }
};

/**
 * 👤 Obtener atenciones del dueño logueado (para que el cliente las vea)
 * GET /api/atenciones/mis
 */
export const obtenerAtencionesDeCliente = async (req, res) => {
  try {
    const usuario = req.usuario;

    const atenciones = await Atencion.findAll({
      where: { usuarioId: usuario.id },
      include: [
        { model: Mascota, as: "mascota", attributes: ["id", "nombre", "especie"] },
        { model: Usuario, as: "veterinario", attributes: ["id", "nombre", "apellido"] },
      ],
      order: [["fecha", "DESC"]],
    });

    return res.json(atenciones);
  } catch (error) {
    console.error("Error al obtener atenciones del cliente:", error);
    return res.status(500).json({ message: "Error al obtener tus atenciones." });
  }
};

/**
 * 🧑‍⚕️ (opcional) obtener atenciones registradas por el veterinario logueado
 * GET /api/atenciones/veterinario/mias
 */
export const obtenerAtencionesDeVeterinario = async (req, res) => {
  try {
    const vet = req.usuario;

    if (!["medico", "admin"].includes(vet.rol)) {
      return res.status(403).json({ message: "Solo veterinarios pueden ver esta información." });
    }

    const atenciones = await Atencion.findAll({
      where: { veterinarioId: vet.id },
      include: [
        { model: Mascota, as: "mascota", attributes: ["id", "nombre"] },
        { model: Usuario, as: "cliente", attributes: ["id", "nombre", "apellido"] },
      ],
      order: [["fecha", "DESC"]],
    });

    return res.json(atenciones);
  } catch (error) {
    console.error("Error al obtener atenciones del veterinario:", error);
    return res.status(500).json({ message: "Error al obtener las atenciones." });
  }
};
