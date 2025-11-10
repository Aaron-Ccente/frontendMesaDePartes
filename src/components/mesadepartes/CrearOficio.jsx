import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { ComplementServices } from "../../services/complementService";
import { OficiosService } from "../../services/oficiosService";
import AsignacionPerito from "../ui/AsignacionPerito";
import { FormInput, FormSelect, FormSection } from "../../utils/FormComponents";
import ShowToast from "../ui/ShowToast";
import BoxIcon from "../../assets/icons/BoxIcon";
import SampleIcon from "../../assets/icons/SampleIcon";
import DepartmentIcon from "../../assets/icons/DepartmentIcon";

function CrearOficio() {
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1: Department Selection, 2: Exam Selection, 3: Main Form
  const [formData, setFormData] = useState({
    numeroOficio: "",
    fechaHora: "",
    fiscalia: "",
    regionSolicitante: "",
    implicado: "",
    dniImplicado: "",
    fiscal_remitente: "",
    id_tipos_examen: [],
    tipos_examen: [],
    muestra: "",
    id_especialidad_requerida: "",
    especialidad_requerida: "",
    id_usuario_perito_asignado: "",
    perito_asignado: "",
    cip_perito_asignado: "",
    estado: "CREACIÓN DE OFICIO",
    id_prioridad: "",
    asunto: "",
    celular: ""
  });

  const [codigo, setCodigo] = useState("");
  const [closeModal, setCloseModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [especialidades, setEspecialidades] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [tiposExamen, setTiposExamen] = useState([]);
  const [feedback, setFeedback] = useState(null);

  // --- LÓGICA DE CARGA DE DATOS INICIALES ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const [especialidadesRes, prioridadesRes] = await Promise.all([
          ComplementServices.getTiposDepartamento(),
          ComplementServices.getAllPriorities()
        ]);
        setPrioridades(Array.isArray(prioridadesRes?.data) ? prioridadesRes.data : []);
        // Filtrar los departamentos especiales que ya no se usarán en la UI principal
        const filteredEspecialidades = (especialidadesRes?.data || []).filter(
          (esp) => ![11, 12, 13].includes(esp.id_tipo_departamento)
        );
        setEspecialidades(Array.isArray(filteredEspecialidades) ? filteredEspecialidades : []);
      } catch (error) {
        console.log(error);
        setFeedback("Error al cargar datos iniciales. Verifique la conexión.");
      }
    };
    loadData();
  }, []);

  // --- PERSISTENCIA DE FORMULARIO (LOCAL STORAGE) ---
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("formDataCodigodeBarras", JSON.stringify(formData));
    }
  }, [formData, isInitialized]);

  useEffect(() => {
    const saved = localStorage.getItem("formDataCodigodeBarras");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({ ...prev, ...parsed }));
      } catch (e) { console.log(e); localStorage.removeItem("formDataCodigodeBarras"); }
    }
    setIsInitialized(true);
  }, []);

  // --- MANEJADORES DE CAMBIOS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePeritoSelect = (perito) => {
    if (perito) {
      setFormData(prev => ({
        ...prev,
        id_usuario_perito_asignado: perito.id_usuario,
        perito_asignado: perito.nombre_completo,
        cip_perito_asignado: perito.CIP
      }));
    }
  };

  const handleTipoExamenChange = (e) => {
    const { value, checked, name } = e.target;
    const examenId = parseInt(value);
    const examenNombre = name;

    setFormData(prev => {
      const new_id_tipos_examen = [...prev.id_tipos_examen];
      const new_tipos_examen = [...prev.tipos_examen];

      if (checked) {
        if (!new_id_tipos_examen.includes(examenId)) {
          new_id_tipos_examen.push(examenId);
          new_tipos_examen.push(examenNombre);
        }
      } else {
        const indexId = new_id_tipos_examen.indexOf(examenId);
        if (indexId > -1) new_id_tipos_examen.splice(indexId, 1);
        const indexName = new_tipos_examen.indexOf(examenNombre);
        if (indexName > -1) new_tipos_examen.splice(indexName, 1);
      }
      return { ...prev, id_tipos_examen: new_id_tipos_examen, tipos_examen: new_tipos_examen };
    });
  };

  // --- LÓGICA DE NAVEGACIÓN DEL ASISTENTE ---
  const handleDepartmentSelection = async (department) => {
    setFormData(prev => ({
      ...prev,
      id_especialidad_requerida: department.id_tipo_departamento,
      especialidad_requerida: department.nombre_departamento,
      id_tipos_examen: [],
      tipos_examen: [],
      id_usuario_perito_asignado: "",
      perito_asignado: "",
      cip_perito_asignado: ""
    }));
    try {
      const tiposRes = await ComplementServices.getTiposByDepartamento(department.id_tipo_departamento);
      setTiposExamen(tiposRes?.data || []);
    } catch (err) {
      console.error('Error cargando tipos de examen:', err);
      setTiposExamen([]);
    }
    setStep(2);
  };
  
  const handleContinueToMainForm = () => {
    if (formData.id_tipos_examen.length === 0) {
      setFeedback("Debe seleccionar al menos un tipo de examen.");
      return;
    }
    setStep(3);
  };

  const handleSubmit = async () => {
    // 1. Validaciones
    if (!formData.implicado || !formData.dniImplicado) {
        setFeedback("Error: El nombre y DNI del implicado son obligatorios.");
        return;
    }
    if (!formData.id_especialidad_requerida || !formData.id_usuario_perito_asignado || !formData.id_prioridad) {
        setFeedback("Error: Debe seleccionar especialidad, perito y prioridad.");
        return;
    }
    if (formData.id_tipos_examen.length === 0) {
        setFeedback("Error: Debe seleccionar al menos un tipo de examen.");
        return;
    }

    setFeedback("Procesando...");

    try {
      if (formData.numeroOficio) {
        const checkResp = await OficiosService.checkNumero(formData.numeroOficio);
        if (checkResp.exists) {
          setFeedback(`Error: Ya existe un oficio con el número ${formData.numeroOficio}`);
          return;
        }
      }

      const payload = { ...formData, creado_por: user.id_usuario, actualizado_por: user.id_usuario };
      const createResp = await OficiosService.createOficio(payload);

      if (createResp.success) {
        setFeedback("¡Oficio creado y asignado exitosamente!");
        const nuevoCodigo = createResp.data.numero_oficio || `ID-${createResp.data.id_oficio}`;
        setCodigo(nuevoCodigo);
        setCloseModal(true);
      } else {
        setFeedback(`Error del servidor: ${createResp.message}`);
      }
    } catch (err) {
      setFeedback(err?.message || "Error de conexión al intentar crear el oficio.");
      console.error(err);
    }
  };

  const handleReset = () => {
    setStep(1);
    setFormData({
        numeroOficio: "", fechaHora: "", fiscalia: "", regionSolicitante: "", implicado: "",
        dniImplicado: "", fiscal_remitente: "", id_tipos_examen: [], tipos_examen: [], muestra: "",
        id_especialidad_requerida: "", especialidad_requerida: "", id_usuario_perito_asignado: "", perito_asignado: "",
        cip_perito_asignado: "", estado: "CREACIÓN DE OFICIO", id_prioridad: "", asunto: "", celular: ""
    });
    setTiposExamen([]);
    localStorage.removeItem("formDataCodigodeBarras");
  }

  // --- RENDERIZADO DE PASOS ---

  const renderDepartmentSelection = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50 dark:bg-gray-900 p-4 rounded-lg shadow-inner">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Seleccione un Departamento</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-6xl">
        {especialidades.map(dep => (
          <button
            key={dep.id_tipo_departamento}
            onClick={() => handleDepartmentSelection(dep)}
            className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out transform hover:-translate-y-1 border-t-4 border-pnp-green-light"
          >
            <DepartmentIcon className="text-pnp-green-light dark:text-dark-pnp-green text-4xl mb-3 w-10 h-10" />
            <span className="text-base font-semibold text-gray-800 dark:text-gray-100 text-center">{dep.nombre_departamento}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderExamSelection = () => (
    <div className="flex flex-col bg-gray-50 dark:bg-gray-900 p-6 rounded-lg shadow-inner min-h-[60vh]">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
        Paso 2: Seleccione Tipos de Examen
      </h2>

      <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Departamento Seleccionado:</p>
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-50">{formData.especialidad_requerida}</p>
      </div>

      {tiposExamen.length > 0 ? (
        <div className="flex flex-col mb-6">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipos de Examen Disponibles</label>
          <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 max-h-60 overflow-y-auto shadow-sm">
            {tiposExamen.map(examen => (
              <div key={examen.id_tipo_de_examen} className="flex items-center py-1">
                <input
                  type="checkbox"
                  id={`examen-${examen.id_tipo_de_examen}`}
                  value={examen.id_tipo_de_examen}
                  name={examen.nombre}
                  checked={formData.id_tipos_examen.includes(examen.id_tipo_de_examen)}
                  onChange={handleTipoExamenChange}
                  className="h-4 w-4 rounded border-gray-300 text-pnp-green focus:ring-pnp-green-light dark:text-dark-pnp-green dark:focus:ring-dark-pnp-green-light"
                />
                <label htmlFor={`examen-${examen.id_tipo_de_examen}`} className="ml-3 block text-sm text-gray-900 dark:text-gray-100 cursor-pointer">
                  {examen.nombre}
                </label>
              </div>
            ))}
          </div>
          {formData.id_tipos_examen.length === 0 && (
            <p className="text-sm text-danger dark:text-danger mt-2">Debe seleccionar al menos un tipo de examen.</p>
          )}
        </div>
      ) : (
        <div className="text-center py-10">
            <p className="text-lg text-gray-500 dark:text-gray-400">No hay tipos de examen disponibles para este departamento.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">(Esto puede deberse a que no se han asignado exámenes a este departamento en la base de datos).</p>
        </div>
      )}

      <div className="flex justify-between mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setStep(1)}
          className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
        >
          Atrás
        </button>
        <button
          onClick={handleContinueToMainForm}
          disabled={formData.id_tipos_examen.length === 0}
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-pnp-green to-pnp-green-light text-white font-semibold hover:from-pnp-green-light hover:to-pnp-green transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuar
        </button>
      </div>
    </div>
  );

  const renderMainForm = () => (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg shadow-inner">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
          Paso 3: Detalles del Oficio y Asignación
        </h2>

        <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Departamento Seleccionado:</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">{formData.especialidad_requerida}</p>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipos de Examen Seleccionados:</p>
          <ul className="list-disc list-inside text-gray-900 dark:text-gray-100">
            {formData.tipos_examen.map((examen, index) => (
              <li key={index} className="text-base">{examen}</li>
            ))}
          </ul>
        </div>

        <FormSection title="Información de Encabezado (Opcional)">
            <FormInput label="Número de Oficio" name="numeroOficio" value={formData.numeroOficio} onChange={handleChange} />
            <FormInput label="Unidad Solicitante" name="fiscalia" value={formData.fiscalia} onChange={handleChange} />
            <FormInput label="Remitente" name="fiscal_remitente" value={formData.fiscal_remitente} onChange={handleChange} />
            <FormInput label="Región de la Fiscalía" name="regionSolicitante" value={formData.regionSolicitante} onChange={handleChange} />
        </FormSection>

        <FormSection title="Información del Implicado">
            <FormInput label="Nombre Completo" name="implicado" value={formData.implicado} onChange={handleChange} required />
            <FormInput label="DNI" name="dniImplicado" value={formData.dniImplicado} onChange={handleChange} required />
            <FormInput label="Fecha y Hora del Incidente" name="fechaHora" value={formData.fechaHora} onChange={handleChange} type="datetime-local" />
        </FormSection>

        <FormSection title="Información para Derivación">
            <FormInput label="Descripción de Muestra(s)" name="muestra" value={formData.muestra} onChange={handleChange} />
            
            <AsignacionPerito 
                idEspecialidad={formData.id_especialidad_requerida}
                onPeritoSelect={handlePeritoSelect}
                selectedPerito={{nombre_completo: formData.perito_asignado}}
            />

            <FormSelect label="Prioridad" name="id_prioridad" value={formData.id_prioridad} onChange={handleChange} required>
                <option value="">Seleccione prioridad</option>
                {prioridades.map(p => <option key={p.id_prioridad} value={p.id_prioridad}>{p.nombre_prioridad}</option>)}
            </FormSelect>
            <div className="md:col-span-2 lg:col-span-3">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Asunto</label>
                <textarea name="asunto" value={formData.asunto} onChange={handleChange} rows="3" className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white p-2 rounded-lg"></textarea>
            </div>
        </FormSection>

        <div className="flex gap-4 mt-8 justify-end border-t border-gray-200 dark:border-gray-700 pt-4">
            <button type="button" onClick={() => setStep(2)} className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200">
              Atrás
            </button>
            <button type="submit" className="px-6 py-2 rounded-lg bg-gradient-to-r from-pnp-green to-pnp-green-light text-white font-semibold hover:from-pnp-green-light hover:to-pnp-green transition-all duration-200">
              Crear y Generar Código
            </button>
        </div>
    </form>
  );

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      <h1 className="text-3xl font-extrabold text-center mb-8 text-gray-900 dark:text-white">Crear Nuevo Oficio</h1>
      
      {feedback && <ShowToast message={feedback} onClose={() => setFeedback(null)} />}

      {step === 1 && renderDepartmentSelection()}
      {step === 2 && renderExamSelection()}
      {step === 3 && renderMainForm()}

      {closeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl text-center max-w-md w-full">
            <h3 className="text-2xl font-bold text-success dark:text-success mb-4">¡Oficio Creado!</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">El oficio ha sido registrado exitosamente. Su código es:</p>
            <p className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8 break-all">{codigo}</p>
            <button
              onClick={() => { setCloseModal(false); handleReset(); }}
              className="bg-gradient-to-r from-success to-pnp-green-light text-white font-bold py-3 px-8 rounded-lg hover:from-pnp-green-light hover:to-success transition-all duration-200 shadow-lg"
            >
              Aceptar y Crear Nuevo Oficio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CrearOficio;
// Trivial comment to force re-processing
