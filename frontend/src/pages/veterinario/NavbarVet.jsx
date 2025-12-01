// src/pages/veterinario/NavbarVet.jsx
import React, { useEffect, useState } from "react";
import { FaUserMd, FaPlus, FaSignOutAlt } from "react-icons/fa";
import "./NavbarVet.css";

export default function NavbarVet({ onRegistrar }) {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem("usuario");
    if (data) setUsuario(JSON.parse(data));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "/";
  };

  return (
    <aside className="navbar-vet">
      <h2 className="nav-title">Panel Veterinario</h2>
      <p className="nav-subtitle">Módulo médico</p>

      {/* Usuario */}
      {usuario && (
        <div className="vet-userbox">
          <FaUserMd className="vet-user-icon" />
          <p className="vet-rol">Veterinario</p>
          <p className="vet-name">Dr. {usuario.nombre?.toUpperCase()}</p>
        </div>
      )}

      {/* Botón Registrar */}
      <button className="nav-btn" onClick={onRegistrar}>
        <FaPlus /> Registrar Mascota
      </button>

      {/* Logout */}
      <button className="nav-btn logout" onClick={handleLogout}>
        <FaSignOutAlt /> Cerrar sesión
      </button>
    </aside>
  );
}
