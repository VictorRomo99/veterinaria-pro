import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "./ModalPagar.css"; // 🔥 Agregado

const API = "http://localhost:4000";

export default function ModalPagar({ boleta, onClose, onPaid }) {
  const token = localStorage.getItem("token");

  const [metodoPago, setMetodoPago] = useState("efectivo");

  const pagar = async () => {
    try {
      await axios.put(
        `${API}/api/boletas/${boleta.id}/pagar`,
        { metodoPago },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
        title: "✔️ Pago registrado",
        text: "La boleta fue pagada correctamente.",
        icon: "success",
        didOpen: () => {
          const c = document.querySelector(".swal2-container");
          if (c) c.style.zIndex = "9999999";
        }
      });

      onPaid && onPaid();
      onClose();
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: "No se pudo procesar el pago.",
        icon: "error",
        didOpen: () => {
          const c = document.querySelector(".swal2-container");
          if (c) c.style.zIndex = "9999999";
        }
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">Confirmar pago</h3>

        <label className="label">Método de pago:</label>
        <select
          value={metodoPago}
          onChange={(e) => setMetodoPago(e.target.value)}
        >
          <option value="efectivo">Efectivo</option>
          <option value="tarjeta">Tarjeta</option>
          <option value="yape">Yape</option>
          <option value="plin">Plin</option>
        </select>

        <button className="btn-save" onClick={pagar}>
          💵 Pagar
        </button>

        <button className="btn-close" onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
