import React, { useState } from "react";
import Swal from "sweetalert2";
import { API } from "../../api"; // ✅ USAR INSTANCIA
import "./RegistrarMascota.css";

export default function RegistrarMascota({ onMascotaRegistrada, onClose }) {
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const [duenoSeleccionado, setDuenoSeleccionado] = useState(null);

  const [nuevaMascota, setNuevaMascota] = useState({
    nombre: "",
    especie: "",
    raza: "",
    sexo: "",
    edad: "",
    color: "",
    peso: "",
  });

  const token = localStorage.getItem("token");

  const buscarUsuario = async () => {
    if (!busqueda.trim()) {
      Swal.fire("Atención", "Ingrese un DNI antes de buscar.", "warning");
      return;
    }

    try {
      const res = await API.get(`/auth/buscar?query=${busqueda}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 🛡️ PROTECCIÓN REAL
      const usuarios = Array.isArray(res.data) ? res.data : [];

      if (usuarios.length === 0) {
        setResultados([]);
        Swal.fire(
          "Sin resultados",
          "No se encontró al usuario. Debe registrarse en recepción.",
          "info"
        );
      } else {
        setResultados(usuarios);
      }
    } catch (err) {
      console.error("❌ Error buscar usuario:", err);
      setResultados([]);
      Swal.fire(
        "Error",
        "No se pudo buscar el usuario. Intente nuevamente.",
        "error"
      );
    }
  };

  const registrarMascota = async (e) => {
    e.preventDefault();

    if (!duenoSeleccionado) {
      Swal.fire("Atención", "Selecciona un dueño primero.", "warning");
      return;
    }

    try {
      await API.post(
        "/mascotas",
        { ...nuevaMascota, duenoId: duenoSeleccionado.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("Éxito", "Mascota registrada correctamente.", "success");

      setNuevaMascota({
        nombre: "",
        especie: "",
        raza: "",
        sexo: "",
        edad: "",
        color: "",
        peso: "",
      });

      setBusqueda("");
      setResultados([]);
      setDuenoSeleccionado(null);

      onMascotaRegistrada && onMascotaRegistrada();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "No se pudo registrar la mascota.",
        "error"
      );
    }
  };

  return (
    <div className="registrar-mascota-modal">
      <h2 className="modal-title">Registrar nueva mascota</h2>
      <div className="modal-divider"></div>

      <div className="form-group">
        <label>Buscar dueño por DNI:</label>

        <input
          type="text"
          className="input-box"
          placeholder="Ingrese DNI del cliente"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <button className="btn-buscar" onClick={buscarUsuario}>
          🔍 Buscar
        </button>

        {resultados.length > 0 && (
          <ul className="resultados-lista">
            {resultados.map((u) => (
              <li
                key={u.id}
                className={duenoSeleccionado?.id === u.id ? "seleccionado" : ""}
                onClick={() => setDuenoSeleccionado(u)}
              >
                👤 {u.nombre} {u.apellido} — <span>{u.email}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {duenoSeleccionado && (
        <form className="form-mascota" onSubmit={registrarMascota}>
          <h3 className="form-subtitle">
            Registrar mascota para {duenoSeleccionado.nombre}{" "}
            {duenoSeleccionado.apellido}
          </h3>

          {Object.keys(nuevaMascota).map((campo) => (
            <input
              key={campo}
              type={campo === "edad" || campo === "peso" ? "number" : "text"}
              className="input-box"
              placeholder={campo.toUpperCase()}
              value={nuevaMascota[campo]}
              onChange={(e) =>
                setNuevaMascota({ ...nuevaMascota, [campo]: e.target.value })
              }
              required={campo === "nombre" || campo === "especie"}
            />
          ))}

          <button type="submit" className="btn-guardar">
            Guardar mascota
          </button>
        </form>
      )}

      <button className="btn-cerrar" onClick={onClose}>
        Cerrar
      </button>
    </div>
  );
}

