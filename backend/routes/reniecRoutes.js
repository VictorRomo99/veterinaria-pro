import express from "express";
import { consultarDNI } from "../utils/consultaReniec.js";
import { consultaDNI } from "../controllers/reniecController.js";

const router = express.Router();

router.get("/:dni", async (req, res) => {
  const { dni } = req.params;

  if (!dni || dni.length !== 8) {
    return res.status(400).json({ mensaje: "DNI inválido" });
  }

  const datos = await consultarDNI(dni);
  if (!datos) {
    return res.status(404).json({ mensaje: "No se encontraron datos para ese DNI" });
  }

  res.json({
    dni: datos.dni,
    nombres: datos.nombres,
    apellidoPaterno: datos.apellidoPaterno,
    apellidoMaterno: datos.apellidoMaterno,
  });
  // GET /api/reniec/:dni
router.get("/:dni", consultaDNI);
  
});

export default router;
