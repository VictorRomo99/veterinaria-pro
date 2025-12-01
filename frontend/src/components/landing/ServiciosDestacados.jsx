import "./ServiciosDestacados.css";

export default function ServiciosDestacados() {
  const servicios = [
    {
      icon: "🩺",
      titulo: "Consulta veterinaria",
      desc: "Chequeos completos y diagnósticos profesionales.",
    },
    {
      icon: "💉",
      titulo: "Vacunación",
      desc: "Protección al día para prevenir enfermedades.",
    },
    {
      icon: "✂️",
      titulo: "Peluquería",
      desc: "Baño, corte y cepillado con cariño.",
    },
    {
      icon: "🦷",
      titulo: "Limpieza dental",
      desc: "Cuidado odontológico para una sonrisa sana.",
    },
    {
      icon: "🚑",
      titulo: "Emergencias",
      desc: "Atención inmediata cuando más importa.",
    },
  ];

  return (
    <section id="servicios" className="servicios-section">
      <h2 className="servicios-title">Servicios principales</h2>
      <p className="servicios-sub">
        Salud y bienestar para tu mascota en un solo lugar 🐾
      </p>

      <div className="servicios-grid">
        {servicios.map((srv, i) => (
          <div key={i} className="servicio-card">
            <div className="servicio-icon">{srv.icon}</div>
            <div className="servicio-titulo">{srv.titulo}</div>
            <div className="servicio-desc">{srv.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
