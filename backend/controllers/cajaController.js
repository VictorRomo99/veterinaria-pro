// backend/controllers/cajaController.js
import Caja from "../models/Caja.js";
import MovimientoCaja from "../models/MovimientoCaja.js";
import Boleta from "../models/Boleta.js";
import BoletaDetalle from "../models/BoletaDetalle.js";
import Mascota from "../models/Mascota.js";

import { Op } from "sequelize";

// ===============================
// 📌 ABRIR CAJA
// ===============================
export const abrirCaja = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const hoy = new Date().toISOString().split("T")[0];

    const cajaAbierta = await Caja.findOne({
      where: {
        fechaApertura: hoy,
        estado: "abierta",
      },
    });

    if (cajaAbierta) {
      return res.status(400).json({
        message: "Ya existe una caja abierta el día de hoy.",
        caja: cajaAbierta,
      });
    }

    const horaActual = new Date().toLocaleTimeString("es-PE", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const nuevaCaja = await Caja.create({
  usuarioId,
  fechaApertura: hoy,
  horaApertura: horaActual,

  // 🔥 INICIALIZAR TODO A CERO
  montoApertura: 0,
  totalServicios: 0,
  totalProductos: 0,
  totalIngresosExtras: 0,
  totalGastos: 0,
  totalIngresos: 0,
  totalEgresos: 0,
  montoFinal: 0,
  diferencia: 0,

  estado: "abierta",
});


    res.json({
      message: "Caja abierta correctamente.",
      caja: nuevaCaja,
    });
  } catch (error) {
    console.error("❌ Error al abrir caja:", error);
    res.status(500).json({ message: "Error al abrir caja." });
  }
};

// ===============================
// 📌 OBTENER CAJA DEL DÍA (SOLO INFO BASE)
// ===============================
export const obtenerCajaDelDia = async (req, res) => {
  try {
    const hoy = new Date().toISOString().split("T")[0];

    const caja = await Caja.findOne({
      where: {
        fechaApertura: hoy,
        estado: "abierta",
      },
    });

    res.json(caja || null);
  } catch (error) {
    console.error("❌ Error obteniendo caja del día:", error);
    res.status(500).json({ message: "Error al obtener caja del día." });
  }
};

// ===============================
// 📌 REGISTRAR INGRESO EXTRA
// ===============================
export const registrarIngresoExtra = async (req, res) => {
  try {
    const { cajaId, descripcion, monto } = req.body;

    if (!descripcion || !monto) {
      return res.status(400).json({
        message: "Descripción y monto son obligatorios.",
      });
    }

    const movimiento = await MovimientoCaja.create({
      cajaId,
      usuarioId: req.usuario.id,
      tipo: "ingreso",
      descripcion,
      monto,
      categoria: "ingreso_extra",
    });

    await recalcularTotalesCaja(cajaId);

    res.json({
      message: "Ingreso extra registrado.",
      movimiento,
    });
  } catch (error) {
    console.error("❌ Error ingreso extra:", error);
    res.status(500).json({ message: "Error al registrar ingreso extra." });
  }
};

// ===============================
// 📌 REGISTRAR GASTO
// ===============================
export const registrarGasto = async (req, res) => {
  try {
    const { cajaId, descripcion, monto } = req.body;

    if (!descripcion || !monto) {
      return res.status(400).json({
        message: "Descripción y monto son obligatorios.",
      });
    }

    const movimiento = await MovimientoCaja.create({
      cajaId,
      usuarioId: req.usuario.id,
      tipo: "gasto",
      descripcion,
      monto,
      categoria: "gasto_general",
    });

    await recalcularTotalesCaja(cajaId);

    res.json({
      message: "Gasto registrado.",
      movimiento,
    });
  } catch (error) {
    console.error("❌ Error gasto:", error);
    res.status(500).json({ message: "Error al registrar gasto." });
  }
};

// ===============================
// 📌 CERRAR CAJA
// ===============================
export const cerrarCaja = async (req, res) => {
  try {
    const { cajaId, montoFinalReal } = req.body;

    const caja = await Caja.findByPk(cajaId);

    if (!caja) {
      return res.status(404).json({ message: "Caja no encontrada." });
    }

    const horaActual = new Date().toLocaleTimeString("es-PE", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    caja.fechaCierre = new Date().toISOString().split("T")[0];
    caja.horaCierre = horaActual;
    caja.estado = "cerrada";

    caja.diferencia = Number(montoFinalReal) - Number(caja.montoFinal);
    caja.montoFinal = montoFinalReal;

    await caja.save();

    res.json({
      message: "Caja cerrada correctamente.",
      caja,
    });
  } catch (error) {
    console.error("❌ Error al cerrar caja:", error);
    res.status(500).json({ message: "Error al cerrar caja." });
  }
};

// ===============================
// 📌 HISTORIAL DE CAJAS
// ===============================
export const historialCajas = async (req, res) => {
  try {
   const hoy = new Date().toISOString().split("T")[0];

const caja = await Caja.findOne({
  where: {
    estado: "abierta",
    fechaApertura: hoy
  }
});



    res.json(cajas);
  } catch (error) {
    console.error("❌ Historial cajas error:", error);
    res.status(500).json({ message: "Error al obtener historial." });
  }
};

// ===============================
// 📌 FUNCIÓN GLOBAL PARA RECALCULAR
// ===============================
const recalcularTotalesCaja = async (cajaId) => {
  const movimientos = await MovimientoCaja.findAll({ where: { cajaId } });

  const totalIngresosExtras = movimientos
    .filter((m) => m.tipo === "ingreso")
    .reduce((sum, m) => sum + Number(m.monto), 0);

  const totalGastos = movimientos
    .filter((m) => m.tipo === "gasto")
    .reduce((sum, m) => sum + Number(m.monto), 0);

  const caja = await Caja.findByPk(cajaId);

  if (caja) {
    caja.totalIngresosExtras = totalIngresosExtras;
    caja.totalGastos = totalGastos;

    caja.totalEgresos = totalGastos;

    caja.montoFinal =
      Number(caja.montoApertura) +
      Number(caja.totalServicios) +
      Number(caja.totalProductos) +
      Number(totalIngresosExtras) -
      Number(totalGastos);

    await caja.save();
  }
};

// ===================================================================
// 🔥 FUNCIÓN CORRECTA PARA CALCULAR SERVICIOS + PRODUCTOS SIN DUPLICAR
// ===================================================================
export const obtenerCajaConTotales = async (req, res) => {
  try {
    const hoy = new Date().toISOString().split("T")[0];

    const caja = await Caja.findOne({
      where: { fechaApertura: hoy, estado: "abierta" },
    });

    if (!caja) return res.json(null);

    // ============================
    // 🔥 LEER TODOS LOS MOVIMIENTOS
    // ============================
    const movimientos = await MovimientoCaja.findAll({
      where: { cajaId: caja.id },
    });

    // ============================
    // 🔥 CALCULAR TOTALES REALES
    // ============================
    const totalServicios = movimientos
      .filter(m => m.categoria === "servicio" || m.categoria === "mixto")
      .reduce((sum, m) => sum + Number(m.monto), 0);

    const totalProductos = movimientos
      .filter(m => m.categoria === "producto" || m.categoria === "mixto")
      .reduce((sum, m) => sum + Number(m.monto), 0);

    const totalIngresosExtras = movimientos
      .filter(m => m.categoria === "ingreso_extra")
      .reduce((sum, m) => sum + Number(m.monto), 0);

    const totalGastos = movimientos
      .filter(m => m.tipo === "gasto")
      .reduce((sum, m) => sum + Number(m.monto), 0);
    
    // ⭐ NUEVO: TOTALES POR MÉTODO DE PAGO
const totalEfectivo = movimientos
  .filter(m => m.tipo === "ingreso" && m.metodoPago === "efectivo")
  .reduce((sum, m) => sum + Number(m.monto), 0);

const totalTarjeta = movimientos
  .filter(m => m.tipo === "ingreso" && m.metodoPago === "tarjeta")
  .reduce((sum, m) => sum + Number(m.monto), 0);

const totalYape = movimientos
  .filter(m => m.tipo === "ingreso" && m.metodoPago === "yape")
  .reduce((sum, m) => sum + Number(m.monto), 0);

const totalPlin = movimientos
  .filter(m => m.tipo === "ingreso" && m.metodoPago === "plin")
  .reduce((sum, m) => sum + Number(m.monto), 0);


    // ============================
    // 🔥 TOTAL CALCULADO REAL
    // ============================
    const totalCalculado =
      Number(caja.montoApertura) +
      totalServicios +
      totalProductos +
      totalIngresosExtras -
      totalGastos;

    // ============================
    // 🔥 DEVOLVER DATOS AL FRONTEND
    // ============================
    return res.json({
      ...caja.dataValues,
      totalServicios,
      totalProductos,
      totalIngresosExtras,
      totalGastos,
      totalCalculado,
      montoFinal: totalCalculado,
      // ⭐ NUEVOS CAMPOS
  totalEfectivo,
  totalTarjeta,
  totalYape,
  totalPlin,
    });

  } catch (error) {
    console.error("❌ Error obtener caja con totales:", error);
    res.status(500).json({ message: "Error al obtener caja." });
  }
};
// ===================================================================
// 📋 OBTENER MOVIMIENTOS DE UNA CAJA (PARA REPORTE / DETALLE)
// ===================================================================
export const obtenerMovimientosCaja = async (req, res) => {
  try {
    const { cajaId } = req.params;

    const movimientos = await MovimientoCaja.findAll({
      where: { cajaId },
      order: [
        ["fechaMovimiento", "ASC"],
        ["id", "ASC"],
      ],
    });

    return res.json(movimientos);
  } catch (error) {
    console.error("❌ Error obtener movimientos de caja:", error);
    res.status(500).json({ message: "Error al obtener movimientos." });
  }
};