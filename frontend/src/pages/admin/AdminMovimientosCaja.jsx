// src/pages/admin/AdminMovimientosCaja.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminMovimientosCaja.css";

const API = "http://localhost:4000";

export default function AdminMovimientosCaja() {
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
    <div className="movcaja-container">
      <h2 className="movcaja-title">📘 Movimientos de Caja (Detalle Completo)</h2>

      {loading ? (
        <p className="movcaja-loading">Cargando movimientos...</p>
      ) : (
        <div className="movcaja-card">
          {movimientos.length === 0 ? (
            <p className="movcaja-empty">No se encontraron movimientos.</p>
          ) : (
            <table className="movcaja-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Descripción</th>
                  <th>Monto</th>
                  <th>Tipo</th>
                  <th>usuarioID</th>
                  <th>Fecha</th>
                </tr>
              </thead>

              <tbody>
                {movimientos.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.descripcion}</td>
                    <td>S/ {Number(item.monto).toFixed(2)}</td>

                    <td
                      className={
                        item.tipo === "ingreso" ? "ingreso" : "egreso"
                      }
                    >
                      {item.tipo.toUpperCase()}
                    </td>

                    <td>{item.usuarioId || "—"}</td>

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
