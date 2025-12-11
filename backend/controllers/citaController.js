// backend/controllers/citaController.js
import Cita from "../models/Cita.js";
import Usuario from "../models/Usuario.js";
import { Resend } from "resend";
import dotenv from "dotenv";
import { Sequelize } from "sequelize";
import Notificacion from "../models/Notificacion.js";

dotenv.config();

/* ============================================
   📌 FUNCIÓN GLOBAL PARA ENVIAR CORREO
============================================ */
const resend = new Resend(process.env.RESEND_API_KEY);

const sendMail = async (to, subject, html) => {
  try {
    await resend.emails.send({
      from: "🐾 Clínica Veterinaria Colitas Sanas <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    console.log("📨 Correo enviado correctamente con Resend");
  } catch (error) {
    console.error("❌ Error al enviar correo con Resend:", error);
  }
};

/* ============================================
   📌 PLANTILLA HTML MODERNA
============================================ */
const generarHTML = (titulo, nombre, mensaje, servicio, fecha, hora) => {
  return `
  <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 25px;">
    <div style="max-width: 520px; margin: auto; background: white; padding: 25px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">

      <h2 style="text-align:center; color:#2b8a3e; margin-bottom: 5px;">
        🐾 Colitas Sanas
      </h2>
      <h3 style="text-align:center; color:#444; margin-top:0;">
        ${titulo}
      </h3>

      <p style="font-size: 15px; color:#444;">
        Hola <strong>${nombre}</strong>,
      </p>

      <p style="font-size: 15px; color:#444;">
        ${mensaje}
      </p>

      <div style="background:#e9f8ef; padding: 15px; border-radius: 8px; margin:20px 0;">
        <p style="margin:0; color:#2b8a3e;"><strong>Servicio:</strong> ${servicio}</p>
        <p style="margin:0; color:#2b8a3e;"><strong>Fecha:</strong> ${fecha}</p>
        <p style="margin:0; color:#2b8a3e;"><strong>Hora:</strong> ${hora}</p>
      </div>

      <p style="font-size: 14px; color:#555;">
        Si tienes dudas o deseas reprogramar, contáctanos.
      </p>

      <p style="text-align:center; margin-top:25px; font-size:13px; color:#999;">
        Colitas Sanas © ${new Date().getFullYear()}
      </p>
    </div>
  </div>
  `;
};
/* ============================================
   ⏱ DURACIÓN POR SERVICIO (EN MINUTOS)
============================================ */
const DURACIONES = {
  "Consulta veterinaria general": 40,
  "Vacunación y control preventivo": 40,
  "Peluquería y cuidado estético": 60,
  "Atención de emergencias": 40,
  "Odontología veterinaria": 50,
  "Visita a domicilio": 60,
};

/* ============================================
   🕒 HORARIOS PERMITIDOS
============================================ */
const HORARIO_INICIO = 8;  // 8:00 AM
const HORARIO_FIN = 19;   // 7:00 PM
const ALMUERZO_INICIO = "13:00"; // 1 PM
const ALMUERZO_FIN = "14:00";   // 2 PM

/* ============================================
   ⛔ FUNCIÓN PARA SABER SI ES DOMINGO
============================================ */
const esDomingo = (fecha) => {
  const d = new Date(fecha);
  return d.getDay() === 0;
};

/* ============================================
   🔍 FUNCIÓN PARA SUMAR MINUTOS A UNA HORA
============================================ */
const sumarMinutos = (hora, minutos) => {
  let [h, m] = hora.split(":").map(Number);
  m += minutos;

  while (m >= 60) {
    h++;
    m -= 60;
  }

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

/* ============================================
   🔥 VALIDAR CHOQUE DE HORARIOS
============================================ */
const hayChoque = async (fecha, horaInicio, duracionMin, excluirId = null) => {
  const horaFin = sumarMinutos(horaInicio, duracionMin);

  const citas = await Cita.findAll({
    where: { fecha },
  });

  for (let cita of citas) {
    if (excluirId && cita.id === excluirId) continue;

    const inicio = cita.hora;
    const fin = sumarMinutos(cita.hora, DURACIONES[cita.servicio] || 40);

    if (
      (horaInicio >= inicio && horaInicio < fin) ||
      (horaFin > inicio && horaFin <= fin) ||
      (horaInicio <= inicio && horaFin >= fin)
    ) {
      return true;
    }
  }

  return false;
};

/* ============================================
   📅 CREAR CITA (CON VALIDACIONES AVANZADAS)
============================================ */
export const crearCita = async (req, res) => {
  try {
    const { servicio, fecha, hora, comentario, direccion, referencia } = req.body;

    if (!servicio || !fecha || !hora) {
      return res.status(400).json({ message: "Faltan datos obligatorios." });
    }

    const usuario = req.usuario;
    if (!usuario) return res.status(401).json({ message: "No autenticado" });

    /* 🔴 NO PERMITIR DOMINGOS */
    if (esDomingo(fecha)) {
      return res.status(400).json({ message: "No se atiende los domingos." });
    }

    /* 🔴 VALIDAR HORARIO GENERAL */
    const [h, m] = hora.split(":").map(Number);
    if (h < HORARIO_INICIO || h >= HORARIO_FIN) {
      return res.status(400).json({ message: "Horario fuera de atención (8am a 7pm)." });
    }

    /* 🔴 BLOQUEAR ALMUERZO */
    if (hora >= ALMUERZO_INICIO && hora < ALMUERZO_FIN) {
      return res.status(400).json({ message: "No se atiende de 1pm a 2pm." });
    }

    /* 🔴 DURACIÓN ASIGNADA AL SERVICIO */
    const duracion = DURACIONES[servicio] || 40;

    /* 🔥 VALIDAR SOLAPAMIENTO */
    const choque = await hayChoque(fecha, hora, duracion);
    if (choque) {
      return res.status(409).json({
        message: "Este horario se cruza con otra cita. Selecciona otro.",
      });
    }

    /* 🔵 VALIDAR DOMICILIO */
    let tipoAtencion = "presencial";
    if (servicio.toLowerCase().includes("domicilio")) {
      if (!direccion) {
        return res.status(400).json({ message: "Falta dirección para domicilio." });
      }
      tipoAtencion = "domicilio";
    }

    /* 🟢 CREAR CITA */
    const cita = await Cita.create({
      usuarioId: usuario.id,
      servicio,
      fecha,
      hora,
      comentario,
      direccion: direccion || null,
      referencia: referencia || null,
      tipoAtencion,
    });

    /* NOTIFICAR RECEPCIÓN */
    await Notificacion.create({
      titulo: "Nueva cita registrada",
      mensaje: `${usuario.nombre} ${usuario.apellido} reservó una cita.`,
      tipo: "cita",
      relacionadaId: cita.id,
      receptorRol: "recepcionista",
      leido: false,
    });

    /* CORREO AL CLIENTE */
    const htmlCliente = generarHTML(
      "Confirmación de tu cita",
      `${usuario.nombre} ${usuario.apellido}`,
      "Tu cita ha sido registrada correctamente.",
      servicio,
      fecha,
      hora
    );

    await sendMail(usuario.email, "Confirmación de tu cita", htmlCliente);

    res.status(201).json({ message: "Cita creada correctamente.", cita });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear cita." });
  }
};

/* ============================================
   📋 OBTENER CITAS DEL USUARIO (MIS CITAS)
============================================ */
export const obtenerCitasUsuario = async (req, res) => {
  try {
    const usuario = req.usuario;
    if (!usuario) return res.status(401).json({ message: "No autenticado." });

    const citas = await Cita.findAll({
      where: { usuarioId: usuario.id },
      order: [["fecha", "DESC"], ["hora", "ASC"]],
    });

    res.status(200).json(citas);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener citas." });
  }
};

/* ============================================
   ⏰ DISPONIBILIDAD
============================================ */
export const verificarDisponibilidad = async (req, res) => {
  try {
    const { fecha, hora } = req.query;

    if (!fecha || !hora) {
      return res.status(400).json({ message: "Faltan datos" });
    }

    const existe = await Cita.findOne({ where: { fecha, hora } });
    return res.status(200).json({ disponible: !existe });

  } catch (error) {
    res.status(500).json({ message: "Error verificando disponibilidad." });
  }
};

/* ============================================
   ✏️ ACTUALIZAR CITA (CLIENTE)
============================================ */
export const actualizarCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { servicio, fecha, hora, comentario, direccion, referencia, tipoAtencion } = req.body;

    const cita = await Cita.findByPk(id);
    if (!cita) return res.status(404).json({ message: "No encontrada." });

    const existe = await Cita.findOne({
      where: { fecha, hora, id: { [Sequelize.Op.ne]: id } },
    });

    if (existe) return res.status(409).json({ message: "Horario ocupado." });

    await cita.update({
      servicio,
      fecha,
      hora,
      comentario,
      direccion,
      referencia,
      tipoAtencion: tipoAtencion || cita.tipoAtencion,
    });

    res.status(200).json({ message: "Cita actualizada.", cita });

  } catch (error) {
    res.status(500).json({ message: "Error al actualizar cita." });
  }
};

/* ============================================
   ❌ CANCELACIÓN DEL CLIENTE
============================================ */
export const cancelarCita = async (req, res) => {
  try {
    const { id } = req.params;

    const cita = await Cita.findByPk(id);
    if (!cita) return res.status(404).json({ message: "No encontrada." });

    await cita.destroy();

    res.status(200).json({ message: "Cita eliminada." });

  } catch (error) {
    res.status(500).json({ message: "Error al cancelar cita." });
  }
};

/* ============================================
   📌 CITAS PARA RECEPCIÓN
============================================ */
export const obtenerCitasRecepcion = async (req, res) => {
  try {
    const { fecha } = req.query;
    const where = fecha ? { fecha } : {};

    const citas = await Cita.findAll({
      where,
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["nombre", "apellido", "email"],
        },
      ],
      order: [["fecha", "ASC"], ["hora", "ASC"]],
    });

    const data = citas.map((c) => ({
      id: c.id,
      fecha: c.fecha,
      hora: c.hora,
      servicio: c.servicio,
      estado: c.estado,
      tipoAtencion: c.tipoAtencion,
      postergaciones: c.postergaciones,
      notificacionesEnviadas: c.notificacionesEnviadas,
      reprogramadaPorCliente: c.reprogramadaPorCliente,
      duenoNombre: c.usuario
        ? `${c.usuario.nombre} ${c.usuario.apellido}`
        : "Dueño no registrado",
      mascotaNombre: "Mascota sin nombre",
    }));

    res.status(200).json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener citas." });
  }
};

/* ============================================
   ✔ CONFIRMAR CITA (RECEPCIÓN)
============================================ */
export const confirmarCita = async (req, res) => {
  try {
    const { id } = req.params;

    const cita = await Cita.findByPk(id, {
      include: [{ model: Usuario, as: "usuario" }]
    });

    if (!cita) return res.status(404).json({ message: "Cita no encontrada" });

    cita.estado = "confirmada";
    await cita.save();

    const html = generarHTML(
      "Tu cita fue confirmada",
      `${cita.usuario.nombre} ${cita.usuario.apellido}`,
      "Tu cita ha sido confirmada exitosamente.",
      cita.servicio,
      cita.fecha,
      cita.hora
    );

    await sendMail(cita.usuario.email, "Cita confirmada", html);

    res.json({ message: "Cita confirmada y correo enviado." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al confirmar cita." });
  }
};

/* ============================================
   ✔ POSTERGAR CITA (RECEPCIÓN)
============================================ */
export const postergarCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevaFecha, nuevaHora } = req.body;

    const cita = await Cita.findByPk(id, {
      include: [{ model: Usuario, as: "usuario" }]
    });

    if (!cita) return res.status(404).json({ message: "Cita no encontrada" });

    if (cita.postergaciones >= 2) {
      return res.status(400).json({ message: "Máximo de postergaciones alcanzado." });
    }

    const ocupado = await Cita.findOne({
      where: {
        fecha: nuevaFecha,
        hora: nuevaHora,
        id: { [Sequelize.Op.ne]: id },
      },
    });

    if (ocupado) return res.status(409).json({ message: "Nuevo horario ocupado." });

    cita.fecha = nuevaFecha;
    cita.hora = nuevaHora;
    cita.estado = "postergada";
    cita.postergaciones++;
    await cita.save();

    const html = generarHTML(
      "Tu cita fue reprogramada",
      `${cita.usuario.nombre} ${cita.usuario.apellido}`,
      "Tu cita ha sido reprogramada por recepción.",
      cita.servicio,
      nuevaFecha,
      nuevaHora
    );

    await sendMail(cita.usuario.email, "Cita reprogramada", html);

    res.json({ message: "Cita postergada y correo enviado." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al postergar." });
  }
};

/* ============================================
   ✔ CANCELAR CITA (RECEPCIÓN)
============================================ */
export const cancelarCitaRecepcion = async (req, res) => {
  try {
    const { id } = req.params;

    const cita = await Cita.findByPk(id, {
      include: [{ model: Usuario, as: "usuario" }]
    });

    if (!cita) return res.status(404).json({ message: "Cita no encontrada" });

    cita.estado = "cancelada";
    await cita.save();

    const html = generarHTML(
      "Tu cita fue cancelada",
      `${cita.usuario.nombre} ${cita.usuario.apellido}`,
      "Tu cita ha sido cancelada. Si deseas reprogramarla, puedes hacerlo desde la plataforma.",
      cita.servicio,
      cita.fecha,
      cita.hora
    );

    await sendMail(cita.usuario.email, "Cita cancelada", html);

    res.json({ message: "Cita cancelada y correo enviado." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al cancelar cita." });
  }
};

/* ============================================
   ✔ RECORDATORIO 30 MIN (RECEPCIÓN)
============================================ */
export const enviarRecordatorio = async (req, res) => {
  try {
    const { id } = req.params;

    const cita = await Cita.findByPk(id, {
      include: [{ model: Usuario, as: "usuario" }]
    });

    if (!cita) return res.status(404).json({ message: "Cita no encontrada" });

    const html = generarHTML(
      "Recordatorio de tu cita",
      `${cita.usuario.nombre} ${cita.usuario.apellido}`,
      "Te recordamos que tu cita es en aproximadamente 30 minutos.",
      cita.servicio,
      cita.fecha,
      cita.hora
    );

    await sendMail(cita.usuario.email, "Recordatorio de tu cita", html);

    cita.notificacionesEnviadas++;
    await cita.save();

    res.json({ message: "Recordatorio enviado correctamente." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al enviar recordatorio." });
  }
};

/* ============================================
   ✔ REPROGRAMAR CITA (CLIENTE)
============================================ */
export const reprogramarCitaCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevaFecha, nuevaHora } = req.body;
    const usuario = req.usuario;

    const cita = await Cita.findByPk(id, {
      include: [{ model: Usuario, as: "usuario" }]
    });

    if (!cita) return res.status(404).json({ message: "Cita no encontrada" });

    if (cita.usuarioId !== usuario.id) {
      return res.status(403).json({ message: "No puedes modificar esta cita." });
    }

    if (cita.reprogramadaPorCliente) {
      return res.status(400).json({ message: "Solo puedes reprogramar una vez esta cita." });
    }

    const ocupado = await Cita.findOne({
      where: {
        fecha: nuevaFecha,
        hora: nuevaHora,
        id: { [Sequelize.Op.ne]: id }
      }
    });

    if (ocupado) {
      return res.status(409).json({ message: "Ese horario ya está ocupado." });
    }

    cita.fecha = nuevaFecha;
    cita.hora = nuevaHora;
    cita.estado = "reprogramada_cliente";
    cita.reprogramadaPorCliente = true;
    await cita.save();

    await Notificacion.create({
      titulo: "Cliente reprogramó su cita",
      mensaje: `${usuario.nombre} ${usuario.apellido} reprogramó su cita para ${nuevaFecha} ${nuevaHora}.`,
      tipo: "cita",
      relacionadaId: cita.id,
      receptorRol: "recepcionista",
      leido: false,
    });

    const html = generarHTML(
      "Cita reprogramada",
      `${usuario.nombre} ${usuario.apellido}`,
      "Tu cita ha sido reprogramada exitosamente. Recepción ha sido notificada.",
      cita.servicio,
      nuevaFecha,
      nuevaHora
    );
    await sendMail(usuario.email, "Reprogramación de cita", html);

    res.json({ message: "Cita reprogramada y notificación enviada." });

  } catch (err) {
    console.error("Error en reprogramación cliente:", err);
    res.status(500).json({ message: "Error al reprogramar la cita." });
  }
};

