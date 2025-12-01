import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import "./Navbar.css";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(false);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const cargarUsuario = () => {
      const usuarioGuardado = localStorage.getItem("usuario");
      setUsuario(usuarioGuardado ? JSON.parse(usuarioGuardado) : null);
    };

    cargarUsuario();
    window.addEventListener("sessionChanged", cargarUsuario);

    return () => window.removeEventListener("sessionChanged", cargarUsuario);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.dispatchEvent(new Event("sessionChanged"));
    navigate("/login");
  };

  if (usuario?.rol === "medico") return null;

  return (
    <nav className="navbar shadow-md">
      <div className="navbar-container">

        {/* LOGO + Slogan */}
        <Link to="/" className="navbar-title">
          <div className="brand hover:scale-[1.02] transition-transform">
            <h1>
              <span className="title-primary">Colitas</span>{" "}
              <span className="title-secondary">Sanas</span>
            </h1>
            <p className="slogan">Donde cada colita recibe amor de verdad 🐾</p>
          </div>
        </Link>

        {/* NAVIGATION */}
        <div className="navbar-links">

          <Link to="/" className={isActive("/") ? "nav-btn active" : "nav-btn"}>
            Inicio
          </Link>

          <Link
            to="/servicios"
            className={isActive("/servicios") ? "nav-btn active" : "nav-btn"}
          >
            Servicios
          </Link>

          <Link
            to="/equipo"
            className={isActive("/equipo") ? "nav-btn active" : "nav-btn"}
          >
            Equipo
          </Link>

          <Link
            to="/contacto"
            className={isActive("/contacto") ? "nav-btn active" : "nav-btn"}
          >
            Contacto
          </Link>

          {/* USUARIO */}
          {usuario ? (
            <div className="usuario-icono">
              <button
                className="usuario-boton"
                onClick={() => setMenuAbierto(!menuAbierto)}
              >
                <FaUserCircle size={35} color="#155e4a" />
              </button>

              {menuAbierto && (
                <div className="usuario-menu animate-fadeIn">
                  <p className="usuario-nombre">
                    👋 Hola, <strong>{usuario.nombre?.toUpperCase()}</strong>
                  </p>

                  {usuario.rol === "cliente" && (
                    <>
                      <Link
                        to="/mis-citas"
                        className="usuario-link"
                        onClick={() => setMenuAbierto(false)}
                      >
                        📅 Mis Citas
                      </Link>
                      <Link
                        to="/mis-mascotas"
                        className="usuario-link"
                        onClick={() => setMenuAbierto(false)}
                      >
                        🐾 Mis Mascotas
                      </Link>
                    </>
                  )}

                 {usuario.rol === "admin" && (
  <Link
    to="/admin/dashboard"
    className="usuario-link"
    onClick={() => setMenuAbierto(false)}
  >
    ⚙️ Panel Admin
  </Link>
)}

  


                  <button className="logout-btn" onClick={handleLogout}>
                    🚪 Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="login-btn">
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
