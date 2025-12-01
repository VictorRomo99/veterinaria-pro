// src/pages/mascotas/MisMascotas.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "./MisMascotas.css";

const API = "http://localhost:4000";

export default function MisMascotas() {
  const [mascotas, setMascotas] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [mascotaActiva, setMascotaActiva] = useState(null);
  const [estadoMascota, setEstadoMascota] = useState(null);

  const [loadingMascotas, setLoadingMascotas] = useState(true);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const token = localStorage.getItem("token");

  // 🐾 Obtener mascotas del usuario logueado
  useEffect(() => {
    const cargarMascotas = async () => {
      try {
        setLoadingMascotas(true);
        const res = await axios.get(`${API}/api/mascotas/usuario`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMascotas(res.data || []);
      } catch (err) {
        Swal.fire("Error", "No se pudieron cargar tus mascotas.", "error");
        console.error(err);
      } finally {
        setLoadingMascotas(false);
      }
    };

    cargarMascotas();
  }, [token]);

  // 📌 Selección de mascota → Cargar historial y estado
  const verHistorial = async (mascota) => {
    try {
      setLoadingDetalle(true);
      setMascotaActiva(mascota);

      // HISTORIAL CLÍNICO
      const resHist = await axios.get(
        `${API}/api/historias/mascota/${mascota.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHistorial(resHist.data || []);

      // ESTADO
      const resEstado = await axios.get(
        `${API}/api/mascotas/${mascota.id}/estado`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEstadoMascota(resEstado.data || null);
    } catch (err) {
      Swal.fire(
        "Error",
        "No se pudo obtener la información de la mascota.",
        "error"
      );
      console.error(err);
    } finally {
      setLoadingDetalle(false);
    }
  };

  // 👉 FUNCIÓN PARA MOSTRAR ÍCONO SEGÚN ESPECIE
  const iconoEspecie = (especie) => {
    if (!especie) return "🐾";
    const e = especie.toLowerCase();
    if (e === "perro") return "🐶";
    if (e === "gato") return "🐱";
    return "🐾";
  };

  return (
    <div className="mc-page-wrapper">
      <section className="mm-page">
        <div className="mm-inner">
          <h2 className="mm-title">🐾 Mis Mascotas</h2>

          {/* CARGANDO */}
          {loadingMascotas ? (
            <div className="mm-empty-card">Cargando tus mascotas…</div>
          ) : mascotas.length === 0 ? (
            <div className="mm-empty-card">
              <p>No tienes mascotas registradas.</p>
              <span>
                Cuando registres una mascota, podrás ver aquí su estado y su
                historial clínico.
              </span>
            </div>
          ) : (
            <div className="mm-layout">
              {/* COLUMNA IZQUIERDA */}
              <div className="mm-left">
                <h3 className="mm-subtitle">Tus peluditos</h3>

                <div className="mm-list">
                  {mascotas.map((m) => (
                    <button
                      key={m.id}
                      className={
                        "mm-pet-card " +
                        (mascotaActiva?.id === m.id ? "active" : "")
                      }
                      onClick={() => verHistorial(m)}
                    >
                      <div className="mm-pet-main">
                        <div className="mm-avatar">{iconoEspecie(m.especie)}</div>

                        <div>
                          <div className="mm-pet-name">{m.nombre}</div>
                          <div className="mm-pet-meta">
                            {m.especie} {m.raza ? `· ${m.raza}` : ""}
                          </div>
                        </div>
                      </div>

                      {m.peso && <div className="mm-pill">{m.peso} kg</div>}
                    </button>
                  ))}
                </div>
              </div>

              {/* COLUMNA DERECHA */}
              <div className="mm-right">
                {loadingDetalle ? (
                  <div className="mm-empty-card">Cargando detalle…</div>
                ) : !mascotaActiva ? (
                  <div className="mm-empty-card">
                    Selecciona una mascota de la izquierda para ver su estado.
                  </div>
                ) : (
                  <>
                    {/* ⭐ WIDGETS */}
                    <div className="mm-stats-grid">
                      <div className="mm-stat-card">
                        <span className="mm-stat-icon">📅</span>
                        <p className="mm-stat-label">Última atención</p>
                        <p className="mm-stat-value">
                          {historial.length
                            ? new Date(historial[0].fecha).toLocaleDateString()
                            : "Sin registros"}
                        </p>
                      </div>

                      <div className="mm-stat-card">
                        <span className="mm-stat-icon">💉</span>
                        <p className="mm-stat-label">Próxima dosis</p>
                        <p className="mm-stat-value">
                          {historial[0]?.proximaDosis
                            ? new Date(
                                historial[0].proximaDosis
                              ).toLocaleDateString()
                            : "No programada"}
                        </p>
                      </div>

                      <div className="mm-stat-card">
                        <span className="mm-stat-icon">🧪</span>
                        <p className="mm-stat-label">Atenciones totales</p>
                        <p className="mm-stat-value">{historial.length}</p>
                      </div>

                      <div className="mm-stat-card">
                        <span className="mm-stat-icon">👨‍⚕️</span>
                        <p className="mm-stat-label">Veterinario</p>
                        <p className="mm-stat-value">
                          {historial[0]?.veterinario?.nombre || "—"}
                        </p>
                      </div>
                    </div>

                    {/* 🎯 TARJETA DE ESTADO */}
                    <div className="mm-summary-card">
                      <div className="mm-summary-header">
                        <div>
                          <h3>{mascotaActiva.nombre}</h3>
                          <p>
                            {mascotaActiva.especie}{" "}
                            {mascotaActiva.raza ? `· ${mascotaActiva.raza}` : ""}
                          </p>
                        </div>

                        {estadoMascota && (
                          <span
                            className={
                              "mm-status-badge " +
                              (estadoMascota.estado === "Crítico"
                                ? "alerta"
                                : estadoMascota.estado === "En observación"
                                ? "control"
                                : "ok")
                            }
                          >
                            {estadoMascota.estado?.toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="mm-summary-grid">
                        <div className="mm-summary-item">
                          <span className="label">Peso actual</span>
                          <span className="value">
                            {mascotaActiva.peso || "Sin registrar"}{" "}
                            {mascotaActiva.peso ? "kg" : ""}
                          </span>
                        </div>

                        <div className="mm-summary-item">
                          <span className="label">Edad</span>
                          <span className="value">
                            {mascotaActiva.edad || "No registrada"}
                          </span>
                        </div>

                        <div className="mm-summary-item">
                          <span className="label">Última atención</span>
                          <span className="value">
                            {historial.length
                              ? new Date(
                                  historial[0].fecha
                                ).toLocaleDateString()
                              : "Sin atenciones"}
                          </span>
                        </div>
                      </div>

                      {estadoMascota?.resumen && (
                        <p className="mm-summary-note">
                          {estadoMascota.resumen}
                        </p>
                      )}
                    </div>

                    {/* 📚 HISTORIAL */}
                    <div className="mm-history-card">
                      <div className="mm-history-header">
                        <h4>Historial clínico</h4>
                        <span className="mm-history-count">
                          {historial.length} atención
                          {historial.length === 1 ? "" : "es"}
                        </span>
                      </div>

                      {historial.length === 0 ? (
                        <p className="mm-history-empty">
                          Esta mascota aún no tiene atenciones registradas.
                        </p>
                      ) : (
                        <div className="mm-history-table-wrap">
                          <table className="mm-history-table">
                            <thead>
                              <tr>
                                <th>Fecha</th>
                                <th>Motivo</th>
                                <th>Diagnóstico</th>
                                <th>Tratamiento</th>
                                <th>Veterinario</th>
                              </tr>
                            </thead>
                            <tbody>
                              {historial.map((a) => (
                                <tr key={a.id}>
                                  <td>
                                    {new Date(a.fecha).toLocaleDateString()}
                                  </td>
                                  <td>{a.motivoConsulta || a.motivo || "—"}</td>
                                  <td>
                                    {a.diagnosticoDefinitivo ||
                                      a.diagnosticoPresuntivo ||
                                      "—"}
                                  </td>
                                  <td>{a.planTratamiento || a.tratamiento || "—"}</td>
                                  <td>{a.veterinario?.nombre || "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

