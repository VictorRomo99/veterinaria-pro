import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import ArchivoClinico from "../models/ArchivoClinico.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📌 Subir a backend/uploads/archivos_clinicos
const uploadDir = path.join(__dirname, "..", "uploads", "archivos_clinicos");

// Crear carpeta si no existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📂 Carpeta creada:", uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

export const upload = multer({ storage });

// 📤 Subir archivos
export const subirArchivosHistoria = async (req, res) => {
  try {
    const { historiaId } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No se subieron archivos." });
    }

    const archivosGuardados = await Promise.all(
      req.files.map((file) =>
        ArchivoClinico.create({
          historiaId,
          nombreArchivo: file.filename,
          tipo: file.mimetype,
          urlArchivo: `/uploads/archivos_clinicos/${file.filename}`,
        })
      )
    );

    res.status(200).json({
      message: "Archivos subidos correctamente.",
      archivos: archivosGuardados,
    });
  } catch (error) {
    console.error("❌ Error subiendo archivos:", error);
    res.status(500).json({ message: "Error al subir archivos." });
  }
};

// 📂 Obtener archivos
export const obtenerArchivosPorHistoria = async (req, res) => {
  try {
    const { historiaId } = req.params;
    const archivos = await ArchivoClinico.findAll({ where: { historiaId } });
    res.json(archivos);
  } catch (error) {
    console.error("❌ Error obteniendo archivos:", error);
    res.status(500).json({ message: "Error al obtener archivos." });
  }
};
