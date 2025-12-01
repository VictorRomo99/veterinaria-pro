import { Routes, Route } from "react-router-dom";

import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";

// Landing
import Hero from "./components/landing/Hero";
import ServiciosDestacados from "./components/landing/ServiciosDestacados";
import EquipoDestacado from "./components/landing/EquipoDestacado";
import Testimonios from "./components/landing/Testimonios";

// Páginas completas
import Equipo from "./pages/equipo/Equipo";
import Contacto from "./pages/Contacto/Contacto";
import Servicios from "./pages/Servicios/Servicios";

// Auth
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ResetPassword from "./pages/auth/ResetPassword";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Forgot2FA from "./pages/auth/Forgot2FA";

// Reservas
import Reservar from "./pages/reservas/Reservar";
import MisCitas from "./pages/citas/MisCitas";
import MisMascotas from "./pages/mascotas/MisMascotas";

// Dashboards
import DashboardVet from "./pages/veterinario/DashboardVet";
import DashboardRecepcion from "./pages/recepcion/DashboardRecepcion";

// 🔐 Protección
import RoleProtectedRoute from "./pages/auth/RoleProtectedRoute";

// Panel Admin
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsuarios from "./pages/admin/AdminUsuarios";
import AdminCitas from "./pages/admin/AdminCitas";
import AdminAtenciones from "./pages/admin/AdminAtenciones";
import AdminProductos from "./pages/admin/AdminProductos";
import AdminStockBajo from "./pages/admin/AdminStockBajo";
import AdminCaja from "./pages/admin/AdminCaja";
import AdminMovimientosCaja from "./pages/admin/AdminMovimientosCaja";
import AdminReportes from "./pages/admin/AdminReportes";
import AdminConfig from "./pages/admin/AdminConfig";
import TerminosCondiciones from "./pages/legal/TerminosCondiciones";
import PoliticasPrivacidad from "./pages/legal/PoliticasPrivacidad";

export default function App() {
  return (
    <Routes>

      {/* 🏠 LANDING PAGE */}
      <Route
        path="/"
        element={
          <>
            <Navbar />
            <Hero />
            <ServiciosDestacados />
            <EquipoDestacado />
            <Testimonios />
            <Footer />
          </>
        }
      />

      {/* 🌐 RUTAS PÚBLICAS */}
      <Route
        path="/servicios"
        element={
          <>
            <Navbar />
            <Servicios />
            <Footer />
          </>
        }
      />

      <Route
        path="/equipo"
        element={
          <>
            <Navbar />
            <Equipo />
            <Footer />
          </>
        }
      />

      <Route
        path="/contacto"
        element={
          <>
            <Navbar />
            <Contacto />
            <Footer />
          </>
        }
      />

      <Route
        path="/reservar"
        element={
          <>
            <Navbar />
            <Reservar />
            <Footer />
          </>
        }
      />

      {/* 👤 RUTAS PROTEGIDAS DE CLIENTE / MÉDICO / RECEPCIÓN */}
      <Route
        path="/mis-citas"
        element={
          <RoleProtectedRoute roles={["cliente", "medico", "recepcionista", "admin"]}>
            <>
              <Navbar />
              <MisCitas />
              <Footer />
            </>
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/mis-mascotas"
        element={
          <RoleProtectedRoute roles={["cliente"]}>
            <>
              <Navbar />
              <MisMascotas />
              <Footer />
            </>
          </RoleProtectedRoute>
        }
      />

      {/* 🔐 AUTH */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/forgot-2fa" element={<Forgot2FA />} />
      <Route path="/legal/terminos" element={<TerminosCondiciones />} />
<Route path="/legal/privacidad" element={<PoliticasPrivacidad />} />

      {/* 👨‍⚕️ SOLO MÉDICOS */}
      <Route
        path="/dashboard-vet"
        element={
          <RoleProtectedRoute roles={["medico", "admin"]}>
            <DashboardVet />
          </RoleProtectedRoute>
        }
      />

      {/* 🧾 SOLO RECEPCIÓN */}
      <Route
        path="/recepcion"
        element={
          <RoleProtectedRoute roles={["recepcionista", "admin"]}>
            <DashboardRecepcion />
          </RoleProtectedRoute>
        }
      />

      {/* ================================
          🛡️ PANEL ADMIN (SOLO ADMIN)
      ================================= */}
      <Route
        path="/admin"
        element={
          <RoleProtectedRoute roles={["admin"]}>
            <AdminLayout />
          </RoleProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="usuarios" element={<AdminUsuarios />} />
        <Route path="citas" element={<AdminCitas />} />
        <Route path="atenciones" element={<AdminAtenciones />} />
        <Route path="productos" element={<AdminProductos />} />
        <Route path="stock-bajo" element={<AdminStockBajo />} />
        <Route path="caja" element={<AdminCaja />} />
        <Route path="movimientos-caja" element={<AdminMovimientosCaja />} />
        <Route path="reportes" element={<AdminReportes />} />
        <Route path="config" element={<AdminConfig />} />
      </Route>

    </Routes>
  );
}
