// src/pages/recepcion/ModalAgregarProducto.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "./ModalAgregarProducto.css";

const API = import.meta.env.VITE_API_URL;

export default function ModalAgregarProducto({ boleta, onClose, onAdded }) {
  const token = localStorage.getItem("token");

  const [productos, setProductos] = useState([]);
  const [detalles, setDetalles] = useState([]);

  const [productoId, setProductoId] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [precio, setPrecio] = useState("");

  const [editId, setEditId] = useState(null);
  const [editCantidad, setEditCantidad] = useState(1);
  const [editPrecio, setEditPrecio] = useState(0);

  const cargarProductos = async () => {
    try {
      const res = await axios.get(`${API}/api/productos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProductos(res.data);
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: "No se pudieron cargar los productos",
        icon: "error",
      });
    }
  };

  const cargarDetalles = async () => {
    try {
      const res = await axios.get(
        `${API}/api/boletas/detalles/${boleta.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDetalles(res.data);
    } catch (err) {}
  };

  useEffect(() => {
    cargarProductos();
    cargarDetalles();
  }, [boleta.id]);

  const seleccionarProducto = (id) => {
    setProductoId(id);
    const p = productos.find((x) => x.id === Number(id));
    if (p) {
      setDescripcion(`${p.nombre} — ${p.descripcion || ""}`);
      setPrecio(p.precio);
      setCantidad(1);
    }
  };

  const guardar = async () => {
    if (!descripcion || !precio) {
      return Swal.fire("Atención", "Completa los campos", "warning");
    }

    try {
      await axios.post(
        `${API}/api/boletas/detalles/${boleta.id}`,
        {
          productoId: productoId || null,
          descripcion,
          cantidad: Number(cantidad),
          precioUnitario: Number(precio),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("✔️", "Producto agregado", "success");

      cargarDetalles();
      onAdded && onAdded();

      setProductoId("");
      setDescripcion("");
      setCantidad(1);
      setPrecio("");
    } catch (error) {
      Swal.fire("Error", "No se pudo agregar", "error");
    }
  };

  const activarEdicion = (item) => {
    setEditId(item.id);
    setEditCantidad(item.cantidad);
    setEditPrecio(item.precioUnitario);
  };

  const guardarEdicion = async () => {
    try {
      await axios.put(
        `${API}/api/boletas/detalles/item/${editId}`,
        {
          cantidad: Number(editCantidad),
          precioUnitario: Number(editPrecio),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("✔️", "Producto actualizado", "success");

      setEditId(null);
      cargarDetalles();
      onAdded && onAdded();
    } catch (err) {
      Swal.fire("Error", "No se pudo actualizar", "error");
    }
  };

  const eliminar = async (id) => {
    const ok = await Swal.fire({
      title: "¿Eliminar?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!ok.isConfirmed) return;

    try {
      await axios.delete(`${API}/api/boletas/detalles/item/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire("Eliminado", "Producto eliminado", "success");

      cargarDetalles();
      onAdded && onAdded();
    } catch (err) {
      Swal.fire("Error", "No se pudo eliminar", "error");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>Agregar productos a la boleta #{boleta.id}</h3>

        <select value={productoId} onChange={(e) => seleccionarProducto(e.target.value)}>
          <option value="">Selecciona un producto</option>
          {productos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre} — S/. {p.precio}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />

        <input
          type="number"
          min="1"
          placeholder="Cantidad"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
        />

        <input
          type="number"
          min="0"
          step="0.1"
          placeholder="Precio unitario"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
        />

        <button className="btn-save" onClick={guardar}>
          ➕ Agregar
        </button>

        <h4>Productos agregados</h4>

        <table className="tabla-detalles">
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Cant.</th>
              <th>PU</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {detalles.map((d) => (
              <tr key={d.id}>
                <td>{d.descripcion}</td>

                {editId === d.id ? (
                  <>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={editCantidad}
                        onChange={(e) => setEditCantidad(e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={editPrecio}
                        onChange={(e) => setEditPrecio(e.target.value)}
                      />
                    </td>
                    <td>S/. {(editCantidad * editPrecio).toFixed(2)}</td>
                    <td>
                      <button className="btn-save" onClick={guardarEdicion}>
                        💾 Guardar
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{d.cantidad}</td>
                    <td>S/. {Number(d.precioUnitario).toFixed(2)}</td>
                    <td>S/. {Number(d.subtotal).toFixed(2)}</td>
                    <td>
                      <button className="btn-edit" onClick={() => activarEdicion(d)}>
                        ✏️
                      </button>
                      <button className="btn-delete" onClick={() => eliminar(d.id)}>
                        🗑️
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        <button className="btn-close" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
