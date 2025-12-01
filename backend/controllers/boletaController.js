// backend/controllers/boletaController.js
// ==========================================================
//  CONTROLADOR DE BOLETAS (COMPLETO Y FUNCIONAL)
// ==========================================================

import { Op } from "sequelize";               // 👈 NUEVO
import Boleta from "../models/Boleta.js";
import HistoriaClinica from "../models/HistoriaClinica.js";
import Mascota from "../models/Mascota.js";
import Usuario from "../models/Usuario.js";

import BoletaDetalle from "../models/BoletaDetalle.js";

import Caja from "../models/Caja.js";
import MovimientoCaja from "../models/MovimientoCaja.js";


// ==========================================================
// 🟢 CREAR BOLETA DESDE UNA HISTORIA CLÍNICA
// ==========================================================
export const crearBoleta = async (req, res) => {
  try {
    const { historiaId, total } = req.body;

    if (!historiaId) {
      return res.status(400).json({ message: "historiaId es obligatorio." });
    }

    const historia = await HistoriaClinica.findByPk(historiaId);

    if (!historia) {
      return res.status(404).json({ message: "Historia clínica no encontrada." });
    }

    // Evitar duplicados
    const existente = await Boleta.findOne({ where: { historiaId } });
    if (existente) {
      return res.status(200).json({
        message: "La boleta ya existía para esta historia.",
        boleta: existente,
      });
    }

    const boleta = await Boleta.create({
      historiaId,
      mascotaId: historia.mascotaId,
      tipoAtencion: historia.tipoAtencion || "Atención veterinaria",
      motivo: historia.motivoConsulta || "",
      totalInicial: Number(historia.total) || 0,
      total: Number(historia.total) || 0,
      estado: "pendiente",
    });

    res.status(201).json({
      message: "Boleta generada correctamente.",
      boleta,
    });

  } catch (error) {
    console.error("❌ Error creando boleta:", error);
    res.status(500).json({ message: "Error al generar boleta." });
  }
};


// ==========================================================
// 🟢 LISTAR BOLETAS PARA RECEPCIÓN (TODAS – SI LA USAS EN ALGÚN LADO)
// ==========================================================
export const listarBoletas = async (req, res) => {
  try {
    const boletas = await Boleta.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Mascota,
          as: "mascota",
          attributes: ["id", "nombre"],
          include: [
            {
              model: Usuario,
              as: "dueno",
              attributes: ["id", "nombre", "apellido", "email"],
            },
          ],
        },
      ],
    });

    const resultado = boletas.map((b) => ({
      id: b.id,
      mascotaNombre: b.mascota?.nombre || null,
      dueno: b.mascota?.dueno
        ? `${b.mascota.dueno.nombre} ${b.mascota.dueno.apellido}`
        : null,
      tipoAtencion: b.tipoAtencion,
      motivo: b.motivo,
      total: Number(b.total),
      estado: b.estado,
      metodoPago: b.metodoPago || null,
      createdAt: b.createdAt,
    }));

    res.json(resultado);

  } catch (error) {
    console.error("❌ Error listando boletas:", error);
    res.status(500).json({ message: "Error al obtener boletas." });
  }
};


// ==========================================================
// 🟢 LISTAR SOLO BOLETAS DE HOY
// ==========================================================
export const listarBoletasHoy = async (req, res) => {
  try {
    const ahora = new Date();

    const inicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 0, 0, 0);
    const fin = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 23, 59, 59);

    const boletas = await Boleta.findAll({
      where: {
        createdAt: { [Op.between]: [inicio, fin] }
      },
      include: [
        {
          model: Mascota,
          as: "mascota",
          include: [{ model: Usuario, as: "dueno" }]
        }
      ],
      order: [["createdAt", "DESC"]],
    });

    const resultado = boletas.map(b => ({
      id: b.id,
      mascotaNombre: b.mascota?.nombre || "—",
      dueno: b.mascota?.dueno ? `${b.mascota.dueno.nombre} ${b.mascota.dueno.apellido}` : "—",
      tipoAtencion: b.tipoAtencion,
      motivo: b.motivo,
      totalInicial: Number(b.totalInicial),   // 🔥🔥 AGREGADO
      total: Number(b.total),
      estado: b.estado,
      metodoPago: b.metodoPago,
      createdAt: b.createdAt,
    }));

    res.json(resultado);

  } catch (error) {
    res.status(500).json({ message: "Error al obtener boletas del día." });
  }
};





// ==========================================================
// 🟢 LISTAR BOLETAS ANTERIORES (NO HOY)
// ==========================================================
export const listarBoletasAnteriores = async (req, res) => {
  try {
    const ahora = new Date();
    const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 0, 0, 0);

    const boletas = await Boleta.findAll({
      where: { createdAt: { [Op.lt]: inicioHoy } },
      include: [
        {
          model: Mascota,
          as: "mascota",
          include: [{ model: Usuario, as: "dueno" }]
        }
      ],
      order: [["createdAt", "DESC"]],
    });

    const resultado = boletas.map(b => ({
      id: b.id,
      mascotaNombre: b.mascota?.nombre || "—",
      dueno: b.mascota?.dueno ? `${b.mascota.dueno.nombre} ${b.mascota.dueno.apellido}` : "—",
      tipoAtencion: b.tipoAtencion,
      motivo: b.motivo,
      totalInicial: Number(b.totalInicial),  // 🔥🔥 AGREGADO
      total: Number(b.total),
      estado: b.estado,
      metodoPago: b.metodoPago,
      createdAt: b.createdAt,
    }));

    res.json(resultado);

  } catch (error) {
    res.status(500).json({ message: "Error al obtener boletas anteriores." });
  }
};




// ==========================================================
// 🟢 PAGAR BOLETA + REGISTRAR EN CAJA (SERVICIO / PRODUCTO / MIXTO)
// ==========================================================
export const marcarBoletaPagada = async (req, res) => {
  try {
    const { id } = req.params;
    const { metodoPago } = req.body;

    if (!metodoPago) {
      return res.status(400).json({ message: "El método de pago es obligatorio." });
    }

    // 1️⃣ Obtener boleta con detalles
    const boleta = await Boleta.findByPk(id, {
      include: [{ model: BoletaDetalle, as: "detalles" }],
    });

    if (!boleta) {
      return res.status(404).json({ message: "Boleta no encontrada." });
    }

    // 2️⃣ Calcular productos
    let totalProductos = 0;
    if (boleta.detalles.length > 0) {
      for (const item of boleta.detalles) {
        totalProductos += Number(item.cantidad) * Number(item.precioUnitario);
      }
    }

    const totalServicio = Number(boleta.totalInicial || 0);

    // 3️⃣ Marcar boleta
    boleta.estado = "pagado";
    boleta.metodoPago = metodoPago;

    if (totalServicio > 0 && totalProductos > 0) {
      boleta.tipoBoleta = "mixto";
    } else if (totalServicio > 0) {
      boleta.tipoBoleta = "servicio";
    } else {
      boleta.tipoBoleta = "producto";
    }

    await boleta.save();

    // 4️⃣ Caja abierta de hoy
    const hoy = new Date().toISOString().split("T")[0];

    const caja = await Caja.findOne({
      where: {
        estado: "abierta",
        fechaApertura: hoy,
      },
    });

    if (!caja) {
      return res.status(400).json({
        message: "No hay caja abierta para el día de hoy.",
      });
    }

    // 5️⃣ Movimientos
    if (totalServicio > 0) {
      await MovimientoCaja.create({
        cajaId: caja.id,
        usuarioId: req.usuario.id,
        tipo: "ingreso",
        descripcion: `Servicio Boleta #${boleta.id}`,
        monto: totalServicio,
        categoria: "servicio",
        metodoPago,
        boletaId: boleta.id,
      });
    }

    if (totalProductos > 0) {
      await MovimientoCaja.create({
        cajaId: caja.id,
        usuarioId: req.usuario.id,
        tipo: "ingreso",
        descripcion: `Productos Boleta #${boleta.id}`,
        monto: totalProductos,
        categoria: "producto",
        metodoPago,
        boletaId: boleta.id,
      });
    }

    // 6️⃣ Recalcular caja
    const movimientos = await MovimientoCaja.findAll({
      where: { cajaId: caja.id },
    });

    caja.totalServicios = movimientos
      .filter((m) => m.categoria === "servicio")
      .reduce((sum, m) => sum + Number(m.monto), 0);

    caja.totalProductos = movimientos
      .filter((m) => m.categoria === "producto")
      .reduce((sum, m) => sum + Number(m.monto), 0);

    caja.totalIngresosExtras = movimientos
      .filter((m) => m.categoria === "ingreso_extra")
      .reduce((sum, m) => sum + Number(m.monto), 0);

    caja.totalGastos = movimientos
      .filter((m) => m.tipo === "gasto")
      .reduce((sum, m) => sum + Number(m.monto), 0);

    caja.montoFinal =
      Number(caja.montoApertura) +
      Number(caja.totalServicios) +
      Number(caja.totalProductos) +
      Number(caja.totalIngresosExtras) -
      Number(caja.totalGastos);

    await caja.save();

    return res.json({
      message: "Boleta pagada correctamente y movimientos registrados.",
      boleta,
      caja,
    });

  } catch (error) {
    console.error("❌ Error en marcar pago:", error);
    res.status(500).json({ message: "Error al procesar pago." });
  }
};
