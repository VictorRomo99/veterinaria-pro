// backend/controllers/productoController.js
import Producto from "../models/Producto.js";
import Boleta from "../models/Boleta.js";
import BoletaDetalle from "../models/BoletaDetalle.js";
import Caja from "../models/Caja.js";
import MovimientoCaja from "../models/MovimientoCaja.js";
import MovimientoInventario from "../models/MovimientoInventario.js";

// =====================================================
// 🟢 Crear producto
// =====================================================
export const crearProducto = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      precio,
      categoria,
      precioCompra,
      stockActual,
      stockMinimo,
      unidad,
      activo,
    } = req.body;

    const producto = await Producto.create({
      nombre,
      descripcion,
      categoria,
      precio: Number(precio) || 0,
      precioCompra: Number(precioCompra) || 0,
      stockActual: Number(stockActual) || 0,
      stockMinimo: Number(stockMinimo) || 0,
      unidad: unidad || null,
      activo: activo !== undefined ? activo : true,
    });

    res.status(201).json({ message: "Producto creado.", producto });
  } catch (error) {
    console.error("❌ Error creando producto:", error);
    res.status(500).json({ message: "Error al crear producto." });
  }
};

// =====================================================
// 📄 Listar productos
// =====================================================
export const listarProductos = async (req, res) => {
  try {
    const productos = await Producto.findAll({
      order: [["nombre", "ASC"]],
    });

    res.json(productos);
  } catch (error) {
    console.error("❌ Error listando productos:", error);
    res.status(500).json({ message: "Error al obtener productos." });
  }
};

// =====================================================
// ✏ Actualizar producto
// =====================================================
export const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findByPk(id);

    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }

    const data = { ...req.body };

    // Convertir numéricos correctamente
    if (data.precio != null) data.precio = Number(data.precio);
    if (data.precioCompra != null) data.precioCompra = Number(data.precioCompra);
    if (data.stockActual != null) data.stockActual = Number(data.stockActual);
    if (data.stockMinimo != null) data.stockMinimo = Number(data.stockMinimo);

    await producto.update(data);

    res.json({ message: "Producto actualizado.", producto });
  } catch (error) {
    console.error("❌ Error actualizando producto:", error);
    res.status(500).json({ message: "Error al actualizar producto." });
  }
};

// =====================================================
// 🗑 Eliminar producto
// =====================================================
export const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findByPk(id);

    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }

    await producto.destroy();

    res.json({ message: "Producto eliminado." });
  } catch (error) {
    console.error("❌ Error eliminando producto:", error);
    res.status(500).json({ message: "Error al eliminar producto." });
  }
};

// =====================================================
// 🛒 Venta rápida (boleta + caja + inventario)
// =====================================================
export const ventaRapidaProducto = async (req, res) => {
  try {
    const { productoId, cantidad, metodoPago } = req.body;

    const cant = Number(cantidad);

    if (!productoId || !cant || cant <= 0 || !metodoPago) {
      return res
        .status(400)
        .json({ message: "Datos de venta incompletos o inválidos." });
    }

    const producto = await Producto.findByPk(productoId);
    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }

    if (Number(producto.stockActual) < cant) {
      return res.status(400).json({
        message: `Stock insuficiente. Stock actual: ${producto.stockActual}`,
      });
    }

    // Buscar caja abierta hoy
    const hoy = new Date().toISOString().split("T")[0];

    const caja = await Caja.findOne({
      where: { estado: "abierta", fechaApertura: hoy },
    });

    if (!caja) {
      return res.status(400).json({
        message: "No hay caja abierta para hoy. Abre la caja antes de vender.",
      });
    }

    const total = Number(producto.precio) * cant;

    // Crear boleta simple
    const boleta = await Boleta.create({
      historiaId: null,
      mascotaId: null,
      tipoAtencion: "Venta de producto",
      motivo: producto.nombre,
      totalInicial: 0,
      total,
      tipoBoleta: "producto",
      metodoPago,
      estado: "pagado",
    });

    // Detalle de boleta
    await BoletaDetalle.create({
      boletaId: boleta.id,
      productoId: producto.id,
      descripcion: producto.nombre,
      cantidad: cant,
      precioUnitario: producto.precio,
      subtotal: total,
    });

    // Actualizar inventario
    const nuevoStock = Number(producto.stockActual) - cant;
    await producto.update({ stockActual: nuevoStock });

    await MovimientoInventario.create({
      productoId: producto.id,
      tipo: "salida",
      cantidad: cant,
      motivo: `Venta rápida - Boleta #${boleta.id}`,
      boletaId: boleta.id,
      usuarioId: req.usuario?.id || null,
    });

    // Registrar en caja
    await MovimientoCaja.create({
      cajaId: caja.id,
      usuarioId: req.usuario?.id,
      tipo: "ingreso",
      descripcion: `Venta rápida producto ${producto.nombre} - Boleta #${boleta.id}`,
      monto: total,
      categoria: "producto",
      metodoPago,
      boletaId: boleta.id,
    });

    // Recalcular caja
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

    res.status(201).json({
      message: "Venta rápida registrada correctamente.",
      boleta,
      producto,
      caja,
    });
  } catch (error) {
    console.error("❌ Error en venta rápida:", error);
    res.status(500).json({ message: "Error al procesar venta rápida." });
  }
};
