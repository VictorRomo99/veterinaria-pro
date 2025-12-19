// src/pages/veterinario/DashboardVet.jsx
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "./DashboardVet.css";

import NavbarVet from "./NavbarVet";
import RegistrarMascota from "./RegistrarMascota";
import HistoriaClinicaForm from "./HistoriaClinicaForm";
import HistoriaClinicaList from "./HistoriaClinicaList";

import { API } from "../../api"; // 🟢 USAMOS LA INSTANCIA GLOBAL

export default function DashboardVet() {
  const [usuario, setUsuario] = useState(null);
  const [mascotas, setMascotas] = useState([]);
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState(null);
  const [historias, setHistorias] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarRegistrar, setMostrarRegistrar] = useState(false);

  // ✅ NUEVO: filtro por especie con botones
  const [filtroEspecie, setFiltroEspecie] = useState("TODOS"); // TODOS | PERRO | GATO | OTROS

  const token = localStorage.getItem("token");

  useEffect(() => {
    const u = localStorage.getItem("usuario");
    if (u) setUsuario(JSON.parse(u));
    cargarMascotas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarMascotas = async () => {
    try {
      const res = await API.get("/mascotas", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("🐾 Mascotas recibidas:", res.data);
      setMascotas(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ Error cargando mascotas:", err);
      Swal.fire("Error", "No se pudieron cargar las mascotas.", "error");
      setMascotas([]);
    }
  };

  const seleccionarMascota = async (m) => {
    setMascotaSeleccionada(m);

    try {
      const res = await API.get(`/historias/mascota/${m.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("📘 Historias recibidas:", res.data);
      setHistorias(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ Error cargando historias:", err);
      Swal.fire("Error", "No se pudo cargar la historia clínica.", "error");
      setHistorias([]);
    }
  };

  // ✅ FILTRO: buscador + especie (TODOS / PERRO / GATO / OTROS)
  const mascotasFiltradas = Array.isArray(mascotas)
    ? mascotas.filter((m) => {
        const nombre = (m.nombre || "").toLowerCase();
        const especie = (m.especie || "").toLowerCase();

        const coincideNombre = nombre.includes(busqueda.toLowerCase());
        if (!coincideNombre) return false;

        if (filtroEspecie === "TODOS") return true;
        if (filtroEspecie === "PERRO") return especie === "perro";
        if (filtroEspecie === "GATO") return especie === "gato";
        if (filtroEspecie === "OTROS")
          return !["perro", "gato"].includes(especie);

        return true;
      })
    : [];

  return (
    <div className="dashboard-vet">
      {/* NAVBAR */}
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
            <div className="mascotas-panel-header">
              <h3>Mascotas</h3>

              {/* ✅ NUEVO: Botones de filtro */}
              <div className="filtro-especie-botones">
                <button
                  type="button"
                  className={filtroEspecie === "TODOS" ? "activo" : ""}
                  onClick={() => setFiltroEspecie("TODOS")}
                >
                  🐾 Todos
                </button>

                <button
                  type="button"
                  className={filtroEspecie === "PERRO" ? "activo" : ""}
                  onClick={() => setFiltroEspecie("PERRO")}
                >
                  🐶 Perros
                </button>

                <button
                  type="button"
                  className={filtroEspecie === "GATO" ? "activo" : ""}
                  onClick={() => setFiltroEspecie("GATO")}
                >
                  🐱 Gatos
                </button>

                <button
                  type="button"
                  className={filtroEspecie === "OTROS" ? "activo" : ""}
                  onClick={() => setFiltroEspecie("OTROS")}
                >
                  🐾 Otros
                </button>
              </div>
            </div>

            {mascotasFiltradas.map((m) => {
              const especie = m.especie?.toLowerCase();
              const icono =
                especie === "perro" ? "🐶" : especie === "gato" ? "🐱" : "🐾";

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
              <p className="placeholder">
                Selecciona una mascota para ver su historia clínica.
              </p>
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




