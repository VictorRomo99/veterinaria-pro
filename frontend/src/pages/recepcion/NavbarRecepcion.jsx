// src/pages/recepcion/NavbarRecepcion.jsx
import "./NavbarRecepcion.css";

const menuItems = [
  { id: "boletas", icon: "fa-regular fa-file-lines", label: "Boletas" },
  { id: "productos", icon: "fa-solid fa-boxes-stacked", label: "Productos" },
  { id: "citas", icon: "fa-regular fa-calendar-check", label: "Citas" },
  { id: "caja", icon: "fa-solid fa-cash-register", label: "Caja del día" },
  { id: "usuarios", icon: "fa-solid fa-users", label: "Usuarios" },
  { id: "notificaciones", icon: "fa-regular fa-bell", label: "Notificaciones" },
];

export default function NavbarRecepcion({
  user,
  activeSection,
  onChangeSection,
  onLogout,
  notiCount = 0,
}) {
  const nombre = user?.nombre || "Usuario";
  const correo = user?.correo || user?.email || "";

  return (
    <aside className="nav-rx">
      
      {/* LOGO */}
      <div className="nav-rx-header">
        <div className="nav-rx-logo">
          <i className="fa-solid fa-paw"></i>
        </div>
        <div className="nav-rx-title">
          <p className="main">Panel de Recepción</p>
          <p className="sub">Colitas Sanas</p>
        </div>
      </div>

      {/* USUARIO */}
      <div className="nav-rx-user">
        <p className="hi">
          👋 Bienvenido(a),{" "}
          <span className="name">{nombre}</span>
        </p>
        {correo && <p className="email">{correo}</p>}
      </div>

      {/* MENU */}
      <nav className="nav-rx-menu">
        {menuItems.map((item) => {
          const active = activeSection === item.id;
          const showCount = item.id === "notificaciones" && notiCount > 0;

          return (
            <button
              key={item.id}
              className={`nav-rx-item ${active ? "active" : ""}`}
              onClick={() => onChangeSection(item.id)}
            >
              <i className={`${item.icon} nav-rx-icon`} />

              <span className="text">{item.label}</span>

              {showCount && <span className="badge">{notiCount}</span>}
            </button>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="nav-rx-bottom">
        <button className="nav-rx-item">
          <i className="fa-solid fa-user nav-rx-icon"></i>
          <span>Mi perfil</span>
        </button>

        <button className="nav-rx-item logout" onClick={onLogout}>
          <i className="fa-solid fa-right-from-bracket nav-rx-icon"></i>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
