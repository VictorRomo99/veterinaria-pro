import Usuario from "../models/Usuario.js";
import Mascota from "../models/Mascota.js";
import Boleta from "../models/Boleta.js";
import BoletaDetalle from "../models/BoletaDetalle.js";
import Producto from "../models/Producto.js";
import MovimientoInventario from "../models/MovimientoInventario.js";
import Caja from "../models/Caja.js";
import MovimientoCaja from "../models/MovimientoCaja.js";
import Cita from "../models/Cita.js";
import Atencion from "../models/Atencion.js";

/* =====================================================
   📌 DASHBOARD — Resumen general del sistema
===================================================== */
export const getDashboardResumen = async (req, res) => {
  try {
    const totalUsuarios = await Usuario.count();
    const totalMascotas = await Mascota.count();
    const totalBoletas = await Boleta.count();

    const ventasHoy = await Boleta.sum("total", {
      where: { fecha: new Date().toISOString().slice(0, 10) },
    });

    const citasPendientes = await Cita.count({
      where: { estado: "pendiente" },
    });

    res.json({
      totalUsuarios,
      totalMascotas,
      totalBoletas,
      ventasHoy: ventasHoy || 0,
      citasPendientes,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =====================================================
   📌 LISTADO DE USUARIOS
===================================================== */
export const getUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: ["id", "nombre", "apellido", "email", "rol", "estado"],
      order: [["id", "DESC"]],
    });

    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/* =====================================================
   📌 PRODUCTOS CON STOCK BAJO
===================================================== */
export const getProductosStock = async (req, res) => {
  try {
    const productos = await Producto.findAll({
      where: {
        stock: { lt: 5 },
      },
      order: [["stock", "ASC"]],
    });

    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =====================================================
   📌 MOVIMIENTOS DE CAJA
===================================================== */
export const getMovimientosCaja = async (req, res) => {
  try {
    const movimientos = await MovimientoCaja.findAll({
      order: [["id", "DESC"]],
      limit: 50,
    });

    res.json(movimientos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =====================================================
   📌 CITAS — RESUMEN
===================================================== */
export const getCitasResumen = async (req, res) => {
  try {
    const pendientes = await Cita.count({ where: { estado: "pendiente" } });
    const atendidas = await Cita.count({ where: { estado: "atendida" } });
    const canceladas = await Cita.count({ where: { estado: "cancelada" } });

    res.json({ pendientes, atendidas, canceladas });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =====================================================
   📌 ATENCIONES — RESUMEN
===================================================== */
export const getAtencionesResumen = async (req, res) => {
  try {
    const totalAtenciones = await Atencion.count();
    const ultimasAtenciones = await Atencion.findAll({
      limit: 10,
      order: [["id", "DESC"]],
    });

    res.json({
      totalAtenciones,
      ultimasAtenciones,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =====================================================
   📌 REPORTE DE VENTAS (Boletas)
===================================================== */
export const getReportesVentas = async (req, res) => {
  try {
    const totalVentas = await Boleta.sum("total");
    const boletasRecientes = await Boleta.findAll({
      include: [
        { model: BoletaDetalle, as: "detalles" },
        { model: Mascota, as: "mascota" },
      ],
      limit: 30,
      order: [["id", "DESC"]],
    });

    res.json({
      totalVentas: totalVentas || 0,
      boletasRecientes,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =====================================================
   📌 CONFIGURACIÓN DE CLÍNICA
   (Si más adelante quieres crear tabla Config)
===================================================== */
let CONFIG = {
  nombre: "Clínica Veterinaria Tu Mejor Pata",
  direccion: "Jr. Principal 123",
  telefono: "999999999",
  igv: 18,
};

export const getConfig = async (req, res) => {
  res.json(CONFIG);
};

export const updateConfig = async (req, res) => {
  CONFIG = { ...CONFIG, ...req.body };
  res.json({ msg: "Configuración actualizada", CONFIG });
};
/* =====================================================
   📌 ACTUALIZAR ROL DE USUARIO
===================================================== */
export const updateRol = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.body;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado." });

    usuario.rol = rol;
    await usuario.save();

    res.json({ message: "Rol actualizado correctamente." });
  } catch (error) {
    console.error("Error updateRol:", error);
    res.status(500).json({ message: "Error al actualizar el rol." });
  }
};

/* =====================================================
   📌 ACTUALIZAR ESTADO (ACTIVAR / DESACTIVAR)
===================================================== */
export const updateEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado." });

    usuario.estado = estado;
    await usuario.save();

    res.json({ message: "Estado actualizado correctamente." });
  } catch (error) {
    console.error("Error updateEstado:", error);
    res.status(500).json({ message: "Error al actualizar el estado." });
  }
};
