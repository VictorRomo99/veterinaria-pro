import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Login() {
  const navigate = useNavigate();

  // Estados
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [codigo2FA, setCodigo2FA] = useState("");
  const [qrCode, setQrCode] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tempUser, setTempUser] = useState(null);

  // Mantener sesión activa
  useEffect(() => {
    const token = localStorage.getItem("token");
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    if (token && usuario) {
      redirigirPorRol(usuario.rol);
    }
  }, []);

function redirigirPorRol(rol) {
  if (rol === "medico") navigate("/dashboard-vet");
  else if (rol === "admin") navigate("/admin/dashboard");
  else if (rol === "recepcionista") navigate("/recepcion");
  else navigate("/");
}


  // Paso 1 — Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${API}/api/auth/login`, {
        email,
        password,
      });

      setTempUser(res.data.usuario);

      if (res.data.mostrarQR && res.data.qrCode) {
        setQrCode(res.data.qrCode);
        setStep(2);
      } else if (res.data.requiere2FA) {
        setStep(3);
      } else {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("usuario", JSON.stringify(res.data.usuario));
        window.dispatchEvent(new Event("sessionChanged"));
        redirigirPorRol(res.data.usuario.rol);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Error al iniciar sesión. Intenta otra vez."
      );
    } finally {
      setLoading(false);
    }
  };

  // Paso 3 — Verificar 2FA
  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("/api/auth/verify-2fa", {
        email: tempUser.email,
        codigo: codigo2FA,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("usuario", JSON.stringify(res.data.usuario));
      window.dispatchEvent(new Event("sessionChanged"));
      redirigirPorRol(res.data.usuario.rol);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Código incorrecto. Intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContinuar = () => setStep(3);

  const handleReset2FA = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        "/api/auth/solicitar-reset-2fa",
        { email: tempUser?.email || email }
      );
      alert(res.data.message);
      setStep(1);
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Error al enviar el correo. Inténtalo nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>
          Bienvenido a <span>Colitas Sanas 🐶🐱</span>
        </h2>

        {/* PASO 1 */}
        {step === 1 && (
          <>
            <p>Inicia sesión para acceder a tu cuenta</p>

            <form onSubmit={handleLogin}>

              {/* EMAIL */}
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {/* CONTRASEÑA + OJO */}
              <div className="password-wrapper">
    <input
        type={showPassword ? "text" : "password"}
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="input-password"
    />

    <span
        className="password-toggle"
        onClick={() => setShowPassword(!showPassword)}
    >
        {showPassword ? <FaEye /> : <FaEyeSlash />}
    </span>
</div>


              {error && <p className="error">{error}</p>}

              <button type="submit" disabled={loading}>
                {loading ? "Verificando..." : "Iniciar sesión"}
              </button>
            </form>

            <div className="extra-links">
              <Link to="/forgot-password" className="forgot-link">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <p className="register-text">
              ¿No tienes cuenta?{" "}
              <Link to="/register" className="register-link">
                Regístrate aquí
              </Link>
            </p>
          </>
        )}

        {/* PASO 2 */}
        {step === 2 && (
          <>
            <p>📱 Escanea este código QR con Google Authenticator o Authy</p>
            <img src={qrCode} alt="Código QR 2FA" width="220" />
            <button onClick={handleContinuar} className="continue-btn">
              Ya lo escaneé
            </button>
          </>
        )}

        {/* PASO 3 */}
        {step === 3 && (
          <>
            <p>Ingresa tu código de verificación 2FA</p>

            <form onSubmit={handleVerify2FA}>
              <input
                type="text"
                placeholder="Código 2FA"
                value={codigo2FA}
                onChange={(e) => setCodigo2FA(e.target.value)}
                maxLength="6"
                required
              />

              {error && <p className="error">{error}</p>}

              <button type="submit" disabled={loading}>
                {loading ? "Verificando..." : "Verificar Código"}
              </button>
            </form>

            <div className="extra-links">
              <button type="button" className="back-button" onClick={() => setStep(1)}>
                ← Volver al inicio
              </button>

              <button type="button" className="forgot-2fa" onClick={() => setStep(4)}>
                ¿Perdiste acceso a tu app 2FA?
              </button>
            </div>
          </>
        )}

        {/* PASO 4 */}
        {step === 4 && (
          <>
            <p>🔐 Restablecer autenticación 2FA</p>

            <form onSubmit={handleReset2FA}>
              <button type="submit" disabled={loading}>
                {loading ? "Enviando..." : "Enviar correo"}
              </button>
            </form>

            <button className="back-button" onClick={() => setStep(3)}>
              ← Volver
            </button>
          </>
        )}
      </div>
    </div>
  );
}
