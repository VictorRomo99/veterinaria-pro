// src/pages/admin/AdminConfig.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminConfig.css";

const API = "http://localhost:4000";

export default function AdminConfig() {
  const token = localStorage.getItem("token");

  const [config, setConfig] = useState({
    nombre: "",
    direccion: "",
    telefono: "",
    igv: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const cargarConfig = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/config`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConfig(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar configuración:", error);
      setLoading(false);
    }
  };

  const guardarConfig = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axios.put(`${API}/api/admin/config`, config, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Configuración guardada correctamente.");
      setSaving(false);
    } catch (error) {
      console.error("Error al guardar configuración:", error);
      alert("No se pudo guardar.");
      setSaving(false);
    }
  };

  useEffect(() => {
    cargarConfig();
  }, []);

  return (
    <div className="config-admin-container">
      <h2 className="config-title">⚙️ Configuración de la Clínica</h2>

      {loading ? (
        <p className="config-loading">Cargando configuración...</p>
      ) : (
        <form className="config-form" onSubmit={guardarConfig}>
          <div className="config-group">
            <label>Nombre de la Clínica</label>
            <input
              type="text"
              value={config.nombre}
              onChange={(e) => setConfig({ ...config, nombre: e.target.value })}
              required
            />
          </div>

          <div className="config-group">
            <label>Dirección</label>
            <input
              type="text"
              value={config.direccion}
              onChange={(e) =>
                setConfig({ ...config, direccion: e.target.value })
              }
              required
            />
          </div>

          <div className="config-group">
            <label>Teléfono</label>
            <input
              type="text"
              value={config.telefono}
              onChange={(e) =>
                setConfig({ ...config, telefono: e.target.value })
              }
              required
            />
          </div>

          <div className="config-group">
            <label>IGV (%)</label>
            <input
              type="number"
              value={config.igv}
              onChange={(e) =>
                setConfig({ ...config, igv: Number(e.target.value) })
              }
              min="0"
              max="100"
              required
            />
          </div>

          <button type="submit" className="config-btn" disabled={saving}>
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </form>
      )}
    </div>
  );
}
