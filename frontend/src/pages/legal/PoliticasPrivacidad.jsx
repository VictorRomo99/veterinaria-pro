// src/pages/legal/PoliticaDatosPersonales.jsx
import "./Legal.css";

export default function PoliticaDatosPersonales() {
  return (
    <div className="legal-container">
      <div className="legal-card">

        <h2>🔒 Política de Protección de Datos Personales — Colitas Sanas</h2>

        <p>
          En cumplimiento de la <strong>Ley N° 29733 – Ley de Protección de Datos Personales</strong>
          y su Reglamento aprobado por el Decreto Supremo N.° 016-2024-JUS, 
          Colitas Sanas E.I.R.L. informa a los usuarios lo siguiente:
        </p>

        <h3>1. Identidad del titular del banco de datos</h3>
        <p>
          El responsable del banco de datos es <strong>Colitas Sanas E.I.R.L.</strong>, 
          con domicilio legal en Lima, Perú. El banco de datos “Clientes y Propietarios 
          de Mascotas” se encuentra inscrito en la Autoridad Nacional de Protección 
          de Datos Personales.
        </p>

        <h3>2. Datos personales recopilados</h3>
        <p>Podemos recolectar:</p>
        <ul>
          <li>Nombres, apellidos, DNI, fecha de nacimiento.</li>
          <li>Correo electrónico, teléfono y dirección.</li>
          <li>Datos sobre mascotas, historial clínico y servicios recibidos.</li>
          <li>Datos de navegación, IP y actividad dentro del Sitio.</li>
        </ul>

        <h3>3. Finalidades del tratamiento</h3>
        <p>Los datos serán utilizados para:</p>
        <ul>
          <li>Registrar usuarios y gestionar cuentas.</li>
          <li>Coordinar y confirmar citas veterinarias.</li>
          <li>Emitir comprobantes electrónicos.</li>
          <li>Registrar diagnósticos, tratamientos y evolución de mascotas.</li>
          <li>Enviar recordatorios, avisos y comunicaciones del servicio.</li>
          <li>Realizar análisis estadístico y mejora continua del sistema.</li>
          <li>Verificar identidad mediante RENIEC u otras entidades.</li>
        </ul>

        <p>
          La falta de consentimiento impedirá la creación de la cuenta y el 
          acceso a los servicios digitales.
        </p>

        <h3>4. Conservación y seguridad</h3>
        <p>
          Los datos se conservarán mientras dure la relación con el usuario o 
          hasta que este solicite la revocación. Colitas Sanas aplica medidas 
          organizativas y tecnológicas para proteger la información.
        </p>

        <h3>5. Transferencias y encargados de tratamiento</h3>
        <p>
          Colitas Sanas podrá recurrir a proveedores tecnológicos (hosting, 
          mensajería, verificación, servidores cloud) que actúan como encargados 
          de tratamiento, los cuales cumplen la normativa peruana.
        </p>

        <h3>6. Derechos ARCO</h3>
        <p>
          El usuario podrá ejercer sus derechos de acceso, rectificación, 
          cancelación, oposición, portabilidad y revocación escribiendo a:
        </p>
        <p><strong>datos@colitassanas.com.pe</strong></p>

        <h3>7. Divulgación por mandato legal</h3>
        <p>
          Colitas Sanas podrá revelar datos personales en cumplimiento de 
          mandatos judiciales, administrativos o policiales.
        </p>

        <h3>8. Uso de cookies</h3>
        <p>
          Este sitio utiliza cookies para mejorar la experiencia del usuario, 
          analizar la navegación y personalizar contenido.
        </p>

        <h3>9. Modificaciones</h3>
        <p>
          Colitas Sanas podrá actualizar esta Política de Datos Personales en 
          cualquier momento. La versión vigente será publicada en el Sitio.
        </p>

        <button className="legal-btn" onClick={() => window.history.back()}>
          Volver
        </button>

      </div>
    </div>
  );
}
