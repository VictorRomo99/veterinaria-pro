// src/pages/admin/AdminAtenciones.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminAtenciones.css"; // opcional si usas un CSS común para admin

const API = "http://localhost:4000";

export default function AdminAtenciones() {
  const token = localStorage.getItem("token");

  const [data, setData] = useState({
    totalAtenciones: 0,
    ultimasAtenciones: [],
  });

  const [loading, setLoading] = useState(true);

  const cargarAtenciones = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/atenciones/resumen`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setData(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error cargando atenciones:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAtenciones();
  }, []);

  return (
    <div className="admin-page">
      <h2 className="admin-title">📋 Atenciones</h2>

      {loading ? (
        <p className="admin-loading">Cargando información...</p>
      ) : (
        <>
          {/* Resumen */}
          <div className="admin-box">
            <h3>Total de Atenciones</h3>
            <p className="admin-number">{data.totalAtenciones}</p>
          </div>

          {/* Últimas atenciones */}
          <div className="admin-box">
            <h3>Últimas Atenciones Registradas</h3>

            {data.ultimasAtenciones.length === 0 ? (
              <p>No hay atenciones registradas.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Mascota</th>
                    <th>Médico</th>
                    <th>Fecha</th>
                    <th>Diagnóstico</th>
                  </tr>
                </thead>

                <tbody>
                  {data.ultimasAtenciones.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.mascotaNombre || "—"}</td>
                      <td>{item.medicoNombre || "—"}</td>
                      <td>{item.fecha || "—"}</td>
                      <td>{item.diagnostico || "—"}</td>
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
