// backend/controllers/mascotaController.js
import Mascota from "../models/Mascota.js";
import Usuario from "../models/Usuario.js";
import HistoriaClinica from "../models/HistoriaClinica.js";


// 🔐 pequeño helper: solo médico o admin
const esMedicoOAdmin = (usuario) =>
  usuario && (usuario.rol === "medico" || usuario.rol === "admin");

/**
 * POST /api/mascotas
 * Crea una mascota y la asocia a un dueño (opcional)
 */
export const crearMascota = async (req, res) => {
  try {
    const usuarioAuth = req.usuario; // viene del authMiddleware

    if (!esMedicoOAdmin(usuarioAuth)) {
      return res.status(403).json({ message: "No tienes permisos para registrar mascotas." });
    }

    const {
      nombre,
      especie,
      raza,
      sexo,
      edad,
      color,
      peso,
      vacunas,
      desparasitacion,
      duenoId,
    } = req.body;

    if (!nombre || !especie) {
      return res.status(400).json({ message: "Nombre y especie son obligatorios." });
    }

    // si mandan duenoId, validar que exista
    let dueno = null;
    if (duenoId) {
      dueno = await Usuario.findByPk(duenoId);
      if (!dueno) {
        return res.status(404).json({ message: "El dueño indicado no existe." });
      }
    }

    const mascota = await Mascota.create({
      nombre,
      especie,
      raza,
      sexo,
      edad,
      color,
      peso,
      vacunas,
      desparasitacion,
      duenoId: dueno ? dueno.id : null,
    });

    res.status(201).json({
      message: "Mascota registrada correctamente.",
      mascota,
    });
  } catch (error) {
    console.error("Error al crear mascota:", error);
    res.status(500).json({ message: "Error interno al crear la mascota." });
  }
};

/**
 * GET /api/mascotas
 * - médico/admin: ve TODAS
 * - cliente: ve solo las suyas
 */
export const listarMascotas = async (req, res) => {
  try {
    const usuarioAuth = req.usuario;

    let where = {};
    if (usuarioAuth.rol === "cliente") {
      where = { duenoId: usuarioAuth.id };
    }

    const mascotas = await Mascota.findAll({
      where,
      include: [
        {
          model: Usuario,
          as: "dueno",
          attributes: ["id", "nombre", "apellido", "email"],
        },
      ],
      order: [["id", "DESC"]],
    });

    res.json(mascotas);
  } catch (error) {
    console.error("Error al listar mascotas:", error);
    res.status(500).json({ message: "Error al obtener mascotas." });
  }
};
// 🔵 MASCOTAS DEL USUARIO LOGUEADO
export const listarMascotasDeUsuario = async (req, res) => {
  try {
    const usuario = req.usuario;

    if (!usuario) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const mascotas = await Mascota.findAll({
      where: { duenoId: usuario.id },
      order: [["id", "DESC"]],
    });

    res.json(mascotas);
  } catch (error) {
    console.error("Error al obtener mascotas:", error);
    res.status(500).json({ message: "Error al obtener mascotas del usuario." });
  }
};
export const obtenerMascotaPorId = async (req, res) => {
  try {
    const usuarioAuth = req.usuario;
    const { id } = req.params;

    const mascota = await Mascota.findByPk(id);

    if (!mascota) {
      return res.status(404).json({ message: "Mascota no encontrada." });
    }

    // Si es cliente, solo puede ver sus mascotas
    if (usuarioAuth.rol === "cliente" && mascota.duenoId !== usuarioAuth.id) {
      return res.status(403).json({ message: "No tienes acceso a esta mascota." });
    }

    res.json(mascota);

  } catch (error) {
    console.error("Error al obtener mascota:", error);
    res.status(500).json({ message: "Error interno al obtener la mascota." });
  }
};

export const obtenerEstadoMascota = async (req, res) => {
  try {
    const { id } = req.params;

    const ultima = await HistoriaClinica.findOne({
      where: { mascotaId: id },
      order: [["createdAt", "DESC"]],
    });

    if (!ultima) {
      return res.json({
        estado: "Sin atenciones",
        ultimaAtencion: null,
        resumen: null,
        pesoActual: null,
      });
    }

    const diagnostico =
      ultima.diagnosticoDefinitivo ||
      ultima.diagnosticoPresuntivo ||
      "";


    // Evaluar el estado según el diagnóstico
    const diagLower = diagnostico.toLowerCase();

    let estado = "Estable";

    if (
      diagLower.includes("distemper") ||
      diagLower.includes("parvo") ||
      diagLower.includes("fractura")
    ) {
      estado = "Crítico";
    } else if (
      diagLower.includes("alergia") ||
      diagLower.includes("dolor")
    ) {
      estado = "En observación";
    }

    res.json({
      estado,
      ultimaAtencion: {
        fecha: ultima.createdAt,
        motivo: ultima.motivoConsulta,
      },
      resumen: ultima.observaciones || null,
      pesoActual: ultima.peso || null,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al evaluar estado de la mascota." });
  }
};


