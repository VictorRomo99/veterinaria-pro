// src/api/notificaciones.js
import axios from "axios";

const API = "/api/notificaciones";

// 🔔 Obtener notificaciones
export async function obtenerNotificaciones(token) {
  return axios.get(API, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ☑️ Marcar UNA notificación como leída
export async function marcarNotificacionLeida(id, token) {
  return axios.put(
    `${API}/${id}/leida`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

// 🧹 Marcar TODAS como leídas
export async function marcarTodasNotificaciones(token) {
  return axios.put(
    `${API}/leertodas`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}
