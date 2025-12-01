// src/pages/CitasRecepcion.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "./CitasRecepcion.css";

const API = "http://localhost:4000";

export default function CitasRecepcion() {
  const token = localStorage.getItem("token") || "";

  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [busqueda, setBusqueda] = useState("");
  const [fechaFiltro, setFechaFiltro] = useState("");

  // ============================
  // CARGAR CITAS (RECEPCIÓN)
  // ============================
  const cargarCitas = async () => {
    try {
      setLoading(true);

      let url = `${API}/api/citas/recepcion`;
      if (fechaFiltro) {
        url += `?fecha=${fechaFiltro}`;
      }

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCitas(res.data || []);
    } catch (err) {
      console.error("❌ Error cargando citas:", err);
      Swal.fire("Error", "No se pudieron cargar las citas", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCitas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechaFiltro]);

  // ============================
  // ACCIONES
  // ============================
  const confirmarCita = async (cita) => {
    const ok = await Swal.fire({
      title: "Confirmar cita",
      text: `¿Confirmar la cita de ${cita.duenoNombre}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, confirmar",
      cancelButtonText: "Cancelar",
    });

    if (!ok.isConfirmed) return;

    try {
      await axios.put(
        `${API}/api/citas/${cita.id}/confirmar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("Confirmada", "La cita fue confirmada", "success");
      cargarCitas();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo confirmar la cita", "error");
    }
  };

  const cancelarCitaRecepcion = async (cita) => {
    const ok = await Swal.fire({
      title: "Cancelar cita",
      text: `¿Cancelar la cita de ${cita.duenoNombre}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "Volver",
    });

    if (!ok.isConfirmed) return;

    try {
      await axios.put(
        `${API}/api/citas/${cita.id}/cancelar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("Cancelada", "La cita fue cancelada", "success");
      cargarCitas();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo cancelar la cita", "error");
    }
  };

  const postergarCita = async (cita) => {
    if ((cita.postergaciones || 0) >= 2) {
      return Swal.fire(
        "Límite alcanzado",
        "Esta cita ya fue postergada 2 veces. No se puede volver a postergar.",
        "info"
      );
    }

    const { value: formValues } = await Swal.fire({
      title: "Postergar cita",
      html: `
        <label style="display:block; text-align:left; margin-bottom:6px;">Nueva fecha:</label>
        <input type="date" id="swal-fecha" class="swal2-input" />
        <label style="display:block; text-align:left; margin-top:10px; margin-bottom:6px;">Nueva hora:</label>
        <input type="time" id="swal-hora" class="swal2-input" />
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Guardar cambios",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        const fecha = document.getElementById("swal-fecha").value;
        const hora = document.getElementById("swal-hora").value;
        if (!fecha || !hora) {
          Swal.showValidationMessage("Debes completar fecha y hora");
        }
        return { fecha, hora };
      },
    });

    if (!formValues) return;

    try {
      await axios.put(
        `${API}/api/citas/${cita.id}/postergar`,
        {
          nuevaFecha: formValues.fecha,
          nuevaHora: formValues.hora,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire(
        "Postergada",
        "La cita fue reprogramada y se notificará al usuario",
        "success"
      );
      cargarCitas();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo postergar la cita", "error");
    }
  };

  const enviarRecordatorio = async (cita) => {
    const ok = await Swal.fire({
      title: "Recordatorio",
      text: `¿Enviar recordatorio de cita a ${cita.duenoNombre}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, enviar",
      cancelButtonText: "Cancelar",
    });

    if (!ok.isConfirmed) return;

    try {
      await axios.post(
        `${API}/api/citas/${cita.id}/recordatorio`,
        { tipo: "30min" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("Enviado", "Se envió el recordatorio al usuario", "success");
      cargarCitas();
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Error",
        "No se pudo enviar el recordatorio de cita",
        "error"
      );
    }
  };

  // ============================
  // FILTROS FRONT (BUSCADOR)
  // ============================
  const citasFiltradas = citas.filter((c) => {
    const texto = `${c.mascotaNombre} ${c.duenoNombre} ${c.tipoAtencion} ${c.servicio}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  // ============================
  // AGRUPAR EN SECCIONES
  // ============================
  const hoyStr = new Date().toISOString().split("T")[0];

  // ✅ Solo tomamos citas desde hoy en adelante (ninguna pasada)
  const citasDesdeHoy = citasFiltradas.filter((c) => c.fecha >= hoyStr);

  // Reprogramadas y canceladas (para que no se mezclen)
  const citasReprogramadas = citasDesdeHoy.filter(
    (c) => c.estado === "reprogramada_cliente" || c.estado === "postergada"
  );
  const citasCanceladas = citasDesdeHoy.filter((c) => c.estado === "cancelada");

  const idsRepro = new Set(citasReprogramadas.map((c) => c.id));
  const idsCancel = new Set(citasCanceladas.map((c) => c.id));

  const restantes = citasDesdeHoy.filter(
    (c) => !idsRepro.has(c.id) && !idsCancel.has(c.id)
  );

  // 🟢 HOY: solo la fecha de hoy
  const citasHoy = restantes.filter((c) => c.fecha === hoyStr);

  // 🟦 PRÓXIMAS: después de hoy y sin atender
  const citasProximas = restantes.filter(
    (c) => c.fecha > hoyStr && c.estado !== "atendida"
  );

  // ============================
  // RENDER CARD
  // ============================
  const renderCitaCard = (cita) => (
    <div key={cita.id} className="cita-card">
      <div className="cita-top">
        <div className="cita-mascota">
          <span className="cita-icon">
            <i className="fa-solid fa-dog" />
          </span>
          <div>
            <p className="cita-mascota-nombre">
              {cita.mascotaNombre || "Mascota sin nombre"}
            </p>
            <p className="cita-dueno">
              <i className="fa-solid fa-user" />{" "}
              {cita.duenoNombre || "Dueño no registrado"}
            </p>
          </div>
        </div>

        <div className="cita-horario">
          <p>
            <i className="fa-solid fa-calendar-day" /> {cita.fecha}
          </p>
          <p>
            <i className="fa-solid fa-clock" /> {cita.hora}
          </p>
        </div>

        <div className="cita-estado">
          <span className={`badge-estado ${cita.estado || "pendiente"}`}>
            {cita.estado || "pendiente"}
          </span>
          <p className="cita-tipo">
            <i className="fa-solid fa-stethoscope" />{" "}
            {cita.tipoAtencion || "Consulta"}
          </p>
        </div>
      </div>

      {cita.motivo && (
        <p className="cita-motivo">
          <strong>Motivo:</strong> {cita.motivo}
        </p>
      )}

      <div className="cita-info-extra">
        <p>
          <i className="fa-solid fa-repeat" /> Postergaciones:{" "}
          <strong>{cita.postergaciones || 0}</strong> / 2
        </p>
        <p>
          <i className="fa-solid fa-bell" /> Notificaciones enviadas:{" "}
          <strong>{cita.notificacionesEnviadas || 0}</strong>
        </p>
      </div>

      <div className="cita-actions">
        <button
          className="btn-accion btn-confirmar"
          onClick={() => confirmarCita(cita)}
          disabled={cita.estado === "confirmada" || cita.estado === "cancelada"}
        >
          <i className="fa-solid fa-check" /> Confirmar
        </button>

        <button
          className="btn-accion btn-postergar"
          onClick={() => postergarCita(cita)}
          disabled={
            cita.estado === "cancelada" ||
            cita.estado === "atendida" ||
            (cita.postergaciones || 0) >= 2
          }
        >
          <i className="fa-solid fa-clock-rotate-left" /> Postergar
        </button>

        <button
          className="btn-accion btn-cancelar"
          onClick={() => cancelarCitaRecepcion(cita)}
          disabled={cita.estado === "cancelada"}
        >
          <i className="fa-solid fa-xmark" /> Cancelar
        </button>

        <button
          className="btn-accion btn-recordatorio"
          onClick={() => enviarRecordatorio(cita)}
        >
          <i className="fa-solid fa-bell" /> Recordatorio 30 min
        </button>
      </div>
    </div>
  );

  // ============================
  // RENDER
  // ============================
  return (
    <div className="citas-container">
      <div className="citas-header">
        <h3>📅 Gestión de citas</h3>
        <p>Administra las citas generadas por los usuarios en Colitas Sanas.</p>
      </div>

      {/* FILTROS */}
      <div className="citas-filtros">
        <div className="filtro-item">
          <label>Buscar</label>
          <input
            type="text"
            placeholder="Mascota, dueño, servicio..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="filtro-item">
          <label>Fecha</label>
          <input
            type="date"
            value={fechaFiltro}
            onChange={(e) => setFechaFiltro(e.target.value)}
          />
        </div>

        <button className="btn-refrescar" onClick={cargarCitas}>
          <i className="fa-solid fa-rotate-right" /> Actualizar
        </button>
      </div>

      {/* LISTADO POR SECCIONES */}
      {loading ? (
        <p>Cargando citas...</p>
      ) : citasDesdeHoy.length === 0 ? (
        <p>No hay citas desde hoy en adelante para los filtros seleccionados.</p>
      ) : (
        <div className="citas-secciones">
          {/* HOY */}
          <div className="citas-section">
            <div className="citas-section-header sec-hoy">
              <span>📅 Hoy</span>
              <span className="citas-section-count">{citasHoy.length}</span>
            </div>
            {citasHoy.length === 0 ? (
              <p className="citas-section-empty">No hay citas para hoy.</p>
            ) : (
              <div className="citas-list">{citasHoy.map(renderCitaCard)}</div>
            )}
          </div>

          {/* PRÓXIMAS */}
          <div className="citas-section">
            <div className="citas-section-header sec-proximas">
              <span>⏳ Próximas</span>
              <span className="citas-section-count">{citasProximas.length}</span>
            </div>
            {citasProximas.length === 0 ? (
              <p className="citas-section-empty">
                No hay citas próximas sin atender.
              </p>
            ) : (
              <div className="citas-list">
                {citasProximas.map(renderCitaCard)}
              </div>
            )}
          </div>

          {/* REPROGRAMADAS */}
          <div className="citas-section">
            <div className="citas-section-header sec-reprogramadas">
              <span>🔁 Reprogramadas</span>
              <span className="citas-section-count">
                {citasReprogramadas.length}
              </span>
            </div>
            {citasReprogramadas.length === 0 ? (
              <p className="citas-section-empty">
                No hay citas reprogramadas por ahora.
              </p>
            ) : (
              <div className="citas-list">
                {citasReprogramadas.map(renderCitaCard)}
              </div>
            )}
          </div>

          {/* CANCELADAS */}
          <div className="citas-section">
            <div className="citas-section-header sec-canceladas">
              <span>❌ Canceladas</span>
              <span className="citas-section-count">
                {citasCanceladas.length}
              </span>
            </div>
            {citasCanceladas.length === 0 ? (
              <p className="citas-section-empty">
                No hay citas canceladas registradas.
              </p>
            ) : (
              <div className="citas-list">
                {citasCanceladas.map(renderCitaCard)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}