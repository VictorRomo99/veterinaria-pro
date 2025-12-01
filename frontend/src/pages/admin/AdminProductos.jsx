// src/pages/admin/AdminProductos.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminProductos.css";

const API = "http://localhost:4000";

export default function AdminProductos() {
  const token = localStorage.getItem("token");

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarProductos = async () => {
    try {
      const res = await axios.get(`${API}/api/productos`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProductos(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error cargando productos:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  return (
    <div className="prod-admin-container">
      <h2 className="prod-title">🧪 Gestión de Productos</h2>

      {loading ? (
        <p className="prod-loading">Cargando productos...</p>
      ) : (
        <div className="prod-card">

          {productos.length === 0 ? (
            <p className="prod-empty">No hay productos registrados.</p>
          ) : (
            <table className="prod-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Producto</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {productos.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.nombre}</td>

                    <td>S/ {Number(item.precio).toFixed(2)}</td>

                    <td className={item.stock <= item.stockMinimo ? "stock-bajo" : ""}>
                      {item.stock}
                    </td>

                    <td>{item.estado || "activo"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
