import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./Register.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

// 🔥 MODALES
import LegalModal from "../legal/LegalModal";
import "../legal/LegalModal.css";
import PoliticasPrivacidad from "../legal/PoliticasPrivacidad";
import TerminosCondiciones from "../legal/TerminosCondiciones";


export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    email: "",
    password: "",
    fechaNacimiento: "",
    celular: "",
    direccion: "",
    autorizacionDatos: false,
    aceptaPoliticas: false,
    rol: "cliente",
  });

  const [loading, setLoading] = useState(false);
  const [buscandoDni, setBuscandoDni] = useState(false);
  const [fechaBloqueada, setFechaBloqueada] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  // 📌 Estados de modales
  const [showPrivacidad, setShowPrivacidad] = useState(false);
  const [showTerminos, setShowTerminos] = useState(false);

  // 📅 Calcular edad
  const calcularEdad = (fechaNacimiento) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return edad;
  };

  // 🎯 Manejar cambios
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "fechaNacimiento" && value) {
      const edad = calcularEdad(value);
      if (edad < 18) {
        Swal.fire({
          icon: "warning",
          title: "Edad no permitida",
          text: "Debes ser mayor de 18 años para registrarte en Colitas Sanas.",
          confirmButtonColor: "#e74c3c",
        });
        setFormData((prev) => ({ ...prev, fechaNacimiento: "" }));
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 🔍 Buscar DNI en RENIEC
  const handleBuscarDNI = async () => {
    if (formData.dni.length !== 8) {
      Swal.fire({
        icon: "warning",
        title: "DNI inválido",
        text: "El DNI debe tener 8 dígitos.",
      });
      return;
    }

    try {
      setBuscandoDni(true);
      const res = await axios.get(`${API}/api/reniec/${formData.dni}`);
      const { nombres, apellidoPaterno, apellidoMaterno, fechaNacimiento } = res.data;

      if (!nombres) {
        Swal.fire({
          icon: "error",
          title: "No se encontró el DNI",
          text: "Verifica que el número sea correcto.",
        });
        return;
      }

      let fechaISO = "";
      if (fechaNacimiento) {
        const [d, m, y] = fechaNacimiento.split("/");
        fechaISO = `${y}-${m}-${d}`;
        const edad = calcularEdad(fechaISO);

        if (edad < 18) {
          Swal.fire({
            icon: "error",
            title: "Registro no permitido",
            text: "Solo los usuarios mayores de 18 años pueden registrarse en Colitas Sanas.",
          });
          return;
        }

        setFechaBloqueada(true);
      } else {
        Swal.fire({
          icon: "info",
          title: "Fecha no disponible",
          text: "RENIEC no devolvió la fecha. Ingrésala manualmente.",
        });
        setFechaBloqueada(false);
      }

      setFormData((prev) => ({
        ...prev,
        nombre: nombres.trim(),
        apellido: `${apellidoPaterno || ""} ${apellidoMaterno || ""}`.trim(),
        fechaNacimiento: fechaISO,
      }));

      Swal.fire({
        icon: "success",
        title: "Datos encontrados",
        text: "Información verificada correctamente.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error al buscar DNI",
        text: "No se pudo obtener los datos desde RENIEC.",
      });
    } finally {
      setBuscandoDni(false);
    }
  };

  // 📨 Enviar form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.autorizacionDatos || !formData.aceptaPoliticas) {
      Swal.fire({
        icon: "warning",
        title: "Faltan autorizaciones",
        text: "Debes aceptar el tratamiento de datos y las políticas.",
      });
      return;
    }

    if (
      !formData.nombre ||
      !formData.apellido ||
      !formData.dni ||
      !formData.email ||
      !formData.password ||
      !formData.fechaNacimiento
    ) {
      Swal.fire({
        icon: "error",
        title: "Campos incompletos",
        text: "Todos los campos son obligatorios.",
      });
      return;
    }

    const edad = calcularEdad(formData.fechaNacimiento);
    if (edad < 18) {
      Swal.fire({
        icon: "error",
        title: "Edad no permitida",
        text: "Debes ser mayor de 18 años.",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/auth/register`, formData);

      Swal.fire({
        icon: "success",
        title: "Registro exitoso 🐾",
        text: res.data.message || "Tu cuenta ha sido creada correctamente.",
        confirmButtonColor: "#2dc285",
      });

      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error al registrar",
        text:
          err.response?.data?.message ||
          "No se pudo completar el registro.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>
          Crear cuenta en <span>Colitas Sanas 🐾</span>
        </h2>
        <p>Completa tus datos para registrarte</p>

        <form onSubmit={handleSubmit}>
          
          {/* DNI */}
          <div className="dni-row">
            <input
              type="text"
              name="dni"
              placeholder="DNI"
              maxLength="8"
              value={formData.dni}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="btn-buscar-dni"
              onClick={handleBuscarDNI}
              disabled={buscandoDni}
            >
              {buscandoDni ? "Buscando..." : "Buscar"}
            </button>
          </div>

          {/* Nombre y apellido */}
          <div className="form-group">
            <input type="text" name="nombre" placeholder="Nombre" value={formData.nombre} readOnly />
            <input type="text" name="apellido" placeholder="Apellido" value={formData.apellido} readOnly />
          </div>

          {/* Fecha nacimiento */}
          <input
            type="date"
            name="fechaNacimiento"
            value={formData.fechaNacimiento}
            onChange={handleChange}
            required
            readOnly={fechaBloqueada}
          />
          <small className="info-text">
            {fechaBloqueada
              ? "📅 Fecha verificada desde RENIEC."
              : "📅 Ingresa tu fecha de nacimiento."}
          </small>

          {/* Celular y dirección */}
          <input
            type="text"
            name="celular"
            placeholder="Número de celular"
            value={formData.celular}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="direccion"
            placeholder="Dirección (opcional)"
            value={formData.direccion}
            onChange={handleChange}
          />

          {/* Email y contraseña */}
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={handleChange}
            required
          />
         <div className="password-wrapper">
  <input
    type={showPassword ? "text" : "password"}
    name="password"
    placeholder="Contraseña"
    value={formData.password}
    onChange={handleChange}
    autoComplete="new-password"
    required
  />

  {showPassword ? (
  <FaEye className="toggle-password" onClick={() => setShowPassword(false)} />
) : (
  <FaEyeSlash className="toggle-password" onClick={() => setShowPassword(true)} />
)}

</div>



          {/* Casillas de autorización */}
          <div className="checkbox-group">

  {/* Autorización de datos */}
  <div className="checkbox-item">
    <label>
      <input
        type="checkbox"
        name="autorizacionDatos"
        checked={formData.autorizacionDatos}
        onChange={handleChange}
      />
      Autorizo el{" "}
    </label>

    <span
      className="legal-link"
      onClick={(e) => {
        e.stopPropagation();
        setShowPrivacidad(true);
      }}
    >
      tratamiento de mis datos personales
    </span>
  </div>

  {/* Términos y condiciones */}
  <div className="checkbox-item">
    <label>
      <input
        type="checkbox"
        name="aceptaPoliticas"
        checked={formData.aceptaPoliticas}
        onChange={handleChange}
      />
      Acepto los{" "}
    </label>

    <span
      className="legal-link"
      onClick={(e) => {
        e.stopPropagation();
        setShowTerminos(true);
      }}
    >
      términos y condiciones y políticas de privacidad
    </span>
  </div>

</div>





          <button type="submit" disabled={loading}>
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <p className="register-text">
          ¿Ya tienes una cuenta?{" "}
          <Link to="/login" className="register-link">
            Inicia sesión aquí
          </Link>
        </p>
      </div>

      {/* 🟢 MODAL PRIVACIDAD */}
      <LegalModal
        open={showPrivacidad}
        onClose={() => setShowPrivacidad(false)}
        title="Políticas de Privacidad"
      >
        <PoliticasPrivacidad />
      </LegalModal>

      {/* 🔵 MODAL TÉRMINOS */}
      <LegalModal
        open={showTerminos}
        onClose={() => setShowTerminos(false)}
        title="Términos y Condiciones"
      >
        <TerminosCondiciones />
      </LegalModal>

    </div>
  );
}
