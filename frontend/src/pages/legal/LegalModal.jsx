import React from "react";
import ReactDOM from "react-dom";
import "./LegalModal.css";

export default function LegalModal({ open, title, onClose, children }) {

  // ⛔ Si open es false → no mostrar modal
  if (!open) return null;

  // 🟢 Detectar clic fuera
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("legal-modal-overlay")) {
      onClose();
    }
  };

  return ReactDOM.createPortal(
    <div className="legal-modal-overlay" onClick={handleOverlayClick}>
      <div className="legal-modal" onClick={(e) => e.stopPropagation()}>
        <div className="legal-modal-header">
          <h2>{title}</h2>
          <button className="close-legal" onClick={onClose}>✖</button>
        </div>

        <div className="legal-modal-body">{children}</div>
      </div>
    </div>,
    document.body
  );
}
