// controllers/reniecController.js
import axios from "axios";

export const consultaDNI = async (req, res) => {
  const { dni } = req.params;

  try {
    const TOKEN = process.env.RENIEC_TOKEN;
    const url = `https://dniruc.apisperu.com/api/v1/dni/${dni}?token=${TOKEN}`;

    const { data } = await axios.get(url);

    if (!data?.dni) {
      return res.status(404).json({ message: "DNI no encontrado" });
    }

    res.json({
      dni: data.dni,
      nombres: data.nombres,
      apellidoPaterno: data.apellidoPaterno,
      apellidoMaterno: data.apellidoMaterno,
    });
  } catch (error) {
    console.error("Error consultando DNI:", error.message);
    res.status(500).json({ message: "Error al obtener datos del DNI" });
  }
};
