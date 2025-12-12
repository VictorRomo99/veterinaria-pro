import { API } from "./index";

// 🔔 Obtener notificaciones
export async function obtenerNotificaciones(token) {
  return API.get("/notificaciones", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ☑️ Marcar UNA notificación como leída
export async function marcarNotificacionLeida(id, token) {
  return API.put(`/notificaciones/${id}/leida`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// 🧹 Marcar TODAS como leídas
export async function marcarTodasNotificaciones(token) {
  return API.put(`/notificaciones/leertodas`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
