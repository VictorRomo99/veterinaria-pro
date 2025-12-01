// src/pages/admin/AdminUsuarios.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "./AdminUsuarios.css";

const API = import.meta.env.VITE_API_URL;


export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);

  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const token = localStorage.getItem("token");

  // ======================================================
  // CARGAR USUARIOS
  // ======================================================
  const cargarUsuarios = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/usuarios`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // si no hay estado en BD → asignamos "activo" por defecto
      const usuariosLimpios = res.data.map((u) => ({
        ...u,
        estado: u.estado || "activo",
      }));

      setUsuarios(usuariosLimpios);
      setUsuariosFiltrados(usuariosLimpios);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // BUSQUEDA + FILTROS
  // ======================================================
  useEffect(() => {
    let data = [...usuarios];

    // filtro por texto
    if (busqueda.trim() !== "") {
      data = data.filter((u) =>
        `${u.nombre} ${u.apellido} ${u.email}`
          .toLowerCase()
          .includes(busqueda.toLowerCase())
      );
    }

    // filtro por rol
    if (filtroRol !== "todos") {
      data = data.filter((u) => u.rol === filtroRol);
    }

    // filtro por estado
    if (filtroEstado !== "todos") {
      data = data.filter((u) => u.estado === filtroEstado);
    }

    setUsuariosFiltrados(data);
  }, [busqueda, filtroRol, filtroEstado, usuarios]);

  // ======================================================
  // CAMBIAR ROL (con confirmación PRO)
  // ======================================================
  const cambiarRol = async (id, nuevoRol, nombre) => {
    const confirm = await Swal.fire({
      title: "¿Cambiar rol?",
      html: `¿Deseas cambiar el rol de <b>${nombre}</b> a <b>${nuevoRol.toUpperCase()}</b>?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#157347",
      cancelButtonColor: "#dc3545",
      confirmButtonText: "Sí, cambiar",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.put(
        `${API}/api/admin/usuarios/${id}/rol`,
        { rol: nuevoRol },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("Rol actualizado", "El rol se actualizó correctamente", "success");
      cargarUsuarios();
    } catch (error) {
      Swal.fire("Error", "No se pudo actualizar el rol", "error");
      console.error("Error cambiando rol:", error);
    }
  };

  // ======================================================
  // CAMBIAR ESTADO
  // ======================================================
  const cambiarEstado = async (id, estado, nombre) => {
    const action = estado === "activo" ? "Activar" : "Desactivar";

    const confirm = await Swal.fire({
      title: `${action} usuario`,
      html: `¿Seguro que deseas <b>${action.toLowerCase()}</b> al usuario <b>${nombre}</b>?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0d6efd",
      cancelButtonColor: "#dc3545",
      confirmButtonText: action,
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.put(
        `${API}/api/admin/usuarios/${id}/estado`,
        { estado },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("Estado actualizado", "", "success");
      cargarUsuarios();
    } catch (error) {
      Swal.fire("Error", "No se pudo actualizar el estado", "error");
      console.error("Error cambiando estado:", error);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  // ======================================================
  // UI PRINCIPAL
  // ======================================================
  if (loading) return <p>Cargando usuarios...</p>;

  return (
    <div className="admin-card">

      <h2 className="admin-title">👥 Gestión de Usuarios</h2>

      {/* === BUSCADOR Y FILTROS === */}
      <div className="usuarios-filtros">
        <input
          type="text"
          className="input-busqueda"
          placeholder="Buscar usuario por nombre, email..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <select
          className="filtro-select"
          value={filtroRol}
          onChange={(e) => setFiltroRol(e.target.value)}
        >
          <option value="todos">Todos los roles</option>
          <option value="cliente">Cliente</option>
          <option value="recepcionista">Recepcionista</option>
          <option value="medico">Médico</option>
          <option value="admin">Admin</option>
        </select>

        <select
          className="filtro-select"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="todos">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
      </div>

      {/* === TABLA === */}
      {usuariosFiltrados.length === 0 ? (
        <p className="empty-msg">No se encontraron usuarios.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {usuariosFiltrados.map((user) => (
              <tr key={user.id}>
                <td className="col-usuario">
                  <div className="avatar">{user.nombre[0]}</div>
                  <span>{user.nombre} {user.apellido}</span>
                </td>

                <td>{user.email}</td>

                {/* CAMBIO DE ROL */}
                <td>
                  <select
                    value={user.rol}
                    className="select-rol"
                    onChange={(e) =>
                      cambiarRol(user.id, e.target.value, user.nombre)
                    }
                  >
                    <option value="cliente">Cliente</option>
                    <option value="recepcionista">Recepcionista</option>
                    <option value="medico">Médico</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>

                {/* ESTADO */}
                <td>
                  <span
                    className={
                      user.estado === "activo"
                        ? "estado-badge activo"
                        : "estado-badge inactivo"
                    }
                  >
                    {user.estado}
                  </span>
                </td>

                {/* ACCIONES */}
                <td>
                  {user.estado === "activo" ? (
                    <button
                      className="btn-inactivar"
                      onClick={() =>
                        cambiarEstado(user.id, "inactivo", user.nombre)
                      }
                    >
                      Desactivar
                    </button>
                  ) : (
                    <button
                      className="btn-activar"
                      onClick={() =>
                        cambiarEstado(user.id, "activo", user.nombre)
                      }
                    >
                      Activar
                    </button>
                  )}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
