import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "./ProductosPanel.css";

const API = import.meta.env.VITE_API_URL;

export default function ProductosPanel() {
  const token = localStorage.getItem("token");

  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState({
    id: null,
    nombre: "",
    descripcion: "",
    categoria: "",
    precio: "",
  });

  // ===============================
  // Cargar lista de productos
  // ===============================
  const cargarProductos = async () => {
    try {
      const res = await axios.get(`${API}/api/productos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProductos(res.data);
    } catch (err) {
      console.log(err);
      Swal.fire("Error", "No se pudieron cargar los productos", "error");
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  // ===============================
  // Guardar o editar producto
  // ===============================
  const guardarProducto = async () => {
    if (!form.nombre || !form.precio) {
      return Swal.fire("Atención", "Nombre y precio son obligatorios", "warning");
    }

    try {
      if (form.id) {
        // EDITAR
        await axios.put(
          `${API}/api/productos/${form.id}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Swal.fire("Actualizado", "Producto actualizado correctamente", "success");
      } else {
        // CREAR
        await axios.post(
          `${API}/api/productos`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Swal.fire("Creado", "Producto agregado correctamente", "success");
      }

      setForm({ id: null, nombre: "", descripcion: "", categoria: "", precio: "" });
      cargarProductos();
    } catch (err) {
      console.log(err);
      Swal.fire("Error", "No se pudo guardar el producto", "error");
    }
  };

  // ===============================
  // Editar producto
  // ===============================
  const editarProducto = (p) => {
    setForm({
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion,
      precio: p.precio,
      categoria: p.categoria,
    });
  };

  // ===============================
  // Eliminar producto
  // ===============================
  const eliminarProducto = async (id) => {
    const ok = await Swal.fire({
      title: "¿Eliminar este producto?",
      icon: "warning",
      showCancelButton: true,
    });

    if (!ok.isConfirmed) return;

    try {
      await axios.delete(`${API}/api/productos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      cargarProductos();
      Swal.fire("Eliminado", "Producto eliminado", "success");
    } catch (err) {
      Swal.fire("Error", "No se pudo eliminar el producto", "error");
    }
  };

  return (
    <div className="panel-productos">
      <h2>📦 Gestión de Productos</h2>

      <div className="form-producto">
        <input
          type="text"
          placeholder="Nombre"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        />

        <input
          type="text"
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

        <input
          type="number"
          placeholder="Precio"
          value={form.precio}
          onChange={(e) => setForm({ ...form, precio: e.target.value })}
        />

        <button onClick={guardarProducto} className="btn-save">
          {form.id ? "Actualizar" : "Agregar"}
        </button>
      </div>

      <table className="tabla-productos">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {productos.map((p) => (
            <tr key={p.id}>
              <td>{p.nombre}</td>
              <td>{p.descripcion}</td>
              <td>{p.categoria}</td>
              <td>S/. {Number(p.precio).toFixed(2)}</td>
              <td>
                <button onClick={() => editarProducto(p)}>✏️</button>
                <button onClick={() => eliminarProducto(p.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
