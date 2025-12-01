import "./Testimonios.css";

export default function Testimonios() {
  const testimonios = [
    {
      autor: "María & Luna",
      texto:
        "Mi perrita entró temblando y salió moviendo la colita. Nunca la habían tratado con tanto cariño.",
      foto: "https://i.pravatar.cc/150?img=47",
      estrellas: 5,
    },
    {
      autor: "Carlos & Max",
      texto:
        "Atención rápida en emergencia. Nos salvaron al gordo, siempre agradecido.",
      foto: "https://i.pravatar.cc/150?img=12",
      estrellas: 5,
    },
    {
      autor: "Valeria & Coco",
      texto:
        "La mejor peluquería que he probado, lo devolvieron suavecito y oliendo riquísimo.",
      foto: "https://i.pravatar.cc/150?img=32",
      estrellas: 5,
    },
  ];

  const renderStars = (num) =>
    Array(num)
      .fill("⭐")
      .join(" ");

  return (
    <section className="testi-section">
      <h2 className="testi-title">Lo que dicen nuestras familias 🐾</h2>

      <div className="testi-grid">
        {testimonios.map((t, i) => (
          <div className="testi-card" key={i}>
            <img src={t.foto} alt={t.autor} className="testi-foto" />

            <div className="testi-texto">“{t.texto}”</div>

            <div className="testi-estrellas">{renderStars(t.estrellas)}</div>

            <div className="testi-autor">— {t.autor}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
