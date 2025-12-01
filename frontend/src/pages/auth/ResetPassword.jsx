import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ResetPassword.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:4000/api/auth/reset-password",
        { token, password }
      );

      setMensaje(res.data.message || "Contraseña restablecida correctamente.");

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Error al restablecer la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-card">
        <h2>Restablecer contraseña 🔒</h2>
        <p>Ingresa tu nueva contraseña para acceder nuevamente.</p>

        <form onSubmit={handleSubmit}>
          {/* Input 1 */}
          <div className="reset-input-group">
            <input
              type={showPass1 ? "text" : "password"}
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="toggle-icon"
              onClick={() => setShowPass1(!showPass1)}
            >
              {showPass1 ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Input 2 */}
          <div className="reset-input-group">
            <input
              type={showPass2 ? "text" : "password"}
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <span
              className="toggle-icon"
              onClick={() => setShowPass2(!showPass2)}
            >
              {showPass2 ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {error && <p className="reset-error">{error}</p>}
          {mensaje && <p className="reset-success">{mensaje}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Restablecer contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}
