import "./Footer.css";
import { FaFacebook, FaInstagram, FaTiktok, FaTwitter } from "react-icons/fa";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Redes Sociales */}
        <div className="footer-socials">
          <a href="#" target="_blank" rel="noreferrer" className="social-icon">
            <FaFacebook />
          </a>
          <a href="#" target="_blank" rel="noreferrer" className="social-icon">
            <FaInstagram />
          </a>
          <a href="#" target="_blank" rel="noreferrer" className="social-icon">
            <FaTwitter />
          </a>
          <a href="#" target="_blank" rel="noreferrer" className="social-icon">
            <FaTiktok />
          </a>
        </div>

        {/* Enlaces legales */}
        <div className="footer-links">
          <a href="#">Términos y Condiciones</a>
          <span>|</span>
          <a href="#">Política de Privacidad</a>
        </div>

        {/* Copyright */}
        <div className="footer-copy">
          © {year} <strong>Colitas Sanas</strong> — Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}