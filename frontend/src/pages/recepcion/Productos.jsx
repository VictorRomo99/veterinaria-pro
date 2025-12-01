// src/pages/Productos.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "./Productos.css";

const API = import.meta.env.VITE_API_URL;

export default function Productos() {
  const token = localStorage.getItem("token");

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    id: null,
    nombre: "",
    descripcion: "",
    categoria: "",
    precio: "",
    precioCompra: "",
    unidad: "",
    stockActual: "",
    stockMinimo: "",
  });

  // ============================
  // Cargar productos
  // ============================
  const cargarProductos = async () => {
    try {
      const res = await axios.get(`${API}/api/productos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProductos(res.data);
    } catch (err) {
      Swal.fire("Error", "No se pudieron cargar los productos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  // ============================
  // Guardar / Editar
  // ============================
  const guardarProducto = async () => {
    if (!form.nombre || !form.precio) {
      return Swal.fire(
        "Atención",
        "Nombre y precio de venta son obligatorios",
        "warning"
      );
    }

    const payload = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      categoria: form.categoria,
      precio: Number(form.precio) || 0,
      precioCompra: Number(form.precioCompra) || 0,
      unidad: form.unidad || null,
      stockActual: Number(form.stockActual) || 0,
      stockMinimo: Number(form.stockMinimo) || 0,
    };

    try {
      if (form.id) {
        await axios.put(`${API}/api/productos/${form.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        Swal.fire("Actualizado", "Producto actualizado", "success");
      } else {
        await axios.post(`${API}/api/productos`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        Swal.fire("Agregado", "Producto registrado", "success");
      }

      limpiar();
      cargarProductos();
    } catch (err) {
      const msg =
        err.response?.data?.message || "No se pudo guardar el producto";
      Swal.fire("Error", msg, "error");
    }
  };

  // ============================
  // Editar
  // ============================
  const editar = (p) => {
    setForm({
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion || "",
      categoria: p.categoria || "",
      precio: p.precio ?? "",
      precioCompra: p.precioCompra ?? "",
      unidad: p.unidad || "",
      stockActual: p.stockActual ?? "",
      stockMinimo: p.stockMinimo ?? "",
    });
  };

  // ============================
  // Eliminar
  // ============================
  const eliminar = async (p) => {
    const ok = await Swal.fire({
      title: "¿Eliminar producto?",
      text: p.nombre,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!ok.isConfirmed) return;

    try {
      await axios.delete(`${API}/api/productos/${p.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire("Eliminado", "Producto eliminado", "success");
      cargarProductos();
    } catch {
      Swal.fire("Error", "No se pudo eliminar", "error");
    }
  };

  // ============================
  // Venta rápida
  // ============================
  const venderProducto = async (p) => {
    const { value: formVenta } = await Swal.fire({
      title: `Venta rápida - ${p.nombre}`,
      html: `
        <div style="text-align:left">
          <p><strong>Precio:</strong> S/. ${Number(p.precio).toFixed(2)}</p>
        </div>
        <input id="swal-cantidad" type="number" min="1" class="swal2-input" placeholder="Cantidad" value="1" />
        <select id="swal-metodo" class="swal2-input">
          <option value="">Método de pago</option>
          <option value="efectivo">Efectivo</option>
          <option value="tarjeta">Tarjeta</option>
          <option value="yape">Yape</option>
          <option value="plin">Plin</option>
        </select>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Registrar venta",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        const cantidad = Number(document.getElementById("swal-cantidad").value);
        const metodoPago = document.getElementById("swal-metodo").value;

        if (!cantidad || cantidad <= 0 || !metodoPago) {
          Swal.showValidationMessage(
            "Ingresa una cantidad válida y un método de pago"
          );
          return;
        }

        return { cantidad, metodoPago };
      },
    });

    if (!formVenta) return;

    try {
      await axios.post(
        `${API}/api/productos/venta-rapida`,
        {
          productoId: p.id,
          cantidad: formVenta.cantidad,
          metodoPago: formVenta.metodoPago,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("Venta registrada", "La venta rápida fue registrada", "success");
      cargarProductos();
    } catch (err) {
      const msg =
        err.response?.data?.message || "No se pudo registrar la venta";
      Swal.fire("Error", msg, "error");
    }
  };

  // ============================
  // Limpiar
  // ============================
  const limpiar = () => {
    setForm({
      id: null,
      nombre: "",
      descripcion: "",
      categoria: "",
      precio: "",
      precioCompra: "",
      unidad: "",
      stockActual: "",
      stockMinimo: "",
    });
  };

  // ============================
  // RENDER
  // ============================
  return (
    <div className="productos-container">
      <h2 className="title">🛒 Gestión de Productos</h2>

      {/* FORMULARIO */}
      <div className="form-box">
        <input
          type="text"
          placeholder="Nombre del producto"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        />

        <textarea
          placeholder="Descripción"
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
        />

        <input
          type="text"
          placeholder="Categoría"
          value={form.categoria}
          onChange={(e) => setForm({ ...form, categoria: e.target.value })}
        />

        <div className="form-row">
          <div className="form-col">
            <label>Precio venta</label>
            <input
              type="number"
              placeholder="0.00"
              min="0"
              step="0.1"
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: e.target.value })}
            />
          </div>

          <div className="form-col">
            <label>Precio compra</label>
            <input
              type="number"
              placeholder="0.00"
              min="0"
              step="0.1"
              value={form.precioCompra}
              onChange={(e) =>
                setForm({ ...form, precioCompra: e.target.value })
              }
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-col">
            <label>Unidad</label>
            <input
              type="text"
              placeholder="unidad, caja, bolsa..."
              value={form.unidad}
              onChange={(e) => setForm({ ...form, unidad: e.target.value })}
            />
          </div>

          <div className="form-col">
            <label>Stock actual</label>
            <input
              type="number"
              min="0"
              value={form.stockActual}
              onChange={(e) =>
                setForm({ ...form, stockActual: e.target.value })
              }
            />
          </div>

          <div className="form-col">
            <label>Stock mínimo</label>
            <input
              type="number"
              min="0"
              value={form.stockMinimo}
              onChange={(e) =>
                setForm({ ...form, stockMinimo: e.target.value })
              }
            />
          </div>
        </div>

        <div className="btns">
          <button className="btn-save" onClick={guardarProducto}>
            {form.id ? "Actualizar" : "Agregar"}
          </button>

          {form.id && (
            <button className="btn-cancel" onClick={limpiar}>
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* TABLA */}
      <h3>Productos registrados</h3>

      {loading ? (
        <p>Cargando...</p>
      ) : productos.length === 0 ? (
        <p>No hay productos registrados</p>
      ) : (
        <table className="tabla-productos">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Stock mín.</th>
              <th>Unidad</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {productos.map((p) => {
              const stockBajo =
                p.stockMinimo > 0 && p.stockActual <= p.stockMinimo;

              return (
                <tr key={p.id}>
                  <td>{p.nombre}</td>
                  <td>{p.descripcion}</td>
                  <td>{p.categoria || "-"}</td>
                  <td>S/. {Number(p.precio).toFixed(2)}</td>
                  <td className={stockBajo ? "stock-bajo" : ""}>
                    {p.stockActual}
                  </td>
                  <td>{p.stockMinimo}</td>
                  <td>{p.unidad || "-"}</td>

                  {/* 🔧 NUEVAS ACCIONES PROFESIONALES */}
                  <td className="acciones-producto">
                    <button className="btn-accion editar" onClick={() => editar(p)}>
                      <i className="fa-solid fa-pen"></i>
                    </button>

                    <button className="btn-accion eliminar" onClick={() => eliminar(p)}>
                      <i className="fa-solid fa-trash"></i>
                    </button>

                    <button
                      className="btn-accion vender"
                      onClick={() => venderProducto(p)}
                      disabled={p.stockActual <= 0}
                    >
                      <i className="fa-solid fa-cart-shopping"></i>
                      Vender
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
