// src/pages/veterinario/DashboardVet.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "./DashboardVet.css";

import NavbarVet from "./NavbarVet";
import RegistrarMascota from "./RegistrarMascota";
import HistoriaClinicaForm from "./HistoriaClinicaForm";
import HistoriaClinicaList from "./HistoriaClinicaList";

export default function DashboardVet() {
  const [usuario, setUsuario] = useState(null);
  const [mascotas, setMascotas] = useState([]);
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState(null);
  const [historias, setHistorias] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarRegistrar, setMostrarRegistrar] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const u = localStorage.getItem("usuario");
    if (u) setUsuario(JSON.parse(u));
    cargarMascotas();
  }, []);

  const cargarMascotas = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/mascotas", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMascotas(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudieron cargar las mascotas.", "error");
    }
  };

  const seleccionarMascota = async (m) => {
    setMascotaSeleccionada(m);
    try {
      const res = await axios.get(
        `http://localhost:4000/api/historias/mascota/${m.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHistorias(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo cargar la historia clínica.", "error");
    }
  };

  const mascotasFiltradas = mascotas.filter((m) =>
    m.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="dashboard-vet">

      {/* NAVBAR FIJO */}
      <NavbarVet onRegistrar={() => setMostrarRegistrar(true)} />

      <div className="vet-content">
        {/* Buscador */}
        <input
          className="buscador-principal"
          placeholder="Buscar mascota..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <div className="panel-flex">

          {/* LISTA DE MASCOTAS */}
          <div className="mascotas-panel">
  <h3>Mascotas</h3>

  {mascotasFiltradas.map((m) => {
    // Normalizar especie (a minúsculas)
    const especie = m.especie?.toLowerCase();

    // Icono según especie
    const icono =
      especie === "perro"
        ? "🐶"
        : especie === "gato"
        ? "🐱"
        : "🐾";

    return (
      <div
        key={m.id}
        className={
          mascotaSeleccionada?.id === m.id
            ? "mascota-card seleccionada"
            : "mascota-card"
        }
        onClick={() => seleccionarMascota(m)}
      >
        <div className="mascota-header-row">
          <span className="icono">{icono}</span>

          <span className="mascota-nombre2">{m.nombre}</span>
          <span className="mascota-especie2">
            — {m.especie?.toUpperCase()}
          </span>
        </div>

        <div className="mascota-dueno2">
          Dueño: {m.dueno?.nombre} {m.dueno?.apellido}
        </div>
      </div>
    );
  })}

  {mascotasFiltradas.length === 0 && (
    <p>No hay coincidencias...</p>
  )}
</div>


          {/* PANEL DERECHA */}
          <main className="panel-derecha">
            {!mascotaSeleccionada ? (
              <p className="placeholder">Selecciona una mascota para ver su historia clínica.</p>
            ) : (
              <>
                <HistoriaClinicaForm mascota={mascotaSeleccionada} />
                <HistoriaClinicaList mascota={mascotaSeleccionada} />
              </>
            )}
          </main>

        </div>
      </div>

      {/* MODAL REGISTRO */}
      {mostrarRegistrar && (
  <div className="modal-overlay">
    <div className="modal-content">
      <RegistrarMascota
        onMascotaRegistrada={() => {
          cargarMascotas();
          setMostrarRegistrar(false);
        }}
        onClose={() => setMostrarRegistrar(false)}
      />
    </div>
  </div>
)}

    </div>
  );
}




