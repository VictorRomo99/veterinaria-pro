// src/components/ModalHistoria.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "./ModalHistoria.css";

const API = import.meta.env.VITE_API_URL;

export default function ModalHistoria({ historia, onClose }) {
  const token = localStorage.getItem("token");
  const [archivos, setArchivos] = useState(null);
  const [error, setError] = useState(null);

  // Cargar archivos
  useEffect(() => {
    if (!historia?.id || !token) return;

    const cargarArchivos = async () => {
      try {
        setError(null);
        setArchivos(null);

        const res = await axios.get(
          `${API_BASE}/api/archivos/historia/${historia.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setArchivos(res.data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los archivos adjuntos.");
        setArchivos([]);
      }
    };

    cargarArchivos();
  }, [historia?.id, token]);

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      onClose();
    }
  };

  const fecha = new Date(historia.createdAt).toLocaleString();

  // 🆕 NUEVO: existen dosis programadas?
  const tieneDosis =
    historia.fechaDosis1 ||
    historia.fechaDosis2 ||
    historia.fechaDosis3 ||
    historia.recordatorioTipo;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-contenido">
        <button className="modal-cerrar" onClick={onClose}>
          ✖
        </button>

        <h3 className="modal-titulo">🔗 Historia del {fecha}</h3>

        <div className="modal-info">
          <p>
            <strong>Tipo de atención:</strong>{" "}
            {historia.tipoAtencion || "Atención clínica"}
          </p>

          {historia.motivoConsulta && (
            <p>
              <strong>Motivo:</strong> {historia.motivoConsulta}
            </p>
          )}

          {historia.diagnosticoPresuntivo && (
            <p>
              <strong>Diagnóstico presuntivo:</strong>{" "}
              {historia.diagnosticoPresuntivo}
            </p>
          )}

          {historia.diagnosticoDefinitivo && (
            <p>
              <strong>Diagnóstico definitivo:</strong>{" "}
              {historia.diagnosticoDefinitivo}
            </p>
          )}

          {historia.planTratamiento && (
            <p>
              <strong>Tratamiento:</strong> {historia.planTratamiento}
            </p>
          )}

          {historia.observaciones && (
            <p>
              <strong>Observaciones:</strong> {historia.observaciones}
            </p>
          )}

          {/* ❤️ Constantes fisiológicas */}
          {(historia.temperatura ||
            historia.mucosas ||
            historia.frecuenciaResp ||
            historia.frecuenciaCard ||
            historia.deshidratacion) && (
            <>
              <h4 className="subtitulo">❤️ Constantes fisiológicas</h4>
              <ul className="constantes-lista">
                {historia.temperatura && (
                  <li>🌡️ Temp: {historia.temperatura}</li>
                )}
                {historia.mucosas && <li>👅 Mucosas: {historia.mucosas}</li>}
                {historia.frecuenciaResp && (
                  <li>💨 Resp: {historia.frecuenciaResp}</li>
                )}
                {historia.frecuenciaCard && (
                  <li>❤️ FC: {historia.frecuenciaCard}</li>
                )}
                {historia.deshidratacion && (
                  <li>💧 Deshidratación: {historia.deshidratacion}</li>
                )}
              </ul>
            </>
          )}

          {/* 🆕 BLOQUE NUEVO – PRÓXIMAS DOSIS */}
          {tieneDosis && (
            <>
              <h4 className="subtitulo dosis-subtitulo">
                🕒 Próximas dosis programadas
              </h4>

              <div className="dosis-box">
                {historia.recordatorioTipo && (
                  <p>
                    <strong>Tipo de recordatorio:</strong>{" "}
                    {historia.recordatorioTipo}
                  </p>
                )}

                {historia.fechaDosis1 && (
                  <p>
                    <strong>Dosis 1:</strong>{" "}
                    {new Date(historia.fechaDosis1).toLocaleDateString()}
                  </p>
                )}

                {historia.fechaDosis2 && (
                  <p>
                    <strong>Dosis 2:</strong>{" "}
                    {new Date(historia.fechaDosis2).toLocaleDateString()}
                  </p>
                )}

                {historia.fechaDosis3 && (
                  <p>
                    <strong>Dosis 3:</strong>{" "}
                    {new Date(historia.fechaDosis3).toLocaleDateString()}
                  </p>
                )}
              </div>
            </>
          )}

          {/* 📎 Archivos adjuntos */}
          <h4 className="subtitulo">📎 Archivos adjuntos</h4>

          {error && <p className="historial-error">{error}</p>}
          {archivos === null && !error && (
            <p className="historial-msg">Cargando archivos...</p>
          )}

          {archivos && archivos.length === 0 && !error && (
            <p>No hay archivos adjuntos.</p>
          )}

          {archivos && archivos.length > 0 && (
            <div className="archivos-grid">
              {archivos.map((a) => {
                const url = `${API_BASE}${a.urlArchivo}`;
                const esPDF =
                  a.tipo?.includes("pdf") || a.urlArchivo.endsWith(".pdf");

                return (
                  <div key={a.id} className="archivo-card">
                    {esPDF ? (
                      <a href={url} target="_blank" rel="noreferrer">
                        📄 {a.nombreArchivo}
                      </a>
                    ) : (
                      <a href={url} target="_blank" rel="noreferrer">
                        <img
                          src={url}
                          alt={a.nombreArchivo}
                          className="archivo-img"
                        />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-cerrar-modal" onClick={onClose}>
            🚪 Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
