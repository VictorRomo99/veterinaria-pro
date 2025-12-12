// ✅ HISTORIA CLINICA FORM — PRODUCCIÓN + PRECIO EDITABLE
import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "./HistoriaClinicaForm.css";

// ✅ URL REAL DEL BACKEND (Render)
const API = import.meta.env.VITE_API_URL;

export default function HistoriaClinicaForm({ mascota, onSaved }) {
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    tipoAtencion: "Consulta",
    motivoConsulta: "",
    anamnesis: "",
    signosSintomas: "",
    examenesRecomendados: "",
    examenesRealizados: "",
    diagnosticoPresuntivo: "",
    diagnosticoDefinitivo: "",
    planTratamiento: "",
    observaciones: "",
    temperatura: "",
    mucosas: "",
    frecuenciaResp: "",
    frecuenciaCard: "",
    pulso: "",
    tllc: "",
    deshidratacion: "",
    total: "",
    proximaDosis: "",
    notaDosis: "",
  });

  const [secciones, setSecciones] = useState({
    datosClinicos: true,
    diagnostico: false,
    fisiologicos: false,
    archivos: false,
    dosis: false,
  });

  const [archivos, setArchivos] = useState([]);
  const [archivosPreview, setArchivosPreview] = useState([]);

  // 💡 Precios sugeridos (NO obligatorios)
  const preciosSugeridos = {
    Vacunación: 50,
    Desparasitación: 40,
    Consulta: 60,
    Cirugía: 200,
    Emergencia: 100,
    Control: 0,
  };

  // ===================================================
  //  MANEJO DE CAMBIOS
  // ===================================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    // 🟢 Si cambia tipo de atención, sugerimos precio (editable)
    if (name === "tipoAtencion") {
      const sugerido = preciosSugeridos[value] ?? "";

      setForm((prev) => ({
        ...prev,
        tipoAtencion: value,
        total: prev.total === "" ? sugerido : prev.total, // 👈 NO pisa si el vet ya escribió
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleSeccion = (clave) => {
    setSecciones((prev) => ({ ...prev, [clave]: !prev[clave] }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setArchivos(files);

    setArchivosPreview(
      files.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
      }))
    );
  };

  // ===================================================
  //  SUBMIT
  // ===================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!mascota) {
      Swal.fire("Atención", "Selecciona una mascota primero.", "warning");
      return;
    }

    try {
      // 🟢 1. Crear historia clínica
      const { data } = await axios.post(
        `${API}/api/historias`,
        {
          mascotaId: mascota.id,
          ...form,
          total: form.total ? Number(form.total) : null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const historiaId = data.historia?.id;

      // 🟢 2. Subir archivos si existen
      if (archivos.length > 0 && historiaId) {
        const formData = new FormData();
        archivos.forEach((file) => formData.append("archivos", file));

        await axios.post(
          `${API}/api/archivos/historia/${historiaId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      Swal.fire("✅ Éxito", "Historia clínica registrada correctamente.", "success");

      // 🧹 Reset
      setForm({
        tipoAtencion: "Consulta",
        motivoConsulta: "",
        anamnesis: "",
        signosSintomas: "",
        examenesRecomendados: "",
        examenesRealizados: "",
        diagnosticoPresuntivo: "",
        diagnosticoDefinitivo: "",
        planTratamiento: "",
        observaciones: "",
        temperatura: "",
        mucosas: "",
        frecuenciaResp: "",
        frecuenciaCard: "",
        pulso: "",
        tllc: "",
        deshidratacion: "",
        total: "",
        proximaDosis: "",
        notaDosis: "",
      });

      setArchivos([]);
      setArchivosPreview([]);

      onSaved && onSaved();
    } catch (err) {
      console.error("❌ Error guardar historia:", err);
      Swal.fire(
        "Error",
        err.response?.data?.message || "No se pudo guardar la historia clínica.",
        "error"
      );
    }
  };

  const esVacunacion = form.tipoAtencion === "Vacunación";

  return (
    <form className="form-historia" onSubmit={handleSubmit}>
      <h3 className="section-title">
        🩺 Historia Clínica — <span>{mascota?.nombre}</span>
      </h3>

      {/* TIPO DE ATENCIÓN */}
      <div className="form-row">
        <label>Tipo de atención *</label>
        <select name="tipoAtencion" value={form.tipoAtencion} onChange={handleChange}>
          {Object.keys(preciosSugeridos).map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* TOTAL EDITABLE */}
      <div className="form-row">
        <label>Total (S/)</label>
        <input
          type="number"
          step="0.01"
          name="total"
          value={form.total}
          onChange={handleChange}
          placeholder="Ingrese el monto"
          required
        />
        <small className="hint">
          💡 Precio sugerido según atención, editable por el veterinario
        </small>
      </div>

      {/* TARJETA TOTAL */}
      <div className="tarjeta-total">
        💰 Total estimado:{" "}
        <strong>
          {form.total ? `S/ ${Number(form.total).toFixed(2)}` : "Sin definir"}
        </strong>
      </div>

      {/* DOSIS */}
      {esVacunacion && (
        <div className="seccion">
          <h4 onClick={() => toggleSeccion("dosis")}>💉 Próxima dosis</h4>
          {secciones.dosis && (
            <>
              <input
                type="date"
                name="proximaDosis"
                value={form.proximaDosis}
                onChange={handleChange}
                required
              />
              <textarea
                name="notaDosis"
                value={form.notaDosis}
                onChange={handleChange}
                placeholder="Indicaciones adicionales"
              />
            </>
          )}
        </div>
      )}

      <button type="submit" className="btn-guardar">
        💾 Guardar Historia
      </button>
    </form>
  );
}
