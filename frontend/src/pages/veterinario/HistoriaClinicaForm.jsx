// ✅ HISTORIA CLINICA FORM — COMPLETO + PRECIO EDITABLE (FINAL)
import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "./HistoriaClinicaForm.css";

// ✅ BACKEND REAL (Render)
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

  // 💡 Precios sugeridos (EDITABLES)
  const preciosBase = {
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

    // 🟢 Cambia tipo de atención → sugiere precio
    if (name === "tipoAtencion") {
      const sugerido = preciosBase[value] ?? "";

      setForm((prev) => ({
        ...prev,
        tipoAtencion: value,
        total: prev.total === "" ? sugerido : prev.total,
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
      // 🟢 Crear historia clínica
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

      // 🟢 Subir archivos
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

      // Reset
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

  const esConsulta = form.tipoAtencion === "Consulta";
  const esCirugia = form.tipoAtencion === "Cirugía";
  const esEmergencia = form.tipoAtencion === "Emergencia";
  const esControl = form.tipoAtencion === "Control";
  const esVacunacion = form.tipoAtencion === "Vacunación";
  const esDesparasitacion = form.tipoAtencion === "Desparasitación";

  /* ===================================================
     JSX — TODO EL FORMULARIO (SIN CAMBIOS VISUALES)
     =================================================== */

  // 🔽 AQUÍ VA EXACTAMENTE EL MISMO JSX QUE YA TENÍAS
  // 🔽 (datos clínicos, diagnóstico, fisiológicos, archivos, dosis, etc.)
  // 🔽 NO LO CAMBIAMOS PORQUE YA FUNCIONA Y LO CONOCES

  return (
    <form className="form-historia" onSubmit={handleSubmit}>
      <h3 className="section-title">
        🩺 Historia Clínica — <span>{mascota?.nombre}</span>
      </h3>

      {/* Tipo de atención */}
      <div className="form-row">
        <label>Tipo de atención *</label>
        <select
          name="tipoAtencion"
          value={form.tipoAtencion}
          onChange={handleChange}
          required
        >
          <option value="Consulta">Consulta</option>
          <option value="Vacunación">Vacunación</option>
          <option value="Desparasitación">Desparasitación</option>
          <option value="Control">Control</option>
          <option value="Cirugía">Cirugía</option>
          <option value="Emergencia">Emergencia</option>
        </select>
      </div>

      {/* DATOS CLÍNICOS */}
      <div className="seccion">
        <h4 onClick={() => toggleSeccion("datosClinicos")}>
          <span>📋 Datos Clínicos</span>
          <span className={secciones.datosClinicos ? "open" : ""}>▶</span>
        </h4>

        {secciones.datosClinicos && (
          <>
            <div className="form-row">
              <label>Motivo de consulta *</label>
              <input
                name="motivoConsulta"
                value={form.motivoConsulta}
                onChange={handleChange}
                required
              />
            </div>

            {(esConsulta || esCirugia || esEmergencia) && (
              <div className="form-row">
                <label>Anamnesis</label>
                <textarea
                  name="anamnesis"
                  value={form.anamnesis}
                  onChange={handleChange}
                />
              </div>
            )}

            {(esConsulta || esCirugia || esEmergencia || esControl) && (
              <div className="form-row">
                <label>Signos y síntomas</label>
                <textarea
                  name="signosSintomas"
                  value={form.signosSintomas}
                  onChange={handleChange}
                />
              </div>
            )}

            <div className="form-row">
              <label>Observaciones</label>
              <textarea
                name="observaciones"
                value={form.observaciones}
                onChange={handleChange}
              />
            </div>
          </>
        )}
      </div>

      {/* DIAGNÓSTICO */}
      {(esConsulta ||
        esCirugia ||
        esEmergencia ||
        esVacunacion ||
        esDesparasitacion ||
        esControl) && (
        <div className="seccion">
          <h4 onClick={() => toggleSeccion("diagnostico")}>
            <span>💊 Diagnóstico y Tratamiento</span>
            <span className={secciones.diagnostico ? "open" : ""}>▶</span>
          </h4>

          {secciones.diagnostico && (
            <>
              {(esConsulta || esCirugia || esControl) && (
                <div className="grid-2">
                  <div className="form-row">
                    <label>Exámenes recomendados</label>
                    <textarea
                      name="examenesRecomendados"
                      value={form.examenesRecomendados}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-row">
                    <label>Exámenes realizados</label>
                    <textarea
                      name="examenesRealizados"
                      value={form.examenesRealizados}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              {(esConsulta || esCirugia) && (
                <div className="grid-2">
                  <div className="form-row">
                    <label>Diagnóstico presuntivo *</label>
                    <textarea
                      name="diagnosticoPresuntivo"
                      value={form.diagnosticoPresuntivo}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <label>Diagnóstico definitivo</label>
                    <textarea
                      name="diagnosticoDefinitivo"
                      value={form.diagnosticoDefinitivo}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              <div className="form-row">
                <label>Plan / Tratamiento *</label>
                <textarea
                  name="planTratamiento"
                  value={form.planTratamiento}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* FISIOLÓGICOS */}
      {(esConsulta || esControl || esCirugia || esEmergencia) && (
        <div className="seccion">
          <h4 onClick={() => toggleSeccion("fisiologicos")}>
            <span>❤️ Constantes Fisiológicas</span>
            <span className={secciones.fisiologicos ? "open" : ""}>▶</span>
          </h4>

          {secciones.fisiologicos && (
            <>
              <div className="grid-3">
                <div className="form-row">
                  <label>Temperatura</label>
                  <input
                    name="temperatura"
                    value={form.temperatura}
                    onChange={handleChange}
                    placeholder="°C"
                  />
                </div>

                <div className="form-row">
                  <label>Mucosas</label>
                  <input
                    name="mucosas"
                    value={form.mucosas}
                    onChange={handleChange}
                    placeholder="Rosadas / Pálidas"
                  />
                </div>

                <div className="form-row">
                  <label>Frecuencia respiratoria</label>
                  <input
                    name="frecuenciaResp"
                    value={form.frecuenciaResp}
                    onChange={handleChange}
                    placeholder="rpm"
                  />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-row">
                  <label>Frecuencia cardiaca</label>
                  <input
                    name="frecuenciaCard"
                    value={form.frecuenciaCard}
                    onChange={handleChange}
                    placeholder="lpm"
                  />
                </div>

                <div className="form-row">
                  <label>Pulso</label>
                  <input
                    name="pulso"
                    value={form.pulso}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-row">
                  <label>TLLC</label>
                  <input
                    name="tllc"
                    value={form.tllc}
                    onChange={handleChange}
                    placeholder="seg"
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-row">
                  <label>Deshidratación</label>
                  <input
                    name="deshidratacion"
                    value={form.deshidratacion}
                    onChange={handleChange}
                    placeholder="%"
                  />
                </div>

                <div className="form-row">
                  <label>Total (S/)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="total"
                    value={form.total}
                    onChange={handleChange}
                    placeholder="Ej. 45.00"
                    required
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ARCHIVOS */}
      <div className="seccion">
        <h4 onClick={() => toggleSeccion("archivos")}>
          <span>📎 Archivos adjuntos</span>
          <span className={secciones.archivos ? "open" : ""}>▶</span>
        </h4>

        {secciones.archivos && (
          <>
            <input
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileChange}
            />

            <div className="archivos-preview">
              {archivosPreview.map((a, i) => (
                <div key={i} className="archivo-item">
                  {a.type.includes("image") ? (
                    <img src={a.url} alt={a.name} className="mini-preview" />
                  ) : (
                    <p>📄 {a.name}</p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* TARJETA TOTAL */}
      <div className="tarjeta-total">
        <p>
          💰 <strong>Total estimado:</strong>{" "}
          <span className={form.total ? "monto-activo" : "monto-vacio"}>
            {form.total ? `S/ ${parseFloat(form.total).toFixed(2)}` : "Sin definir"}
          </span>
        </p>
      </div>

      {/* DOSIS */}
      {esVacunacion && (
        <div className="seccion">
          <h4 onClick={() => toggleSeccion("dosis")}>
            <span>💉 Próxima dosis</span>
            <span className={secciones.dosis ? "open" : ""}>▶</span>
          </h4>

          {secciones.dosis && (
            <>
              <div className="form-row">
                <label>Fecha de próxima dosis *</label>
                <input
                  type="date"
                  name="proximaDosis"
                  value={form.proximaDosis}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <label>Notas adicionales</label>
                <textarea
                  name="notaDosis"
                  value={form.notaDosis}
                  onChange={handleChange}
                  placeholder="Ej. volver en 21 días, llevar carnet…"
                />
              </div>
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
