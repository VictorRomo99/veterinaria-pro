// src/pages/CajaDia.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "./CajaDia.css";

const API = "http://localhost:4000";

export default function CajaDia() {
  const token = localStorage.getItem("token");
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  const [caja, setCaja] = useState(null);
  const [loading, setLoading] = useState(true);

  const [movimiento, setMovimiento] = useState({
    descripcion: "",
    monto: "",
  });

  const [montoCierre, setMontoCierre] = useState("");

  // ⭐ ESTADOS
  const [movimientos, setMovimientos] = useState([]);
  const [totalesPorMetodo, setTotalesPorMetodo] = useState({});

  // ===============================
  // 🔄 Cargar caja del día
  // ===============================
  const cargarCaja = async () => {
    try {
      const { data } = await axios.get(`${API}/api/caja/dia`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!data) {
        setCaja(null);
      } else {
        // Normalizamos todos los totales a número
        const cajaNormalizada = {
          ...data,
          totalServicios: Number(data.totalServicios || 0),
          totalProductos: Number(data.totalProductos || 0),
          totalIngresosExtras: Number(data.totalIngresosExtras || 0),
          totalGastos: Number(data.totalGastos || 0),
          totalCalculado: Number(
            data.totalCalculado != null ? data.totalCalculado : data.montoFinal || 0
          ),
          totalEfectivo: Number(data.totalEfectivo || 0),
          totalTarjeta: Number(data.totalTarjeta || 0),
          totalYape: Number(data.totalYape || 0),
          totalPlin: Number(data.totalPlin || 0),
        };

        setCaja(cajaNormalizada);

        // ⭐ ACTUALIZAR RESUMEN POR MÉTODO
        setTotalesPorMetodo({
          efectivo: cajaNormalizada.totalEfectivo,
          tarjeta: cajaNormalizada.totalTarjeta,
          yape: cajaNormalizada.totalYape,
          plin: cajaNormalizada.totalPlin,
        });

        // ⭐ Cargar movimientos reales de la caja
        await cargarMovimientos(data.id);
      }
    } catch (err) {
      console.error(err);
      setCaja(null);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // 📥 Cargar movimientos de caja
  // ===============================
  const cargarMovimientos = async (cajaId) => {
    try {
      const { data } = await axios.get(
        `${API}/api/caja/movimientos/${cajaId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMovimientos(data);
    } catch (err) {
      console.error("❌ Error cargando movimientos:", err);
      setMovimientos([]);
    }
  };

  // ===============================
  // 🟢 Abrir caja
  // ===============================
  const abrirCaja = async () => {
    try {
      const { data } = await axios.post(
        `${API}/api/caja/abrir`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("Caja abierta", data.message, "success");
      await cargarCaja();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo abrir la caja", "error");
    }
  };

  // ===============================
  // ➕ Registrar ingreso extra
  // ===============================
  const registrarIngresoExtra = async () => {
    if (!caja) return;

    if (!movimiento.descripcion || !movimiento.monto) {
      return Swal.fire("Datos incompletos", "Completa todos los campos", "warning");
    }

    try {
      await axios.post(
        `${API}/api/caja/ingreso-extra`,
        {
          cajaId: caja.id,
          descripcion: movimiento.descripcion,
          monto: movimiento.monto,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("Ingreso registrado", "", "success");
      setMovimiento({ descripcion: "", monto: "" });
      await cargarCaja();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo registrar el ingreso", "error");
    }
  };

  // ===============================
  // ➖ Registrar gasto
  // ===============================
  const registrarGasto = async () => {
    if (!caja) return;

    if (!movimiento.descripcion || !movimiento.monto) {
      return Swal.fire("Datos incompletos", "Completa todos los campos", "warning");
    }

    try {
      await axios.post(
        `${API}/api/caja/gasto`,
        {
          cajaId: caja.id,
          descripcion: movimiento.descripcion,
          monto: movimiento.monto,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("Gasto registrado", "", "success");
      setMovimiento({ descripcion: "", monto: "" });
      await cargarCaja();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo registrar el gasto", "error");
    }
  };

  // ===============================
  // 🔴 Cerrar caja
  // ===============================
  const cerrarCaja = async () => {
    if (!caja) return;

    if (!montoCierre) {
      return Swal.fire("Falta monto final", "Ingresa el monto contado", "warning");
    }

    try {
      await axios.post(
        `${API}/api/caja/cerrar`,
        {
          cajaId: caja.id,
          montoFinalReal: montoCierre,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("Caja cerrada", "El cierre fue registrado correctamente", "success");
      await cargarCaja();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo cerrar la caja", "error");
    }
  };

  useEffect(() => {
    cargarCaja();
  }, []);

  if (loading) return <p>Cargando...</p>;

  // 🔢 Totales para dashboard (solo se usan si hay caja)
  const totalDia =
    (caja?.totalServicios || 0) +
    (caja?.totalProductos || 0) +
    (caja?.totalIngresosExtras || 0) -
    (caja?.totalGastos || 0);

  return (
    <div className="caja-container">
      <h2>📦 Caja del Día</h2>

      {/* Si NO hay caja → abrir caja */}
      {!caja ? (
        <div className="panel-abrir">
          <p>No hay caja abierta hoy.</p>
          <button className="btn-abrir" onClick={abrirCaja}>
            Abrir Caja
          </button>
        </div>
      ) : (
        <>
          {/* ⭐ DASHBOARD POS SUPERIOR */}
          <div className="caja-dashboard">
            <div className="dashboard-card card-total-dia">
              <div className="card-label">Total del día</div>
              <div className="card-amount">
                S/ {totalDia.toFixed(2)}
              </div>
              <div className="card-sub">Servicios + Productos + Ingresos extra - Gastos</div>
            </div>

            <div className="dashboard-card card-servicios">
              <div className="card-label">Total servicios</div>
              <div className="card-amount">
                S/ {caja.totalServicios?.toFixed(2) || "0.00"}
              </div>
              <div className="card-sub">Atenciones y procedimientos</div>
            </div>

            <div className="dashboard-card card-productos">
              <div className="card-label">Total productos</div>
              <div className="card-amount">
                S/ {caja.totalProductos?.toFixed(2) || "0.00"}
              </div>
              <div className="card-sub">Ventas de tienda</div>
            </div>

            <div className="dashboard-card card-metodos">
              <div className="card-label">Por método de pago</div>
              <div className="card-metodos-grid">
                <span>Efectivo: S/ {caja.totalEfectivo?.toFixed(2) || "0.00"}</span>
                <span>Tarjeta: S/ {caja.totalTarjeta?.toFixed(2) || "0.00"}</span>
                <span>Yape: S/ {caja.totalYape?.toFixed(2) || "0.00"}</span>
                <span>Plin: S/ {caja.totalPlin?.toFixed(2) || "0.00"}</span>
              </div>
            </div>
          </div>

          {/* Estado de la caja */}
          <div className="panel-caja">
            <h3>Estado Actual</h3>
            <p>
              <strong>Fecha:</strong> {caja.fechaApertura}
            </p>
            <p>
              <strong>Hora de apertura:</strong> {caja.horaApertura}
            </p>
            <p>
              <strong>Estado:</strong>{" "}
              <span className={caja.estado === "abierta" ? "badge-estado abierta" : "badge-estado cerrada"}>
                {caja.estado === "abierta" ? "Caja abierta" : "Caja cerrada"}
              </span>
            </p>

            <h4 className="subtitulo-panel">Totales</h4>
            <p>💰 Servicios: S/ {caja.totalServicios?.toFixed(2) || "0.00"}</p>
            <p>🛒 Productos: S/ {caja.totalProductos?.toFixed(2) || "0.00"}</p>
            <p>
              📥 Ingresos extra: S/ {caja.totalIngresosExtras?.toFixed(2) || "0.00"}
            </p>
            <p>📤 Gastos: S/ {caja.totalGastos?.toFixed(2) || "0.00"}</p>

            <h4 className="subtitulo-panel">Totales por método de pago</h4>
            <p>💵 Efectivo: S/ {caja.totalEfectivo?.toFixed(2) || "0.00"}</p>
            <p>💳 Tarjeta: S/ {caja.totalTarjeta?.toFixed(2) || "0.00"}</p>
            <p>📱 Yape: S/ {caja.totalYape?.toFixed(2) || "0.00"}</p>
            <p>📱 Plin: S/ {caja.totalPlin?.toFixed(2) || "0.00"}</p>

            <p className="total-final">
              <strong>Total Calculado:</strong>{" "}
              S/ {caja.totalCalculado?.toFixed(2) || "0.00"}
            </p>
          </div>

          {/* ⭐ RESUMEN POR MÉTODO DE PAGO */}
          <div className="panel-resumen-metodos">
            <h3>Resumen por método de pago</h3>

            {Object.keys(totalesPorMetodo).length === 0 ? (
              <p>No hay ingresos registrados por método de pago.</p>
            ) : (
              <ul>
                {Object.entries(totalesPorMetodo).map(([metodo, total]) => (
                  <li key={metodo}>
                    <span className={`badge badge-metodo badge-metodo-${metodo}`}>
                      {metodo.toUpperCase()}
                    </span>
                    <span className="metodo-monto">S/ {total.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ⭐ LISTA DE MOVIMIENTOS */}
          <div className="panel-movimientos-lista">
            <h3>Movimientos del día</h3>

            {movimientos.length === 0 ? (
              <p>No hay movimientos registrados.</p>
            ) : (
              <table className="tabla-movimientos-caja">
                <thead>
                  <tr>
                    <th>Fecha / Hora</th>
                    <th>Tipo</th>
                    <th>Descripción</th>
                    <th>Categoría</th>
                    <th>Método</th>
                    <th className="col-monto">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.map((m) => (
                    <tr key={m.id}>
                      <td>
                        {new Date(m.fechaMovimiento).toLocaleString("es-PE", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td>
                        <span
                          className={`badge badge-tipo ${
                            m.tipo === "ingreso" ? "badge-tipo-ingreso" : "badge-tipo-gasto"
                          }`}
                        >
                          {m.tipo === "ingreso" ? "Ingreso" : "Gasto"}
                        </span>
                      </td>
                      <td>{m.descripcion}</td>
                      <td>
                        {m.categoria ? (
                          <span className="badge badge-cat">{m.categoria}</span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        {m.metodoPago ? (
                          <span
                            className={`badge badge-metodo badge-metodo-${m.metodoPago}`}
                          >
                            {m.metodoPago.charAt(0).toUpperCase() + m.metodoPago.slice(1)}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="texto-monto">
                        S/ {Number(m.monto).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Registrar movimientos */}
          {caja.estado === "abierta" && (
            <div className="panel-movimientos">
              <h3>➕➖ Registrar Movimiento</h3>

              <input
                type="text"
                placeholder="Descripción"
                value={movimiento.descripcion}
                onChange={(e) =>
                  setMovimiento({ ...movimiento, descripcion: e.target.value })
                }
              />

              <input
                type="number"
                placeholder="Monto"
                value={movimiento.monto}
                onChange={(e) =>
                  setMovimiento({ ...movimiento, monto: e.target.value })
                }
              />

              <div className="btns-mov">
                <button className="btn-ingreso" onClick={registrarIngresoExtra}>
                  Registrar Ingreso
                </button>
                <button className="btn-gasto" onClick={registrarGasto}>
                  Registrar Gasto
                </button>
              </div>
            </div>
          )}

          {/* Cierre de caja */}
          {caja.estado === "abierta" && (
            <div className="panel-cierre">
              <h3>🔴 Cerrar Caja</h3>

              <input
                type="number"
                placeholder="Monto final contado"
                value={montoCierre}
                onChange={(e) => setMontoCierre(e.target.value)}
              />

              <button className="btn-cerrar" onClick={cerrarCaja}>
                Cerrar Caja
              </button>
            </div>
          )}

          {/* Caja cerrada */}
          {caja.estado === "cerrada" && (
            <div className="panel-cerrada">
              <h3>Caja cerrada</h3>
              <p>
                <strong>Diferencia:</strong> S/ {Number(caja.diferencia || 0).toFixed(2)}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
