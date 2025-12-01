import { useState, useEffect } from "react";
import axios from "axios";
import ModalHistoria from "./ModalHistoria";
import "./HistoriaClinicaList.css";

export default function HistoriaClinicaList({ mascota }) {
  const token = localStorage.getItem("token");
  const [historias, setHistorias] = useState([]);
  const [historiaSeleccionada, setHistoriaSeleccionada] = useState(null);

  // filtros
  const [filtroTipo, setFiltroTipo] = useState("Todas");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    if (mascota?.id) {
      axios
        .get(`http://localhost:4000/api/historias/mascota/${mascota.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setHistorias(res.data))
        .catch((err) => console.error(err));
    } else {
      setHistorias([]);
    }
  }, [mascota, token]);

  // filtrar
  const historiasFiltradas = historias.filter((h) => {
    const coincideTipo =
      filtroTipo === "Todas" ||
      (h.tipoAtencion &&
        h.tipoAtencion.toLowerCase() === filtroTipo.toLowerCase());

    const texto = (
      (h.motivoConsulta || "") +
      " " +
      (h.diagnosticoPresuntivo || "") +
      " " +
      (h.planTratamiento || "") +
      " " +
      (h.observaciones || "")
    ).toLowerCase();

    const coincideBusqueda = texto.includes(busqueda.toLowerCase());

    return coincideTipo && coincideBusqueda;
  });

  return (
    <div className="historial-container">
      <div className="historial-header">
        <h4>📜 Historial Clínico</h4>

        <div className="filtros-historial">
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
          >
            <option value="Todas">Todas las atenciones</option>
            <option value="Consulta">Consultas</option>
            <option value="Vacunación">Vacunaciones</option>
            <option value="Desparasitación">Desparasitaciones</option>
            <option value="Control">Controles</option>
            <option value="Cirugía">Cirugías</option>
            <option value="Emergencia">Emergencias</option>
          </select>

          <input
            type="text"
            placeholder="Buscar por motivo, diagnóstico o tratamiento..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {historiasFiltradas.length === 0 ? (
        <p className="historial-empty">
          No hay registros que coincidan con los filtros aplicados.
        </p>
      ) : (
        <ul className="timeline">
          {historiasFiltradas.map((h) => (
            <li
              key={h.id}
              className="timeline-item"
              onClick={() => setHistoriaSeleccionada(h)}
            >
              <div className="timeline-badge">
                {h.tipoAtencion?.[0] || "H"}
              </div>

              <div className="timeline-content">
                <div className="timeline-header">
                  <span
                    className={`tipo-badge tipo-${(
                      h.tipoAtencion || "otro"
                    ).toLowerCase()}`}
                  >
                    {h.tipoAtencion || "Atención"}
                  </span>

                  <span className="fecha">
                    {new Date(h.createdAt).toLocaleString()}
                  </span>
                </div>

                <p className="motivo">
                  {h.motivoConsulta || "Sin motivo registrado"}
                </p>

                {h.planTratamiento && (
                  <p className="resumen">
                    <strong>Tx:</strong> {h.planTratamiento.slice(0, 80)}
                    {h.planTratamiento.length > 80 ? "..." : ""}
                  </p>
                )}

                {/* NUEVO: BADGE DE DOSIS PROGRAMADA */}
                {h.tieneDosisProgramada ? (
                  <span className="badge-dosis">
                    🕒 Próxima dosis:{" "}
                    {new Date(h.fechaDosis1).toLocaleDateString()}
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {historiaSeleccionada && (
        <ModalHistoria
          historia={historiaSeleccionada}
          onClose={() => setHistoriaSeleccionada(null)}
        />
      )}
    </div>
  );
}
