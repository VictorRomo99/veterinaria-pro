// src/components/auth/RoleProtectedRoute.jsx
import { Navigate } from "react-router-dom";

export default function RoleProtectedRoute({ roles, children }) {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  // Si no existe → NO LOGUEADO → mandar a login
  if (!usuario) return <Navigate to="/login" replace />;

  // Si existe pero su rol NO está permitido → mandar a inicio normal
  if (!roles.includes(usuario.rol)) return <Navigate to="/" replace />;

  // Si todo bien → permitir entrar
  return children;
}
