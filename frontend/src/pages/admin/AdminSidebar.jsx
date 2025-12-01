// src/pages/admin/AdminSidebar.jsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaStethoscope,
  FaCashRegister,
  FaCalendarCheck,
  FaCogs,
  FaTachometerAlt,
  FaMoneyBillWave,
  FaPaw,
  FaChartBar,
  FaExclamationTriangle,
  FaUsers,
  FaSignOutAlt,
} from "react-icons/fa";

import "./AdminSidebar.css";

export default function AdminSidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  const menuItems = [
    { to: "/admin/atenciones", label: "Atenciones", icon: <FaStethoscope /> },
    { to: "/admin/caja", label: "Caja", icon: <FaCashRegister /> },
    { to: "/admin/citas", label: "Citas", icon: <FaCalendarCheck /> },
    { to: "/admin/config", label: "Config", icon: <FaCogs /> },
    { to: "/admin/dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
    { to: "/admin/movimientos-caja", label: "Mov. Caja", icon: <FaMoneyBillWave /> },
    { to: "/admin/productos", label: "Productos", icon: <FaPaw /> },
    { to: "/admin/reportes", label: "Reportes", icon: <FaChartBar /> },
    { to: "/admin/stock-bajo", label: "Stock Bajo", icon: <FaExclamationTriangle /> },
    { to: "/admin/usuarios", label: "Usuarios", icon: <FaUsers /> },
  ];

  return (
    <aside className="admin-sidebar-pro">
      <h2 className="sidebar-title-pro">🐾 Admin</h2>

      <nav className="admin-nav-pro">
        {menuItems.map(({ to, label, icon }) => (
          <Link
            key={to}
            to={to}
            className={`sidebar-item-pro ${pathname === to ? "active" : ""}`}
          >
            <span className="icon">{icon}</span>
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <button className="logout-btn-pro" onClick={handleLogout}>
        <FaSignOutAlt className="icon-logout" /> Cerrar Sesión
      </button>
    </aside>
  );
}
