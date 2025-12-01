import "./Contacto.css";

export default function Contacto() {
  const telefonoWhatsApp = "965751514"; // cámbialo si quieres
  const direccionClinica = "Av. Los Pinos 245, Miraflores, Lima";

  const handleWhatsApp = () => {
    const mensaje = `Hola 👋 quisiera hacer una consulta / agendar una cita para mi mascota 🐶🐱`;
    const url = `https://wa.me/${telefonoWhatsApp}?text=${encodeURIComponent(
      mensaje
    )}`;
    window.open(url, "_blank");
  };

  return (
    <div className="contacto-page contacto-zone">
      {/* HEADER / INTRO */}
      <section className="contacto-hero">
        <h1 className="contacto-title">
          ¿Necesitas ayuda para tu engreído? 🐾
        </h1>
        <p className="contacto-desc">
          Nuestro equipo está listo para ayudarte con emergencias, controles,
          vacunas, grooming y más. Escríbenos o ven a vernos.
        </p>
      </section>

      <section className="contacto-grid">
        {/* CARD: INFO DE LA CLÍNICA */}
        <div className="contact-card">
          <h2 className="contact-card-title">📍 Nuestra clínica</h2>
          <p className="contact-line">
            <strong>Dirección:</strong> {direccionClinica}
          </p>
          <p className="contact-line">
            <strong>Horario:</strong> Lun - Sáb, 9:00am a 8:00pm
          </p>
          <p className="contact-line">
            <strong>Emergencias:</strong> 24/7 (sujeto a disponibilidad)
          </p>
          <p className="contact-note">
            Atención con cita previa para reducir estrés en tu mascota 🐶🐱.
          </p>

          <button className="wa-btn full" onClick={handleWhatsApp}>
            💬 Hablar por WhatsApp
          </button>
        </div>

        {/* CARD: CONTACTO RÁPIDO */}
        <div className="contact-card">
          <h2 className="contact-card-title">📞 Contáctanos</h2>

          <div className="contact-block">
            <span className="contact-label">Teléfono / WhatsApp:</span>
            <span className="contact-value">{telefonoWhatsApp}</span>
          </div>

          <div className="contact-block">
            <span className="contact-label">Correo:</span>
            <span className="contact-value">recepcion@colitassanas.com</span>
          </div>

          <div className="contact-block">
            <span className="contact-label">Atención:</span>
            <span className="contact-value">
              Recepción y triage veterinario rápido
            </span>
          </div>

          <div className="contact-help">
            Si es una emergencia (respira raro, accidente, vómito con sangre),
            contáctanos inmediatamente.
          </div>
        </div>

{/* CARD: MAPA */}
<div className="contact-card map-card">
  <h2 className="contact-card-title">🗺 Cómo llegar</h2>
  <div className="map-wrapper">
    <iframe
      title="Ubicación clínica veterinaria"
      width="100%"
      height="100%"
      style={{ border: 0 }}
      loading="lazy"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.7298152397857!2d-75.21574392409708!3d-12.062101688175916!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x910e964801aaf089%3A0x68685454e1226c01!2sVeterinaria%20Tu%20MejorPata!5e0!3m2!1ses!2spe!4v1761761539948!5m2!1ses!2spe"
    ></iframe>
  </div>

  <p className="map-hint">
    Estamos cerca del parque 🐕. Fácil estacionar / dejamos recogida en puerta
    si tu mascota está nerviosa.
  </p>
</div>
</section>

{/* CTA FINAL */}
<section className="contacto-final">
  <div className="final-box">
    <div className="final-left">
      <h3>¿Tu peludo necesita atención hoy? 💚</h3>
      <p>
        Escríbenos y te damos la primera disponibilidad con nuestro
        equipo.
      </p>
    </div>
    <div className="final-right">
      <button className="wa-btn" onClick={handleWhatsApp}>
        Hablar ahora
      </button>
      <button
        className="outline-btn"
        onClick={() => (window.location.href = "/reservar")}
      >
        Agendar cita
      </button>
    </div>
  </div>
</section>
</div>
);
}