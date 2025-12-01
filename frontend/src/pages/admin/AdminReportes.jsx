// src/pages/admin/AdminReportes.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminReportes.css";

const API = "http://localhost:4000";

export default function AdminReportes() {
  const token = localStorage.getItem("token");

  const [data, setData] = useState({
    totalVentas: 0,
    boletasRecientes: [],
  });

  const [loading, setLoading] = useState(true);

  const cargarReportes = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/reportes/ventas`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setData(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error cargando reportes:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReportes();
  }, []);

  return (
    <div className="reportes-container">
      <h2 className="reportes-title">📈 Reportes de Ventas</h2>

      {loading ? (
        <p className="reportes-loading">Cargando información...</p>
      ) : (
        <>
          {/* ========= TARJETA TOTAL DE VENTAS ========= */}
          <div className="reportes-total-card">
            <h3>Total Vendido</h3>
            <p className="reportes-total">
              S/ {Number(data.totalVentas).toFixed(2)}
            </p>
          </div>

          {/* ========= TABLA DE BOLETAS ========= */}
          <div className="reportes-card">
            <h3>Últimas Boletas Registradas</h3>

            {data.boletasRecientes.length === 0 ? (
              <p className="reportes-empty">No hay boletas registradas.</p>
            ) : (
              <table className="reportes-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Mascota</th>
                    <th>Fecha</th>
                    <th>Total</th>
                    <th>Detalles</th>
                  </tr>
                </thead>

                <tbody>
                  {data.boletasRecientes.map((b) => (
                    <tr key={b.id}>
                      <td>{b.id}</td>
                      <td>{b.mascota?.nombre || "—"}</td>
                      <td>{b.fecha || "—"}</td>
                      <td>S/ {Number(b.total).toFixed(2)}</td>
                      <td>
                        {b.detalles && b.detalles.length > 0
                          ? b.detalles.map((d) => (
                              <div key={d.id}>
                                - {d.descripcion} (S/{" "}
                                {Number(d.precio).toFixed(2)})
                              </div>
                            ))
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
