// src/pages/admin/AdminCaja.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminCaja.css";

const API = import.meta.env.VITE_API_URL;

export default function AdminCaja() {
  const token = localStorage.getItem("token");

  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarMovimientos = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/caja/movimientos`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMovimientos(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error cargando movimientos:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMovimientos();
  }, []);

  return (
    <div className="caja-admin-container">
      <h2 className="caja-title">💵 Supervisión de Caja</h2>

      {loading ? (
        <p className="caja-loading">Cargando movimientos...</p>
      ) : (
        <div className="caja-card">
          <h3>Últimos movimientos de caja</h3>

          {movimientos.length === 0 ? (
            <p className="caja-empty">No se encontraron movimientos.</p>
          ) : (
            <table className="caja-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Descripción</th>
                  <th>Monto</th>
                  <th>Tipo</th>
                  <th>Fecha</th>
                </tr>
              </thead>

              <tbody>
                {movimientos.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.descripcion}</td>
                    <td>S/ {Number(item.monto).toFixed(2)}</td>
                    <td className={item.tipo === "ingreso" ? "ingreso" : "egreso"}>
                      {item.tipo}
                    </td>
                    <td>{item.createdAt?.slice(0, 10)}</td>
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
