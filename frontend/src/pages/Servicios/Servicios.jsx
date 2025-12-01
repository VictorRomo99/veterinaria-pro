import "./Servicios.css";

export default function Servicios() {
  const servicios = [
    {
      titulo: "Consulta veterinaria general",
      breve: "Evaluación completa del estado de salud de tu mascota.",
      detalle:
        "Examen físico, control de peso, revisión de piel, oídos, ojos, boca y movilidad. Ideal para chequeos preventivos o si notas un cambio de comportamiento.",
      icono: "🩺",
      imagen: "/img/servicios/consulta.jpg",
      mensaje: "Hola, quisiera agendar una consulta veterinaria general 🩺",
    },
    {
      titulo: "Vacunación y control preventivo",
      breve: "Protección contra enfermedades virales y bacterianas.",
      detalle:
        "Plan de vacunación según la edad y estilo de vida. Incluye desparasitación y recomendaciones personalizadas para mantener su sistema inmune fuerte.",
      icono: "💉",
      imagen: "/img/servicios/vacunacion.jpg",
      mensaje: "Hola, me gustaría agendar una cita para vacunación 💉",
    },
    {
      titulo: "Peluquería y cuidado estético",
      breve: "Baño, corte y cuidado de piel y pelaje.",
      detalle:
        "Higiene profunda con productos seguros para mascotas, limpieza de orejas, corte de uñas y estilizado. Ideal para razas de pelaje largo o piel sensible.",
      icono: "✂️",
      imagen: "/img/servicios/peluqueria.jpg",
      mensaje: "Hola, quiero reservar servicio de peluquería ✂️",
    },
    {
      titulo: "Atención de emergencias",
      breve: "Atención inmediata cuando más importa.",
      detalle:
        "Primeros auxilios, estabilización y monitoreo. Recomendado si tu mascota presenta vómitos intensos, dificultad para respirar o heridas graves.",
      icono: "🚑",
      imagen: "/img/servicios/emergencias.jpg",
      mensaje: "¡Emergencia! Necesito atención urgente para mi mascota 🚑",
    },
    {
      titulo: "Odontología veterinaria",
      breve: "Limpieza dental profesional con ultrasonido.",
      detalle:
        "Removemos sarro y placa para prevenir infecciones, dolor y pérdida de piezas dentales. Recomendado desde el primer año de vida.",
      icono: "🦷",
      imagen: "/img/servicios/dental.jpg",
      mensaje: "Hola, quiero información sobre limpieza dental 🦷",
    },
    {
      titulo: "Visita a domicilio",
      breve: "Cuidamos a tu engreído sin que salga de casa.",
      detalle:
        "Consulta, control post-tratamiento o aplicación de medicamentos en tu hogar. Ideal para mascotas nerviosas o tutores con movilidad limitada.",
      icono: "🏠",
      imagen: "/img/servicios/domicilio.jpg",
      mensaje: "Hola, deseo agendar una visita veterinaria a domicilio 🏠",
    },
  ];

  const telefonoWhatsApp = "965751514"; // ← Cambiar por el real del veterinario

  // 📲 Abrir WhatsApp con mensaje prellenado
  const enviarWhatsApp = (mensaje) => {
    const url = `https://wa.me/${telefonoWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  };

  // 📅 Ir al flujo de reserva con el servicio seleccionado
  const irAReservar = (titulo) => {
    window.location.href = `/reservar?servicio=${encodeURIComponent(titulo)}`;
  };

  return (
    <div className="svc-page">
      {/* ==== Sección Hero ==== */}
      <section className="svc-hero">
        <div className="svc-hero-inner">
          <h1 className="svc-title">Servicios veterinarios profesionales 🐶🐱</h1>
          <p className="svc-subtitle">
            En <strong>Colitas Sanas</strong> cuidamos la salud y el bienestar
            de tu mascota con responsabilidad, cariño y atención personalizada.
          </p>
          <div className="svc-badges">
            <div className="badge">❤️ Atención con paciencia y amor</div>
            <div className="badge">🩺 Veterinarios certificados</div>
            <div className="badge">🕒 Emergencias y citas programadas</div>
          </div>
        </div>
      </section>

      {/* ==== Sección Grid de Servicios ==== */}
      <section className="svc-grid-section">
        <h2 className="svc-section-title">Nuestros servicios</h2>
        <p className="svc-section-desc">
          Conoce cómo podemos ayudarte a cuidar a tu mejor amigo 🐾
        </p>

        <div className="svc-grid">
          {servicios.map((s, i) => (
            <div key={i} className="svc-card">
              <img src={s.imagen} alt={s.titulo} className="svc-img" />
              <div className="svc-content">
                <h3 className="svc-card-title">
                  {s.icono} {s.titulo}
                </h3>
                <p className="svc-card-brief">{s.breve}</p>
                <p className="svc-card-detail">{s.detalle}</p>

                <div className="svc-btns">
                  <button
                    className="svc-cta-btn"
                    onClick={() => enviarWhatsApp(s.mensaje)}
                  >
                    Hablar por WhatsApp
                  </button>
                  <button
                    className="svc-cta-outline"
                    onClick={() => irAReservar(s.titulo)}
                  >
                    Agendar cita
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==== Llamado a la acción final ==== */}
      <section className="svc-cta-final">
        <div className="svc-cta-box">
          <div className="svc-cta-left">
            <h3>¿Necesitas ayuda inmediata?</h3>
            <p>
              Llámanos o escríbenos por WhatsApp. Nuestro equipo está disponible
              para orientarte y atender emergencias.
            </p>
          </div>
          <div className="svc-cta-right">
            <button
              className="svc-cta-main"
              onClick={() =>
                enviarWhatsApp("¡Necesito ayuda urgente para mi mascota! 🚨")
              }
            >
              Contactar ahora
            </button>
            <button className="svc-cta-alt" onClick={() => irAReservar("Consulta veterinaria general")}>
              Agendar cita
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
