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

          {/* NOMBRE */}
<input
  className="input-box"
  placeholder="NOMBRE"
  value={nuevaMascota.nombre}
  onChange={(e) =>
    setNuevaMascota({ ...nuevaMascota, nombre: e.target.value })
  }
  required
/>

{/* ESPECIE */}
<input
  className="input-box"
  placeholder="ESPECIE"
  value={nuevaMascota.especie}
  onChange={(e) =>
    setNuevaMascota({ ...nuevaMascota, especie: e.target.value })
  }
  required
/>

{/* RAZA */}
<input
  className="input-box"
  placeholder="RAZA"
  value={nuevaMascota.raza}
  onChange={(e) =>
    setNuevaMascota({ ...nuevaMascota, raza: e.target.value })
  }
/>

{/* 🔽 SEXO (SELECT CONTROLADO) */}
<select
  className="input-box"
  value={nuevaMascota.sexo}
  onChange={(e) =>
    setNuevaMascota({ ...nuevaMascota, sexo: e.target.value })
  }
  required
>
  <option value="">SELECCIONE SEXO</option>
  <option value="macho">Macho</option>
  <option value="hembra">Hembra</option>
</select>

{/* EDAD */}
<input
  type="number"
  className="input-box"
  placeholder="EDAD"
  value={nuevaMascota.edad}
  onChange={(e) =>
    setNuevaMascota({ ...nuevaMascota, edad: e.target.value })
  }
/>

{/* COLOR */}
<input
  className="input-box"
  placeholder="COLOR"
  value={nuevaMascota.color}
  onChange={(e) =>
    setNuevaMascota({ ...nuevaMascota, color: e.target.value })
  }
/>

{/* PESO */}
<input
  type="number"
  step="0.1"
  className="input-box"
  placeholder="PESO (kg)"
  value={nuevaMascota.peso}
  onChange={(e) =>
    setNuevaMascota({ ...nuevaMascota, peso: e.target.value })
  }
/>


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

