// src/pages/Usuarios.jsx
import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "./Usuarios.css";

const API = import.meta.env.VITE_API_URL;

export default function Usuarios() {
  const token = localStorage.getItem("token") || "";

  // DNI a buscar
  const [dniBuscar, setDniBuscar] = useState("");
  const [loadingBuscar, setLoadingBuscar] = useState(false);
  const [usuarioEncontrado, setUsuarioEncontrado] = useState(null);

  // Formulario del cliente nuevo
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    celular: "",
    email: "",
    fechaNacimiento: "",
    direccion: "",
  });

  const [guardando, setGuardando] = useState(false);

  // ==========================
  // API RENIEC
  // ==========================
  const buscarRENIEC = async (dni) => {
    try {
      const res = await axios.get(`${API}/api/reniec/${dni}`);
      const { nombres, apellidoPaterno, apellidoMaterno, fechaNacimiento } = res.data;

      if (!nombres) return null;

      let fechaISO = "";
      if (fechaNacimiento) {
        const [d, m, y] = fechaNacimiento.split("/");
        fechaISO = `${y}-${m}-${d}`;
      }

      return {
        nombre: nombres.trim(),
        apellido: `${apellidoPaterno || ""} ${apellidoMaterno || ""}`.trim(),
        fechaNacimiento: fechaISO,
      };
    } catch {
      return null;
    }
  };

  // ==========================
  // BUSCAR DNI
  // ==========================
  const handleBuscar = async () => {
    if (!dniBuscar.trim()) {
      return Swal.fire("DNI requerido", "Ingresa un DNI para buscar.", "info");
    }

    if (dniBuscar.trim().length !== 8) {
      return Swal.fire("DNI inválido", "Debe tener 8 dígitos.", "warning");
    }

    setLoadingBuscar(true);
    setUsuarioEncontrado(null);

    // 1️⃣ Buscar en BD
    try {
      const { data } = await axios.get(
        `${API}/api/auth/buscar?query=${dniBuscar.trim()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const usuario = Array.isArray(data) ? data[0] : null;

      if (usuario) {
        setUsuarioEncontrado(usuario);
        Swal.fire("Cliente encontrado", "Este DNI ya tiene una cuenta.", "info");
        setLoadingBuscar(false);
        return; // no rellenar formulario
      }
    } catch (err) {
      // 404 = No existe en BD → proceder con RENIEC
      if (err.response?.status !== 404) {
        Swal.fire("Error", "No se pudo buscar el DNI.", "error");
        setLoadingBuscar(false);
        return;
      }
    }

    // 2️⃣ Buscar en RENIEC
    const datosReniec = await buscarRENIEC(dniBuscar.trim());

    if (!datosReniec) {
      // Rellenar solo el DNI, los demás vacíos
      setForm({
        nombre: "",
        apellido: "",
        dni: dniBuscar.trim(),
        celular: "",
        email: "",
        fechaNacimiento: "",
        direccion: "",
      });

      Swal.fire(
        "Nuevo cliente",
        "No existe en BD ni en RENIEC. Registrar manualmente.",
        "info"
      );
    } else {
      // Autocompletar
      setForm({
        nombre: datosReniec.nombre,
        apellido: datosReniec.apellido,
        dni: dniBuscar.trim(),
        celular: "",
        email: "",
        fechaNacimiento: datosReniec.fechaNacimiento,
        direccion: "",
      });

      Swal.fire("Datos obtenidos", "Información completada desde RENIEC.", "success");
    }

    setLoadingBuscar(false);
  };

  // ==========================
  // Manejar cambios de inputs
  // ==========================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ==========================
  // Guardar cliente nuevo
  // ==========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (usuarioEncontrado) {
      return Swal.fire(
        "Cliente ya registrado",
        "Este DNI ya tiene una cuenta.",
        "info"
      );
    }

    const { nombre, apellido, dni, email, fechaNacimiento } = form;

    if (!nombre || !apellido || !dni || !email || !fechaNacimiento) {
      return Swal.fire(
        "Campos incompletos",
        "Completa todos los datos requeridos.",
        "warning"
      );
    }

    try {
      setGuardando(true);

      const { data } = await axios.post(
        `${API}/api/auth/crear-cliente`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("Cliente registrado", data.message, "success");

      // Reset
      setDniBuscar("");
      setUsuarioEncontrado(null);
      setForm({
        nombre: "",
        apellido: "",
        dni: "",
        celular: "",
        email: "",
        fechaNacimiento: "",
        direccion: "",
      });
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "No se pudo registrar el cliente.",
        "error"
      );
    } finally {
      setGuardando(false);
    }
  };

  // ==========================
  // INTERFAZ
  // ==========================
  return (
    <div className="usuarios-container">
      <div className="usuarios-header">
        <h3>👥 Gestión de Usuarios</h3>
        <p>Registrar clientes rápidamente desde recepción.</p>
      </div>

      {/* Buscar DNI */}
    {/* Buscar DNI */}
<div className="usuarios-buscar">
  <label>DNI del cliente</label>

  <div className="usuarios-buscar-row">

    {/* ICONO */}
    <div className="dni-icon">
      <i className="fa-solid fa-id-card"></i>
    </div>

    {/* INPUT */}
    <input
      type="text"
      placeholder="Ingrese DNI para buscar..."
      value={dniBuscar}
      maxLength={8}
      onChange={(e) => setDniBuscar(e.target.value)}
      className="dni-input"
    />

    {/* BOTÓN */}
    <button
      type="button"
      className="btn-buscar-dni"
      onClick={handleBuscar}
      disabled={loadingBuscar}
    >
      {loadingBuscar ? "Buscando..." : "Buscar"}
    </button>

  </div>
</div>


      {/* Formulario */}
      <form className="usuarios-form" onSubmit={handleSubmit}>
        <div className="usuarios-form-header">
          <h4>
            <i className="fa-solid fa-user-plus" /> Registrar nuevo cliente
          </h4>
          <span className="usuarios-form-subtitle">
            Se generará una contraseña temporal automática.
          </span>
        </div>

        <div className="usuarios-grid">
          <div className="field">
            <label>Nombre</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} />
          </div>

          <div className="field">
            <label>Apellido</label>
            <input name="apellido" value={form.apellido} onChange={handleChange} />
          </div>

          <div className="field">
            <label>DNI</label>
            <input name="dni" value={form.dni} onChange={handleChange} />
          </div>

          <div className="field">
            <label>Celular</label>
            <input name="celular" value={form.celular} onChange={handleChange} />
          </div>

          <div className="field">
            <label>Correo electrónico</label>
            <input name="email" value={form.email} onChange={handleChange} />
          </div>

          <div className="field">
            <label>Fecha de nacimiento</label>
            <input
              type="date"
              name="fechaNacimiento"
              value={form.fechaNacimiento}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="field field-full">
          <label>Dirección</label>
          <input name="direccion" value={form.direccion} onChange={handleChange} />
        </div>

        <button type="submit" className="btn-guardar-cliente" disabled={guardando}>
          {guardando ? "Guardando..." : "Guardar cliente"}
        </button>
      </form>
    </div>
  );
}