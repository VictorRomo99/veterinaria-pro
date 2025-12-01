import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Forgot2FA.css";

export default function Forgot2FA() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("/api/auth/solicitar-reset-2fa", {
        email,
      });
      setMensaje(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Error al enviar el correo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot2fa-container">
      <div className="forgot2fa-card">
        <h2>🔐 Restablecer autenticación 2FA</h2>
        <p>Si perdiste acceso a tu app de autenticación, te enviaremos un correo para regenerar tu QR.</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && <p className="error">{error}</p>}
          {mensaje && <p className="success">{mensaje}</p>}
          <button type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Enviar correo"}
          </button>
        </form>

        <p className="register-text">
          <Link to="/login" className="register-link">
            ← Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </div>
  );
}