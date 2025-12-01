import { useEffect, useState } from "react";
import "./EquipoDestacado.css";
import equipoData from "../../data/equipoData";

export default function EquipoDestacado() {
  const [equipoAleatorio, setEquipoAleatorio] = useState([]);

  const obtenerAleatorios = (arr, cantidad) => {
    const copia = [...arr];
    copia.sort(() => Math.random() - 0.5);
    return copia.slice(0, cantidad);
  };

  useEffect(() => {
    const seleccion = obtenerAleatorios(equipoData, 3);
    setEquipoAleatorio(seleccion);
  }, []);

  return (
    <section className="equipo-section" id="equipo">
      <h2 className="equipo-title">Nuestro equipo</h2>
      <p className="equipo-subtitle">
        Profesionales con vocación, listos para cuidar a tu mejor amigo 🐶🐱
      </p>

      <div className="equipo-grid">
        {equipoAleatorio.map((doc, i) => (
          <div key={i} className="equipo-card">
            <img
              src={doc.imagen}
              alt={doc.nombre}
              className="equipo-foto"
            />

            <div className="equipo-info">
              <h3>{doc.nombre}</h3>
              <p className="equipo-especialidad">{doc.especialidad}</p>
              <p className="equipo-descripcion">{doc.descripcion}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
