// src/pages/admin/AdminCitas.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminCitas.css";

const API = "http://localhost:4000";

export default function AdminCitas() {
  const token = localStorage.getItem("token");

  const [resumen, setResumen] = useState({
    pendientes: 0,
    atendidas: 0,
    canceladas: 0,
  });

  const [loading, setLoading] = useState(true);

  const cargarResumen = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/citas/resumen`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setResumen(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error cargando citas:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarResumen();
  }, []);

  return (
    <div className="citas-admin-container">
      <h2 className="citas-title">📅 Resumen de Citas</h2>

      {loading ? (
        <p className="citas-loading">Cargando información...</p>
      ) : (
        <div className="citas-grid">
          <div className="cita-card pendiente">
            <h3>Pendientes</h3>
            <p className="cita-num">{resumen.pendientes}</p>
          </div>

          <div className="cita-card atendida">
            <h3>Atendidas</h3>
            <p className="cita-num">{resumen.atendidas}</p>
          </div>

          <div className="cita-card cancelada">
            <h3>Canceladas</h3>
            <p className="cita-num">{resumen.canceladas}</p>
          </div>
        </div>
      )}
    </div>
  );
}
