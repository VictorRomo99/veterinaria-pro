import "./Equipo.css";
import equipo from "../../data/equipoData";
// ⬅️ IMPORTAMOS LA LISTA

export default function Equipo() {
  return (
    <div className="equipo-page">
      <section className="equipo-header">
        <h1>👩‍⚕️ Nuestro Equipo Profesional</h1>
        <p>
          En <strong>Colitas Sanas</strong> contamos con un grupo de especialistas dedicados
          al cuidado integral de tus mascotas. Conoce a quienes hacen posible
          que cada colita reciba amor y atención de verdad.
        </p>
      </section>

      <section className="equipo-grid">
        {equipo.map((persona, i) => (
          <div key={i} className="equipo-card">
            <img
              src={persona.imagen}
              alt={persona.nombre}
              className="equipo-foto"
            />
            <div className="equipo-info">
              <h3>{persona.nombre}</h3>
              <p className="equipo-especialidad">{persona.especialidad}</p>
              <p className="equipo-descripcion">{persona.descripcion}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="equipo-cta">
        <h2>¿Quieres conocer más sobre nosotros?</h2>
        <p>
          Visítanos o agenda una cita. ¡Estaremos encantados de cuidar a tu compañero de vida! 🐾
        </p>
        <a href="/contacto" className="equipo-btn">Contáctanos</a>
      </section>
    </div>
  );
}
