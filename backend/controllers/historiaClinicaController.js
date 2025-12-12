// backend/controllers/historiaClinicaController.js
import HistoriaClinica from "../models/HistoriaClinica.js";
import Mascota from "../models/Mascota.js";
import Usuario from "../models/Usuario.js";
import Boleta from "../models/Boleta.js";

const esMedicoOAdmin = (usuario) =>
  usuario && (usuario.rol === "medico" || usuario.rol === "admin");

export const crearHistoria = async (req, res) => {
  try {
    const usuarioAuth = req.usuario;

    if (!esMedicoOAdmin(usuarioAuth)) {
      return res.status(403).json({ message: "No tienes permisos para registrar historias." });
    }

    const {
      mascotaId,
      tipoAtencion = "Consulta",
      motivoConsulta,
      anamnesis,
      signosSintomas,
      examenesRecomendados,
      examenesRealizados,
      diagnosticoPresuntivo,
      diagnosticoDefinitivo,
      planTratamiento,
      observaciones,
      temperatura,
      mucosas,
      frecuenciaResp,
      frecuenciaCard,
      pulso,
      tllc,
      deshidratacion,
      total,

      // 🟢 AGREGADO: corregido
      proximaDosis,
      notaDosis,

    } = req.body;

    if (!mascotaId) {
      return res.status(400).json({ message: "Debe indicar la mascota." });
    }

    const mascota = await Mascota.findByPk(mascotaId, {
      include: [{ model: Usuario, as: "dueno" }],
    });

    if (!mascota) {
      return res.status(404).json({ message: "La mascota no existe." });
    }

    const requeridos = {
      Consulta: ["motivoConsulta", "diagnosticoPresuntivo", "planTratamiento"],
      Vacunación: ["planTratamiento"],
      Desparasitación: ["planTratamiento"],
      Control: [],
      Cirugía: ["motivoConsulta", "diagnosticoPresuntivo", "planTratamiento"],
      Emergencia: ["motivoConsulta", "planTratamiento"],
    }[tipoAtencion] || [];

    for (const campo of requeridos) {
      if (!req.body[campo] || String(req.body[campo]).trim() === "") {
        return res.status(400).json({
          message: `El campo "${campo}" es obligatorio para ${tipoAtencion}.`,
        });
      }
    }

    // 🟦 Crear historia
    const historia = await HistoriaClinica.create({
      mascotaId: mascota.id,
      duenoId: mascota.dueno ? mascota.dueno.id : null,
      veterinarioId: usuarioAuth.id,
      tipoAtencion,
      motivoConsulta,
      anamnesis,
      signosSintomas,
      examenesRecomendados,
      examenesRealizados,
      diagnosticoPresuntivo,
      diagnosticoDefinitivo,
      planTratamiento,
      observaciones,
      temperatura,
      mucosas,
      frecuenciaResp,
      frecuenciaCard,
      pulso,
      tllc,
      deshidratacion,
      total: total ? Number(total) : null,

      // 🟢 CORREGIDO — ahora sí existen y no causan error
      proximaDosis: proximaDosis ? new Date(proximaDosis) : null,
      notaDosis: notaDosis || "",
    });

    await historia.reload();

    // 🧾 Boleta automática
    if (total) {
      await Boleta.create({
        historiaId: historia.id,
        mascotaId: mascota.id,
        tipoAtencion,
        motivo: motivoConsulta || "-",
        totalInicial: Number(total),
        total: Number(total),
        estado: "pendiente",
        tipoBoleta: "servicio",
      });
    }

    return res.status(201).json({
      message: "Historia clínica registrada correctamente.",
      historia,
    });

  } catch (error) {
    console.error("Error al crear historia clínica:", error);
    return res.status(500).json({ message: "Error al registrar historia clínica." });
  }
};

export const listarHistoriasPorMascota = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioAuth = req.usuario;

    const mascota = await Mascota.findByPk(id);
    if (!mascota) return res.status(404).json({ message: "Mascota no encontrada." });

    if (usuarioAuth.rol === "cliente" && mascota.duenoId !== usuarioAuth.id) {
      return res.status(403).json({ message: "No tienes acceso a esta mascota." });
    }

    const historias = await HistoriaClinica.findAll({
      where: { mascotaId: id },
      include: [
        { model: Usuario, as: "veterinario", attributes: ["id", "nombre", "apellido"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.json(historias);

  } catch (error) {
    console.error("Error al obtener historias:", error);
    return res.status(500).json({ message: "Error al obtener historias clínicas." });
  }
};
export const obtenerHistoriaPorMascota = async (req, res) => {
  try {
    const { id } = req.params;

    const historias = await HistoriaClinica.findAll({
      where: { mascotaId: id },
      order: [["fecha", "DESC"]],
      attributes: [
        "id",
        "fecha",
        "motivoConsulta",
        "diagnosticoPresuntivo",
        "diagnosticoDefinitivo",
        "planTratamiento",
        "proximaDosis",
      ],
      include: [
        {
          model: Usuario,
          as: "veterinario",
          attributes: ["nombre"], // 👈 SOLO lo que el front usa
        },
      ],
    });

    res.json(historias);
  } catch (error) {
    console.error("Error al obtener historial:", error);
    res.status(500).json({ message: "Error al obtener historial." });
  }
};
