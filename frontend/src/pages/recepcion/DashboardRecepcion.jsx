// src/pages/recepcion/DashboardRecepcion.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

import ModalAgregarProducto from "./ModalAgregarProducto";
import ModalVerBoleta from "./ModalVerBoleta";
import ModalPagar from "./ModalPagar";
import NavbarRecepcion from "./NavbarRecepcion";
import NotificacionesPanel from "./NotificacionesPanel";

import Productos from "./Productos";
import CitasRecepcion from "./CitasRecepcion";
import UsuariosRecepcion from "./Usuarios";
import CajaDia from "./CajaDia";

import "./DashboardRecepcion.css";

const API = "http://localhost:4000";

export default function DashboardRecepcion() {
  const token = localStorage.getItem("token") || "";
  const user = JSON.parse(localStorage.getItem("usuario") || "{}");

  const [activeSection, setActiveSection] = useState("boletas");

  const [boletas, setBoletas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  const [tipoBoleta, setTipoBoleta] = useState("hoy");
  const [notiCount, setNotiCount] = useState(0);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [boletaSeleccionada, setBoletaSeleccionada] = useState(null);

  const [mostrarModalVer, setMostrarModalVer] = useState(false);
  const [boletaVer, setBoletaVer] = useState(null);

  const [mostrarModalPagar, setMostrarModalPagar] = useState(false);

  const cargarBoletas = async () => {
    try {
      setLoading(true);

      const endpoint =
        tipoBoleta === "hoy"
          ? `${API}/api/boletas/hoy`
          : `${API}/api/boletas/anteriores`;

      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const boletasCompletas = await Promise.all(
        res.data.map(async (b) => {
          const full = await axios.get(`${API}/api/boletas/${b.id}/completa`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          return {
            ...b,
            detalles: full.data.detalles || [],
          };
        })
      );

      setBoletas(boletasCompletas);
    } catch (error) {
      Swal.fire("Error", "No se pudieron cargar las boletas", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarBoletas();
  }, [tipoBoleta]);

  const cargarNotificaciones = async () => {
    try {
      const res = await axios.get(`${API}/api/notificaciones`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotiCount(res.data.filter((n) => !n.leido).length);
    } catch (error) {
      console.error("❌ Error cargando notificaciones:", error);
    }
  };

  useEffect(() => {
    cargarNotificaciones();
    const interval = setInterval(cargarNotificaciones, 8000);
    return () => clearInterval(interval);
  }, []);

  const abrirModal = (boleta) => {
    setBoletaSeleccionada(boleta);
    setMostrarModal(true);
  };

  const verBoleta = (boleta) => {
    setBoletaVer(boleta);
    setMostrarModalVer(true);
  };

  const abrirModalPagar = (boleta) => {
    setBoletaVer(boleta);
    setMostrarModalPagar(true);
  };

  const boletasFiltradas = boletas.filter((b) =>
    `${b.mascotaNombre} ${b.dueno} ${b.tipoAtencion} ${b.motivo}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "/";
  };

  return (
    <div className="layout-recepcion">
      <NavbarRecepcion
        user={user}
        activeSection={activeSection}
        onChangeSection={setActiveSection}
        onLogout={handleLogout}
        notiCount={notiCount}
      />

      <div className="recepcion-container">
        <header className="recepcion-header">
          <h2>📋 Panel de Recepción — Colitas Sanas</h2>
          <p>
            Bienvenido(a), <strong>{user.nombre}</strong>
          </p>
        </header>

        {activeSection === "boletas" && (
          <>
            {/* ⭐ CABECERA ESTÉTICA NUEVA */}
            <div className="boletas-header">

              {/* Botones de filtro */}
              <div className="boletas-switch">
                <button
                  className={tipoBoleta === "hoy" ? "active" : ""}
                  onClick={() => setTipoBoleta("hoy")}
                >
                  🟢 Hoy
                </button>

                <button
                  className={tipoBoleta === "anteriores" ? "active" : ""}
                  onClick={() => setTipoBoleta("anteriores")}
                >
                  📅 Anteriores
                </button>
              </div>

              {/* Buscador */}
              <div className="boletas-search">
                <input
                  type="text"
                  placeholder="🔍 Buscar por mascota, dueño o atención..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>

            </div>

            {loading ? (
              <p>Cargando...</p>
            ) : (
              <table className="tabla-boletas">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Mascota</th>
                    <th>Dueño</th>
                    <th>Atención</th>
                    <th>Motivo</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Método</th>
                    <th>Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {boletasFiltradas.map((b) => (
                    <tr key={b.id}>
                      <td>{b.id}</td>
                      <td>{b.mascotaNombre}</td>
                      <td>{b.dueno}</td>
                      <td>{b.tipoAtencion}</td>
                      <td>{b.motivo}</td>
                      <td>S/. {Number(b.total).toFixed(2)}</td>

                      <td>
                        <span className={`estado ${b.estado}`}>{b.estado}</span>
                      </td>

                      <td>{b.metodoPago || "-"}</td>

                      <td className="acciones">
                        <button className="btn-agregar" onClick={() => abrirModal(b)}>
                          🧾 Agregar producto
                        </button>

                        <button className="btn-ver" onClick={() => verBoleta(b)}>
                          👁 Ver
                        </button>

                        {b.estado === "pendiente" ? (
                          <button className="btn-pagar" onClick={() => abrirModalPagar(b)}>
                            💵 Pagar
                          </button>
                        ) : (
                          "✔️"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        {activeSection === "productos" && <Productos />}
        {activeSection === "citas" && <CitasRecepcion />}
        {activeSection === "usuarios" && <UsuariosRecepcion />}
        {activeSection === "notificaciones" && <NotificacionesPanel />}
        {activeSection === "caja" && <CajaDia />}
      </div>

      {mostrarModal && (
        <ModalAgregarProducto
          boleta={boletaSeleccionada}
          onClose={() => setMostrarModal(false)}
          onAdded={() => {
            cargarBoletas();
            setMostrarModal(false);
          }}
        />
      )}

      {mostrarModalVer && (
        <ModalVerBoleta boleta={boletaVer} onClose={() => setMostrarModalVer(false)} />
      )}

      {mostrarModalPagar && (
        <ModalPagar
          boleta={boletaVer}
          onClose={() => setMostrarModalPagar(false)}
          onPaid={() => cargarBoletas()}
        />
      )}
    </div>
  );
}
