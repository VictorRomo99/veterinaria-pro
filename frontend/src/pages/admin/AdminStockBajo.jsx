// src/pages/admin/AdminStockBajo.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminStockBajo.css";

const API = "http://localhost:4000";

export default function AdminStockBajo() {
  const token = localStorage.getItem("token");

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarStockBajo = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/productos/stock-bajo`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProductos(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error cargando stock bajo:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarStockBajo();
  }, []);

  return (
    <div className="stockbajo-container">
      <h2 className="stockbajo-title">⚠️ Productos con Stock Bajo</h2>

      {loading ? (
        <p className="stockbajo-loading">Cargando información...</p>
      ) : (
        <div className="stockbajo-card">
          {productos.length === 0 ? (
            <p className="stockbajo-empty">No hay productos con stock bajo.</p>
          ) : (
            <table className="stockbajo-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Producto</th>
                  <th>Stock</th>
                  <th>Stock Mínimo</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((item) => (
                  <tr key={item.id} className="stockbajo-row">
                    <td>{item.id}</td>
                    <td>{item.nombre}</td>
                    <td className="low">{item.stock}</td>
                    <td>{item.stockMinimo ?? 5}</td>
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
