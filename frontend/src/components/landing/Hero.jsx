import "./Hero.css";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  const irServicios = () => navigate("/servicios");
  const irCita = () => navigate("/contacto");

  return (
    <section className="hero-section">
      <div className="hero-inner">
        <h1 className="hero-title">
          Amor, salud y cuidado para tus mejores amigos 🐶🐱
        </h1>

        <p className="hero-text">
          En <strong>Colitas Sanas</strong> cuidamos el bienestar de tu mascota
          con responsabilidad, cariño y profesionales de confianza.
        </p>

        <div className="hero-actions">
          <button className="btn-primary" onClick={irServicios}>
            Ver servicios
          </button>

          <button className="btn-outline" onClick={irCita}>
            Agendar cita
          </button>
        </div>
      </div>
    </section>
  );
}
