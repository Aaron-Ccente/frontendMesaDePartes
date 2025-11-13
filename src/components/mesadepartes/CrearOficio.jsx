import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { ComplementServices } from "../../services/complementService";
import { OficiosService } from "../../services/oficiosService";
import AsignacionPerito from "../ui/AsignacionPerito";
import { FormInput, FormSelect, FormSection } from "../../utils/FormComponents";
import ShowToast from "../ui/ShowToast";
import DepartmentIcon from "../../assets/icons/DepartmentIcon";

const initialFormData = {
  numeroOficio: "",
  fechaHora: "",
  fiscalia: "", // Unidad Solicitante
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
  celular: "",
  tipo_de_muestra: "TOMA DE MUESTRAS", 
};

function CrearOficio() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);

  const [codigo, setCodigo] = useState("");
  const [closeModal, setCloseModal] = useState(false);
  const [especialidades, setEspecialidades] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [tiposExamen, setTiposExamen] = useState([]);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [especialidadesRes, prioridadesRes] = await Promise.all([
          ComplementServices.getTiposDepartamento(),
          ComplementServices.getAllPriorities()
        ]);
        setPrioridades(Array.isArray(prioridadesRes?.data) ? prioridadesRes.data : []);
        const filtered = (especialidadesRes?.data || []).filter(e => ![11, 12, 13].includes(e.id_tipo_departamento));
        setEspecialidades(filtered);
      } catch (error) {
        setFeedback("Error al cargar datos iniciales.");
      }
    };
    loadInitialData();
  }, []);

  const handleDepartmentSelection = async (department) => {
    setFormData(prev => ({ 
      ...initialFormData,
      id_especialidad_requerida: department.id_tipo_departamento, 
      especialidad_requerida: department.nombre_departamento 
    }));
    try {
      const tiposRes = await ComplementServices.getTiposByDepartamento(department.id_tipo_departamento);
      setTiposExamen(tiposRes?.data || []);
    } catch (err) {
      setTiposExamen([]);
    }
    setStep(2);
  };

  const handleTipoMuestraChange = (tipo) => {
    setFormData(prev => ({ ...prev, tipo_de_muestra: tipo }));
  };

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handlePeritoSelect = (perito) => setFormData(prev => ({ ...prev, id_usuario_perito_asignado: perito.id_usuario, perito_asignado: perito.nombre_completo, cip_perito_asignado: perito.CIP }));
  const handleTipoExamenChange = (e) => {
    const { value, checked, name } = e.target;
    const examenId = parseInt(value);
    setFormData(prev => {
      const new_ids = checked ? [...prev.id_tipos_examen, examenId] : prev.id_tipos_examen.filter(id => id !== examenId);
      const new_names = checked ? [...prev.tipos_examen, name] : prev.tipos_examen.filter(n => n !== name);
      return { ...prev, id_tipos_examen: new_ids, tipos_examen: new_names };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      const payload = { ...formData, mesadepartesData: { id_usuario: user.id_usuario, CIP: user.CIP, nombre_completo: user.nombre_completo } };
      const createResp = await OficiosService.createOficio(payload);
      if (createResp.success) {
        setFeedback("¡Oficio creado y asignado exitosamente!");
        setCodigo(createResp.data.numero_oficio || `ID-${createResp.data.id_oficio}`);
        setCloseModal(true);
      } else {
        setFeedback(`Error del servidor: ${createResp.message}`);
      }
    } catch (err) {
      setFeedback(err?.message || "Error de conexión.");
    }
  };

  const handleReset = () => {
    setStep(1);
    setFormData(initialFormData);
  };

  const renderDepartmentSelection = () => (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-8 text-center text-gray-800 dark:text-gray-100">Paso 1: Seleccione un Departamento</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-6xl mx-auto">
        {especialidades.map(dep => (
          <button key={dep.id_tipo_departamento} onClick={() => handleDepartmentSelection(dep)} className="flex flex-col items-center p-4 bg-white dark:bg-dark-bg-secondary rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
            <DepartmentIcon className="text-pnp-green-light dark:text-dark-pnp-green text-4xl mb-3 w-10 h-10" />
            <span className="text-base font-semibold text-center text-gray-700 dark:text-dark-text-secondary">{dep.nombre_departamento}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderDynamicForm = () => {
    const isTomaMuestra = formData.tipo_de_muestra === 'TOMA DE MUESTRAS';
    const isRemitido = formData.tipo_de_muestra === 'MUESTRAS REMITIDAS';

    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Paso 2: Registrar Ingreso</h2>
            <button onClick={() => setStep(1)} className="px-4 py-2 text-sm rounded-lg bg-gray-200 dark:bg-dark-bg-tertiary hover:bg-gray-300 dark:hover:bg-gray-600">Cambiar Depto.</button>
        </div>
        
        {/* Tipo de Muestra Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button onClick={() => handleTipoMuestraChange('TOMA DE MUESTRAS')} className={`p-4 text-left rounded-lg border-2 transition-all duration-200 ${isTomaMuestra ? 'border-info text-info dark:border-blue-400 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-200 dark:border-dark-border hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}>
            <h3 className={`text-lg font-semibold ${!isTomaMuestra ? 'text-gray-700 dark:text-dark-text-secondary' : ''}`}>REQUIERE TOMA DE MUESTRA</h3>
          </button>
          <button onClick={() => handleTipoMuestraChange('MUESTRAS REMITIDAS')} className={`p-4 text-left rounded-lg border-2 transition-all duration-200 ${isRemitido ? 'border-pnp-green text-pnp-green dark:border-dark-pnp-green dark:text-dark-pnp-green bg-green-50 dark:bg-green-900/30' : 'border-gray-200 dark:border-dark-border hover:bg-green-50 dark:hover:bg-green-900/20'}`}>
            <h3 className={`text-lg font-semibold ${!isRemitido ? 'text-gray-700 dark:text-dark-text-secondary' : ''}`}>MUESTRA REMITIDA</h3>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <FormSection title="Información de Encabezado">
            <FormInput label="Número de Oficio" name="numeroOficio" value={formData.numeroOficio} onChange={handleChange} />
            <FormInput label="Remitente" name="fiscal_remitente" value={formData.fiscal_remitente} onChange={handleChange} />
          </FormSection>

          <FormSection title="Información General">
            <FormInput label="Unidad Solicitante" name="fiscalia" value={formData.fiscalia} onChange={handleChange} required />
            <FormInput label="Nombre Implicado" name="implicado" value={formData.implicado} onChange={handleChange} required />
            <FormInput label="DNI Implicado" name="dniImplicado" value={formData.dniImplicado} onChange={handleChange} required />
            <FormInput label="Celular de Contacto" name="celular" value={formData.celular} onChange={handleChange} />
          </FormSection>

          <FormSection title="Exámenes y Derivación">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2 block">Tipos de Examen</label>
              <div className="p-4 border dark:border-dark-border rounded-lg max-h-48 overflow-y-auto bg-white dark:bg-dark-bg-primary">
                {tiposExamen.length > 0 ? tiposExamen.map(examen => (
                  <div key={examen.id_tipo_de_examen} className="flex items-center py-1">
                    <input type="checkbox" id={`examen-${examen.id_tipo_de_examen}`} value={examen.id_tipo_de_examen} name={examen.nombre} checked={formData.id_tipos_examen.includes(examen.id_tipo_de_examen)} onChange={handleTipoExamenChange} className="h-4 w-4 rounded text-pnp-green focus:ring-pnp-green-light" />
                    <label htmlFor={`examen-${examen.id_tipo_de_examen}`} className="ml-3 block text-sm text-gray-800 dark:text-dark-text-primary">{examen.nombre}</label>
                  </div>
                )) : <p className="text-gray-500 dark:text-dark-text-muted">No hay exámenes para este departamento.</p>}
              </div>
            </div>
            <AsignacionPerito idEspecialidad={formData.id_especialidad_requerida} onPeritoSelect={handlePeritoSelect} selectedPerito={{nombre_completo: formData.perito_asignado}} />
            <FormSelect label="Prioridad" name="id_prioridad" value={formData.id_prioridad} onChange={handleChange} required>
              <option value="">Seleccione prioridad</option>
              {prioridades.map(p => <option key={p.id_prioridad} value={p.id_prioridad}>{p.nombre_prioridad}</option>)}
            </FormSelect>
          </FormSection>

          <FormSection title="Actas y Asunto">
            <div className="flex items-center">
                <button type="button" onClick={() => alert('Funcionalidad para Acta de Observaciones pendiente.')} disabled={isTomaMuestra} className="px-4 py-2 rounded-lg bg-blue-500 text-white disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed">
                    Generar Acta de Observaciones
                </button>
            </div>
            <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Asunto</label>
                <textarea name="asunto" value={formData.asunto} onChange={handleChange} rows="3" className="w-full border p-2 rounded-lg bg-white dark:bg-dark-bg-tertiary dark:border-dark-border"></textarea>
            </div>
          </FormSection>

          <div className="flex justify-end gap-4 mt-8 border-t dark:border-dark-border pt-4">
            <button type="submit" className="px-6 py-2 rounded-lg bg-pnp-green hover:bg-pnp-green-light text-white font-semibold">Crear y Generar Código</button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-extrabold text-center mb-8 text-gray-800 dark:text-gray-100">Crear Nuevo Oficio</h1>
      {feedback && <ShowToast message={feedback} onClose={() => setFeedback(null)} />}

      {step === 1 ? renderDepartmentSelection() : renderDynamicForm()}

      {closeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-bg-secondary p-8 rounded-lg text-center shadow-2xl">
            <h3 className="text-2xl font-bold text-success dark:text-dark-pnp-green mb-4">¡Oficio Creado y Asignado!</h3>
            <p className="text-gray-700 dark:text-dark-text-secondary mb-6">El código para seguimiento es:</p>
            <p className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8">{codigo}</p>
            <button onClick={handleReset} className="bg-pnp-green hover:bg-pnp-green-light text-white font-bold py-3 px-8 rounded-lg">Aceptar y Crear Nuevo</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CrearOficio;