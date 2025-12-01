// src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";

const API = import.meta.env.VITE_API_URL;

export default function AdminDashboard() {
  const token = localStorage.getItem("token");

  const [data, setData] = useState({
    totalUsuarios: 0,
    totalMascotas: 0,
    totalBoletas: 0,
    ventasHoy: 0,
    citasPendientes: 0,
  });

  const [loading, setLoading] = useState(true);

  const cargarDashboard = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setData(res.data);
      setLoading(false);
    } catch (error) {
      console.error("ERROR DASHBOARD:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDashboard();
  }, []);

  return (
    <div className="dashboard-admin-container">
      <h2 className="dashboard-title">📊 Panel Administrativo</h2>

      {loading ? (
        <p className="dashboard-loading">Cargando estadísticas...</p>
      ) : (
        <div className="dashboard-grid">
          
          <div className="dash-card">
            <h3>Usuarios Registrados</h3>
            <p className="dash-number">{data.totalUsuarios}</p>
          </div>

          <div className="dash-card">
            <h3>Mascotas Registradas</h3>
            <p className="dash-number">{data.totalMascotas}</p>
          </div>

          <div className="dash-card">
            <h3>Boletas Emitidas</h3>
            <p className="dash-number">{data.totalBoletas}</p>
          </div>

          <div className="dash-card">
            <h3>Ventas de Hoy</h3>
            <p className="dash-number">S/ {data.ventasHoy.toFixed(2)}</p>
          </div>

          <div className="dash-card">
            <h3>Citas Pendientes</h3>
            <p className="dash-number">{data.citasPendientes}</p>
          </div>

        </div>
      )}
    </div>
  );
}
