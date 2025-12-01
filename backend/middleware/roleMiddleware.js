// middleware/roleMiddleware.js

export function checkRole(...rolesPermitidos) {
  return (req, res, next) => {
    const usuario = req.usuario; // viene del authMiddleware

    if (!usuario) {
      return res.status(401).json({ msg: "No autenticado" });
    }

    if (!rolesPermitidos.includes(usuario.rol)) {
      return res.status(403).json({ msg: "Acceso denegado: Rol no autorizado" });
    }

    next();
  };
}
