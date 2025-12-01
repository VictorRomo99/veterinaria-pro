import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "./MisCitas.css";

export default function MisCitas() {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarCitas = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await axios.get("/api/citas", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCitas(data || []);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "No se pudieron cargar tus citas",
        text: err.response?.data?.message || "Inténtalo nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarCitas();
  }, [cargarCitas]);

  const cancelarCita = async (id) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "¿Cancelar cita?",
      text: "Esta acción no se puede deshacer.",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No",
      confirmButtonColor: "#e74c3c",
      cancelButtonColor: "#95a5a6",
    });
    if (!confirm.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/citas/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire({
        icon: "success",
        title: "Cita cancelada",
        timer: 1400,
        showConfirmButton: false,
      });
      setCitas((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "No se pudo cancelar",
        text: err.response?.data?.message || "Inténtalo nuevamente.",
      });
    }
  };

  // 🔵 NUEVO: reprogramar cita solo 1 vez
  const reprogramarCita = async (cita) => {
    if (cita.reprogramadaPorCliente) {
      return Swal.fire({
        icon: "info",
        title: "Reprogramación usada",
        text: "Solo puedes reprogramar una vez esta cita.",
      });
    }

    const { value: formValues } = await Swal.fire({
      title: "Reprogramar cita",
      html: `
        <label style="display:block; text-align:left; margin-bottom:4px;">Nueva fecha:</label>
        <input type="date" id="swal-fecha" class="swal2-input" />
        <label style="display:block; text-align:left; margin-top:8px; margin-bottom:4px;">Nueva hora:</label>
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
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/citas/${cita.id}/reprogramar-cliente`,
        {
          nuevaFecha: formValues.fecha,
          nuevaHora: formValues.hora,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Cita reprogramada",
        text: "Recepción ha sido notificada.",
      });
      cargarCitas();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "No se pudo reprogramar",
        text: err.response?.data?.message || "Inténtalo nuevamente.",
      });
    }
  };

 return (
  <div className="mc-page-wrapper">
    <div className="mc-container">
      <div className="mc-header">
        <h2>🗓️ Mis citas</h2>
        <button className="mc-refresh" onClick={cargarCitas} disabled={loading}>
          {loading ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      {loading ? (
        <div className="mc-skel">Cargando tus citas…</div>
      ) : citas.length === 0 ? (
        <div className="mc-empty">
          <p>No tienes citas registradas.</p>
          <a className="mc-link" href="/servicios">
            Agendar una cita
          </a>
        </div>
      ) : (
        <div className="mc-table-wrap">
          <table className="mc-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Servicio</th>
                <th>Tipo</th>
                <th>Comentario</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {citas.map((c) => (
                <tr key={c.id}>
                  <td>{c.fecha}</td>
                  <td>{c.hora}</td>
                  <td>{c.servicio}</td>
                  <td
                    className={`mc-badge ${
                      c.tipoAtencion === "domicilio" ? "dom" : "pres"
                    }`}
                  >
                    {c.tipoAtencion === "domicilio" ? "Domicilio" : "Presencial"}
                  </td>
                  <td className="mc-comment">{c.comentario || "—"}</td>
                  <td className="mc-actions">
                    <button
                      className="mc-edit"
                      disabled={c.reprogramadaPorCliente}
                      onClick={() => reprogramarCita(c)}
                    >
                      {c.reprogramadaPorCliente ? "Reprogramado" : "Reprogramar"}
                    </button>
                    <button
                      className="mc-cancel"
                      onClick={() => cancelarCita(c.id)}
                    >
                      Cancelar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
);

}