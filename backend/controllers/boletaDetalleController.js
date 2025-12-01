// backend/controllers/boletaDetalleController.js
import Boleta from "../models/Boleta.js";
import BoletaDetalle from "../models/BoletaDetalle.js";

// ⭐ NUEVO: para manejo de inventario
import Producto from "../models/Producto.js";
import MovimientoInventario from "../models/MovimientoInventario.js";

// =====================================================
// 🔥 Recalcular total de la boleta
// =====================================================
const recalcularTotal = async (boletaId) => {
  const boleta = await Boleta.findByPk(boletaId);
  if (!boleta) return;

  const detalles = await BoletaDetalle.findAll({ where: { boletaId } });

  const sumaDetalles = detalles.reduce(
    (acc, det) => acc + Number(det.subtotal),
    0
  );

  const totalFinal = Number(boleta.totalInicial) + sumaDetalles;

  await boleta.update({ total: totalFinal });
};

// =====================================================
// ➕ Agregar detalle
// =====================================================
export const agregarDetalle = async (req, res) => {
  try {
    const { boletaId } = req.params;
    const { descripcion, cantidad, precioUnitario, productoId } = req.body;

    const cant = Number(cantidad);
    const precio = Number(precioUnitario);

    if (!descripcion || cant <= 0 || precio <= 0) {
      return res
        .status(400)
        .json({ message: "Datos incompletos o inválidos." });
    }

    // ⭐ Si es producto, validar stock antes
    if (productoId) {
      const producto = await Producto.findByPk(productoId);

      if (!producto) {
        return res
          .status(404)
          .json({ message: "Producto asociado no encontrado." });
      }

      if (Number(producto.stockActual) < cant) {
        return res.status(400).json({
          message: `Stock insuficiente para "${producto.nombre}". Stock actual: ${producto.stockActual}`,
        });
      }
    }

    const nuevo = await BoletaDetalle.create({
      boletaId,
      productoId: productoId || null,
      descripcion,
      cantidad: cant,
      precioUnitario: precio,
      subtotal: cant * precio,
    });

    // ⭐ Si es producto, descontar stock y registrar movimiento
    if (productoId) {
      const producto = await Producto.findByPk(productoId);

      if (producto) {
        const nuevoStock = Number(producto.stockActual) - cant;

        await producto.update({ stockActual: nuevoStock });

        await MovimientoInventario.create({
          productoId,
          tipo: "salida",
          cantidad: cant,
          motivo: `Venta - Boleta #${boletaId}`,
          boletaId: Number(boletaId),
          usuarioId: req.usuario?.id || null,
        });
      }
    }

    // 🔥 Recalcular total
    await recalcularTotal(boletaId);

    // 🔍 Determinar si es producto, servicio o mixto
    const detalles = await BoletaDetalle.findAll({ where: { boletaId } });

    const tieneProductos = detalles.some((d) => d.productoId !== null);
    const tieneServicios = detalles.some((d) => d.productoId === null);

    let tipoBoleta = "servicio";
    if (tieneProductos && tieneServicios) tipoBoleta = "mixto";
    else if (tieneProductos) tipoBoleta = "producto";

    // 🔥 Guardar tipo de boleta automáticamente
    const boleta = await Boleta.findByPk(boletaId);
    await boleta.update({ tipoBoleta });

    res.status(201).json({
      message: "Item agregado a la boleta.",
      detalle: nuevo,
      tipoBoleta,
    });
  } catch (error) {
    console.error("❌ Error agregando detalle:", error);
    res.status(500).json({ message: "Error agregando detalle." });
  }
};

// =====================================================
// 📄 Listar detalles
// =====================================================
export const listarDetalles = async (req, res) => {
  try {
    const { boletaId } = req.params;

    const detalles = await BoletaDetalle.findAll({
      where: { boletaId },
      order: [["id", "ASC"]],
    });

    res.json(detalles);
  } catch (error) {
    console.error("❌ Error listando detalles:", error);
    res.status(500).json({ message: "Error al obtener los detalles." });
  }
};

// =====================================================
// ✏ Actualizar detalle
// =====================================================
export const actualizarDetalle = async (req, res) => {
  try {
    const { id } = req.params;
    const detalle = await BoletaDetalle.findByPk(id);

    if (!detalle) {
      return res.status(404).json({ message: "Detalle no encontrado." });
    }

    const { cantidad, precioUnitario } = req.body;
    const nuevaCantidad = Number(cantidad);
    const nuevoPrecio = Number(precioUnitario);

    if (nuevaCantidad <= 0 || nuevoPrecio <= 0) {
      return res
        .status(400)
        .json({ message: "Cantidad o precio inválidos." });
    }

    // ⭐ Si el detalle está asociado a un producto → ajustar stock
    if (detalle.productoId) {
      const producto = await Producto.findByPk(detalle.productoId);

      if (producto) {
        const cantidadAnterior = Number(detalle.cantidad);
        const diferencia = nuevaCantidad - cantidadAnterior; // >0 = se agregan unidades, <0 = se quitan

        if (diferencia > 0) {
          // Necesitamos MÁS stock
          if (Number(producto.stockActual) < diferencia) {
            return res.status(400).json({
              message: `Stock insuficiente para ajustar "${producto.nombre}". Stock actual: ${producto.stockActual}`,
            });
          }

          const nuevoStock = Number(producto.stockActual) - diferencia;
          await producto.update({ stockActual: nuevoStock });

          await MovimientoInventario.create({
            productoId: producto.id,
            tipo: "salida",
            cantidad: diferencia,
            motivo: `Ajuste detalle (aumento) - Boleta #${detalle.boletaId}`,
            boletaId: detalle.boletaId,
            usuarioId: req.usuario?.id || null,
          });
        } else if (diferencia < 0) {
          // Se reducen unidades → devolvemos al stock
          const devolver = Math.abs(diferencia);
          const nuevoStock = Number(producto.stockActual) + devolver;
          await producto.update({ stockActual: nuevoStock });

          await MovimientoInventario.create({
            productoId: producto.id,
            tipo: "entrada",
            cantidad: devolver,
            motivo: `Ajuste detalle (disminución) - Boleta #${detalle.boletaId}`,
            boletaId: detalle.boletaId,
            usuarioId: req.usuario?.id || null,
          });
        }
      }
    }

    await detalle.update({
      ...req.body,
      subtotal: nuevaCantidad * nuevoPrecio,
    });

    await recalcularTotal(detalle.boletaId);

    res.json({
      message: "Detalle actualizado.",
      detalle,
    });
  } catch (error) {
    console.error("❌ Error actualizando detalle:", error);
    res.status(500).json({ message: "Error al actualizar el detalle." });
  }
};

// =====================================================
// 🗑 Eliminar detalle
// =====================================================
export const eliminarDetalle = async (req, res) => {
  try {
    const { id } = req.params;

    const detalle = await BoletaDetalle.findByPk(id);
    if (!detalle) {
      return res.status(404).json({ message: "Detalle no encontrado." });
    }

    const boletaId = detalle.boletaId;

    // ⭐ Si era un producto → devolver stock y registrar entrada
    if (detalle.productoId) {
      const producto = await Producto.findByPk(detalle.productoId);

      if (producto) {
        const cant = Number(detalle.cantidad);
        const nuevoStock = Number(producto.stockActual) + cant;

        await producto.update({ stockActual: nuevoStock });

        await MovimientoInventario.create({
          productoId: producto.id,
          tipo: "entrada",
          cantidad: cant,
          motivo: `Eliminación detalle - Boleta #${boletaId}`,
          boletaId: boletaId,
          usuarioId: req.usuario?.id || null,
        });
      }
    }

    await detalle.destroy();
    await recalcularTotal(boletaId);

    res.json({ message: "Detalle eliminado." });
  } catch (error) {
    console.error("❌ Error eliminando detalle:", error);
    res.status(500).json({ message: "Error al eliminar el detalle." });
  }
};
