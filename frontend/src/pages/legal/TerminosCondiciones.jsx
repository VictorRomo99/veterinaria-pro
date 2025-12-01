// src/pages/legal/TerminosCondiciones.jsx
import "./Legal.css";

export default function TerminosCondiciones() {
  return (
    <div className="legal-container">
      <div className="legal-card">

        <h2>📘 Términos y Condiciones de Uso — Colitas Sanas</h2>

        <p>
          El presente documento (en adelante, los “Términos y Condiciones” o “T&C”)
          regula el acceso y uso del sitio web y plataforma digital de 
          <strong> Clínica Veterinaria Colitas Sanas</strong>, disponible en 
          www.colitassanas.com.pe (en adelante, el “Sitio”), administrado por 
          Colitas Sanas E.I.R.L., con domicilio en Lima, Perú.
        </p>

        <p>
          El acceso y uso del Sitio implica que el usuario ha leído, comprendido 
          y aceptado estos T&C. Si no estás de acuerdo, por favor no utilices 
          la plataforma.
        </p>

        <h3>1. Capacidad legal</h3>
        <p>
          El uso del Sitio está permitido solo a mayores de 18 años con capacidad 
          legal para contratar. Si el usuario es menor de edad, debe utilizar 
          la plataforma bajo supervisión y autorización de un padre o tutor legal.
        </p>

        <h3>2. Registro de usuario</h3>
        <p>
          Para agendar citas o acceder a los servicios digitales, el usuario debe 
          crear una cuenta proporcionando información real, exacta y verificable. 
          Colitas Sanas podrá desactivar cuentas que presenten datos falsos, incompletos 
          o inconsistentes con RENIEC u otras verificaciones.
        </p>

        <h3>3. Uso permitido de la plataforma</h3>
        <p>Los usuarios podrán:</p>
        <ul>
          <li>Registrar mascotas y gestionar sus citas veterinarias.</li>
          <li>Consultar historiales clínicos y tratamientos realizados.</li>
          <li>Acceder a facturación, comprobantes y resultados de atenciones.</li>
          <li>Realizar pagos por servicios cuando la opción esté habilitada.</li>
        </ul>
        <p>No está permitido:</p>
        <ul>
          <li>Manipular el sistema, intervenir el software o modificar funcionalidades.</li>
          <li>Crear múltiples cuentas con datos falsos.</li>
          <li>Utilizar la plataforma con fines fraudulentos o ilícitos.</li>
        </ul>

        <h3>4. Comunicaciones electrónicas</h3>
        <p>
          Colitas Sanas podrá enviar notificaciones sobre citas, recordatorios, 
          campañas de vacunación, resultados clínicos y mensajes administrativos. 
          El usuario podrá solicitar no recibir comunicaciones promocionales.
        </p>

        <h3>5. Servicios ofrecidos</h3>
        <p>
          El Sitio permite programar servicios como consultas veterinarias, vacunas, 
          baños, desparasitaciones y procedimientos. Toda reserva está sujeta a 
          disponibilidad y confirmación.
        </p>

        <h3>6. Pagos y comprobantes</h3>
        <p>
          Cuando se habiliten los pagos en línea, estos podrán realizarse mediante 
          tarjetas débito o crédito, y el comprobante será emitido electrónicamente 
          al correo del usuario.
        </p>

        <h3>7. Cancelación o reprogramación</h3>
        <p>
          Las citas pueden ser canceladas o reprogramadas sin costo hasta 2 horas 
          antes del horario programado. Si el usuario no asiste sin previo aviso, 
          la clínica podrá restringir futuras reservas automáticas.
        </p>

        <h3>8. Responsabilidad de Colitas Sanas</h3>
        <p>
          Colitas Sanas garantiza el cuidado profesional de cada mascota. Sin embargo, 
          no se responsabiliza por fallas técnicas externas, caídas del sistema, 
          interrupciones de internet u otros eventos fuera de control razonable.
        </p>

        <h3>9. Derechos de propiedad intelectual</h3>
        <p>
          Todo el contenido del Sitio, incluyendo imágenes, logos, software, diseño 
          y textos son propiedad de Colitas Sanas. Está prohibido copiarlos, 
          modificarlos o distribuirlos sin autorización.
        </p>

        <h3>10. Modificaciones de los T&C</h3>
        <p>
          Colitas Sanas podrá modificar los presentes T&C en cualquier momento. 
          Las versiones actualizadas estarán disponibles en la plataforma.
        </p>

        <h3>11. Legislación aplicable</h3>
        <p>
          Los presentes T&C se rigen por las leyes de la República del Perú. 
          Cualquier controversia será atendida en los tribunales competentes 
          según el domicilio del consumidor.
        </p>

        <button className="legal-btn" onClick={() => window.history.back()}>
          Volver
        </button>

      </div>
    </div>
  );
}
