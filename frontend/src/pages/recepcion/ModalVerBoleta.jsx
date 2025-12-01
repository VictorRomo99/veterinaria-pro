// src/pages/recepcion/ModalVerBoleta.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "./ModalVerBoleta.css";

const API = import.meta.env.VITE_API_URL;

export default function ModalVerBoleta({ boleta, onClose }) {
  const token = localStorage.getItem("token");
  const [detalles, setDetalles] = useState([]);

  useEffect(() => {
    if (boleta?.id) cargarDetalles();
  }, [boleta.id]);

  const cargarDetalles = async () => {
    try {
      const res = await axios.get(`${API}/api/boletas/detalles/${boleta.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDetalles(res.data);
    } catch (err) {
      console.log("Error cargando detalles:", err);
    }
  };

  /* ================================
        FORMATEAR FECHA Y HORA
  =================================*/
  const fechaObj = new Date(boleta.createdAt);

  const fechaFormateada = fechaObj.toLocaleDateString("es-PE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const horaFormateada = fechaObj.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  /* ================================
        CÁLCULOS
  =================================*/
  const totalInicial = Number(boleta.totalInicial || 0);

  const totalProductos = detalles.reduce(
    (acc, d) => acc + Number(d.subtotal),
    0
  );

  const totalFinal = totalInicial + totalProductos;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-boleta" onClick={(e) => e.stopPropagation()}>
        {/* Encabezado */}
        <div className="modal-header">
          <h2>🧾 Boleta #{boleta.id}</h2>
          <button className="cerrar-x" onClick={onClose}>✖</button>
        </div>

        {/* Información General */}
        <div className="boleta-info">
          <p>
            <b>Estado:</b>{" "}
            <span
              className={
                boleta.estado === "pagado"
                  ? "estado-pagado"
                  : boleta.estado === "pendiente"
                  ? "estado-pendiente"
                  : "estado-anulado"
              }
            >
              {boleta.estado}
            </span>
          </p>

          <p><b>Método de pago:</b> {boleta.metodoPago || "-"}</p>

          <p>
            <b>Fecha:</b> {fechaFormateada} — <b>{horaFormateada}</b>
          </p>

          <p><b>Mascota:</b> {boleta.mascotaNombre || "—"}</p>
          <p><b>Dueño:</b> {boleta.dueno || "—"}</p>
          <p><b>Atención / Tipo:</b> {boleta.tipoAtencion || "Venta de producto"}</p>
          <p><b>Motivo:</b> {boleta.motivo || "—"}</p>
        </div>

        <hr />

        {/* Servicio */}
        {totalInicial > 0 && (
          <div className="servicio-box">
            <h3>💉 Servicio veterinario</h3>
            <p className="servicio-total">S/. {totalInicial.toFixed(2)}</p>
          </div>
        )}

        <h3 className="titulo-productos">🛒 Productos</h3>

        {detalles.length === 0 ? (
          <p>No hay productos registrados.</p>
        ) : (
          <table className="tabla-detalles">
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Cant.</th>
                <th>P. Unit.</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {detalles.map((d) => (
                <tr key={d.id}>
                  <td>{d.descripcion}</td>
                  <td>{d.cantidad}</td>
                  <td>S/. {Number(d.precioUnitario).toFixed(2)}</td>
                  <td><b>S/. {Number(d.subtotal).toFixed(2)}</b></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <hr />

        <div className="totales-container">
          <p><b>Total productos:</b> S/. {totalProductos.toFixed(2)}</p>
          <h2 className="total-final">Total final: S/. {totalFinal.toFixed(2)}</h2>
        </div>

        <div className="modal-buttons">
          <button className="btn-cerrar" onClick={onClose}>Cerrar</button>

          {boleta.estado === "pagado" && (
            <>
              <button className="btn-imprimir" onClick={() => window.print()}>
                🖨 Imprimir
              </button>

              <button className="btn-pdf">
                📄 PDF
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
