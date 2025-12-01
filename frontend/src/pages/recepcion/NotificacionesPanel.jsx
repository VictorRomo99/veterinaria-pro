// src/pages/recepcion/NotificacionesPanel.jsx
import { useEffect, useState } from "react";
import {
  obtenerNotificaciones,
  marcarNotificacionLeida,
  marcarTodasNotificaciones,
} from "../../api/notificaciones"; // 🔥 ruta corregida
import "./NotificacionesPanel.css";

export default function NotificacionesPanel() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token") || "";

  const cargarNotificaciones = async () => {
    try {
      const res = await obtenerNotificaciones(token);
      setNotificaciones(res.data);
    } catch (error) {
      console.error("❌ Error cargando notificaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarNotificaciones();
  }, []);

  const marcarLeida = async (id) => {
    await marcarNotificacionLeida(id, token);
    cargarNotificaciones();
  };

  const marcarTodas = async () => {
    await marcarTodasNotificaciones(token);
    cargarNotificaciones();
  };

  return (
    <div className="noti-container">
      <h3>🔔 Notificaciones</h3>

      <button className="noti-btn-all" onClick={marcarTodas}>
        Marcar todas como leídas
      </button>

      {loading ? (
        <p>Cargando...</p>
      ) : notificaciones.length === 0 ? (
        <p className="noti-empty">No hay notificaciones</p>
      ) : (
        <ul className="noti-list">
          {notificaciones.map((n) => (
            <li key={n.id} className={`noti-item ${n.leida ? "leida" : ""}`}>
              <div className="noti-info">
                <strong>{n.titulo}</strong>
                <p>{n.mensaje}</p>
              </div>

              {!n.leida && (
                <button
                  className="noti-btn"
                  onClick={() => marcarLeida(n.id)}
                >
                  Marcar como leída
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
