// src/pages/admin/AdminLayout.jsx 
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "./AdminLayout.css";
import AdminSidebar from "./AdminSidebar"; // ← IMPORTANTE

export default function AdminLayout() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  // Protege que solo admin entre
  useEffect(() => {
    if (!usuario || usuario.rol !== "admin") {
      navigate("/"); 
    }
  }, []);

  return (
    <div className="admin-layout">

      {/* === SIDEBAR DESDE ARCHIVO EXTERNO === */}
      <AdminSidebar />

      {/* === CONTENIDO PRINCIPAL === */}
      <main className="admin-content">

        {/* === NAVBAR SUPERIOR === */}
        <header className="admin-navbar">
          <p>
            Bienvenido, <strong>{usuario.nombre}</strong>
          </p>
        </header>

        {/* === DONDE CARGAN LAS PÁGINAS === */}
        <div className="admin-page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
