import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import "./Reservar.css";

export default function Reservar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [usuario, setUsuario] = useState(null);
  const [servicio, setServicio] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);

  const [comentario, setComentario] = useState("");
  const [direccion, setDireccion] = useState("");
  const [referencia, setReferencia] = useState("");
  const [loading, setLoading] = useState(false);

  // DURACIÓN POR SERVICIO (minutos)
  const duraciones = {
    "Consulta veterinaria general": 40,
    "Vacunación y control preventivo": 30,
    "Peluquería y cuidado estético": 60,
    "Atención de emergencias": 30,
    "Odontología veterinaria": 50,
    "Visita a domicilio": 60,
  };

  // Detectar si vino desde ?servicio=...
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const srv = params.get("servicio");
    if (srv) setServicio(srv);
  }, [location.search]);

  // Generar horarios válidos según reglas
  const generarHorarios = () => {
    if (!fecha || !servicio) return;

    const fechaSel = new Date(fecha + "T00:00:00");

    // 🛑 Bloquear fechas pasadas
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (fechaSel < hoy) {
      setHorariosDisponibles([]);
      setFecha("");
      return Swal.fire({
        icon: "error",
        title: "Fecha inválida",
        text: "No puedes seleccionar fechas pasadas.",
      });
    }

    // 🛑 Bloquear domingos
    if (fechaSel.getDay() === 0) {
      setHorariosDisponibles([]);
      return Swal.fire({
        icon: "warning",
        title: "Domingo no disponible",
        text: "La clínica no atiende los domingos.",
      });
    }

    const duracion = duraciones[servicio] || 40;

    let horarios = [];
    let inicio = 8 * 60; // 08:00
    const fin = 19 * 60; // 19:00

    while (inicio + duracion <= fin) {
      const h = String(Math.floor(inicio / 60)).padStart(2, "0");
      const m = String(inicio % 60).padStart(2, "0");
      const horaStr = `${h}:${m}`;

      // ❌ Bloquear almuerzo
      if (horaStr >= "13:00" && horaStr < "14:00") {
        inicio += 30;
        continue;
      }

      horarios.push(horaStr);
      inicio += 30;
    }

    // ❌ Si es HOY, bloquear horas ya pasadas
    const hoyFechaStr = new Date().toISOString().split("T")[0];
    if (fecha === hoyFechaStr) {
      const ahora = new Date();
      const minutosActual = ahora.getHours() * 60 + ahora.getMinutes();

      horarios = horarios.filter((h) => {
        const [hr, mn] = h.split(":").map(Number);
        return hr * 60 + mn > minutosActual;
      });
    }

    setHorariosDisponibles(horarios);
  };

  useEffect(() => generarHorarios(), [fecha, servicio]);

  // Validación de sesión
  useEffect(() => {
    const u = localStorage.getItem("usuario");
    if (!u) {
      Swal.fire({
        icon: "warning",
        title: "Inicia sesión",
        text: "Solo los usuarios registrados pueden reservar.",
      }).then(() => navigate("/login"));
    } else {
      setUsuario(JSON.parse(u));
    }
  }, []);

  // Envío de cita
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:4000/api/citas",
        {
          servicio,
          fecha,
          hora,
          comentario,
          direccion,
          referencia,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
        icon: "success",
        title: "Cita registrada",
        text: res.data.message,
      });

      setServicio("");
      setFecha("");
      setHora("");
      setComentario("");
      setDireccion("");
      setReferencia("");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "No se pudo registrar.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reservar-container">
      <div className="reservar-card">

        <h2>📅 Agendar Cita</h2>
        <p className="intro">
          Escoge el servicio, la fecha y un horario disponible.
        </p>

        {usuario && (
          <div className="user-info">
            <p><strong>Nombre:</strong> {usuario.nombre}</p>
            <p><strong>Correo:</strong> {usuario.email}</p>
            <p><strong>Teléfono:</strong> {usuario.celular || "No registrado"}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <label>Servicio</label>
          <select value={servicio} onChange={(e) => setServicio(e.target.value)} required>
            <option value="">Selecciona un servicio</option>
            {Object.keys(duraciones).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <label>Fecha</label>
          <input
            type="date"
            min={new Date().toISOString().split("T")[0]}
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
          />

          <label>Hora</label>
          <select value={hora} onChange={(e) => setHora(e.target.value)} required disabled={!fecha || !servicio}>
            <option value="">Selecciona un horario</option>
            {horariosDisponibles.map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>

          {servicio === "Visita a domicilio" && (
            <>
              <label>Dirección</label>
              <input type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} required />

              <label>Referencia</label>
              <input type="text" value={referencia} onChange={(e) => setReferencia(e.target.value)} />
            </>
          )}

          <label>Comentarios</label>
          <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} />

          <button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Confirmar cita"}
          </button>

        </form>
      </div>
    </div>
  );
}

