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
  celularConductor: "",
  implicado: "",
  dniImplicado: "",
  direccionImplicado: "",
  delito: "",
  situacionPersona: "",
  celular: "",
  referencia: "",
  fechaIncidente: "",
  horaIncidente: "",
  id_tipos_examen: [],
  tipos_examen: [],
  muestra: "N/A", // Campo corregido y con valor por defecto
  id_especialidad_requerida: "",
  especialidad_requerida: "",
  id_usuario_perito_asignado: "",
  perito_asignado: "",
  cip_perito_asignado: "",
  estado: "CREACIÓN DE OFICIO",
  id_prioridad: "",
  asunto: "",
  folios: "",
  tipo_de_muestra: "TOMA DE MUESTRAS", 
};

function CrearOficio() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);

  const [especialidades, setEspecialidades] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [tiposExamen, setTiposExamen] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [toastType, setToastType] = useState('success'); // 'success' o 'error'

  // --- State for Perito Assignment Modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [peritosDisponibles, setPeritosDisponibles] = useState([]);
  const [isLoadingPeritos, setIsLoadingPeritos] = useState(false);

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
      } catch {
        setFeedback("Error al cargar datos iniciales.");
        setToastType('error');
      }
    };
    loadInitialData();
  }, []);

  const handleOpenPeritoModal = async () => {
    const { id_tipos_examen, tipo_de_muestra } = formData;
    if (tipo_de_muestra !== 'TOMA DE MUESTRAS' && id_tipos_examen.length === 0) {
      setFeedback("Por favor, seleccione al menos un tipo de examen antes de asignar un perito.");
      setToastType('error');
      return;
    }

    setIsLoadingPeritos(true);
    try {
      const res = await ComplementServices.getPeritosParaAsignacion({
        idTiposExamen: id_tipos_examen,
        tipoDeIngreso: tipo_de_muestra,
      });
      if (res.success) {
        setPeritosDisponibles(res.data);
        setIsModalOpen(true);
      } else {
        throw new Error(res.message || 'No se encontraron peritos.');
      }
    } catch (err) {
      setFeedback(err?.message || "Error de conexión.");
      setToastType('error');
    } finally {
      setIsLoadingPeritos(false);
    }
  };

  const handleDepartmentSelection = async (department) => {
    setFormData({ 
      ...initialFormData,
      id_especialidad_requerida: department.id_tipo_departamento, 
      especialidad_requerida: department.nombre_departamento 
    });
    try {
      const tiposRes = await ComplementServices.getTiposByDepartamento(department.id_tipo_departamento);
      setTiposExamen(tiposRes?.data || []);
    } catch {
      setTiposExamen([]);
    }
    setStep(2);
  };

  const handleTipoMuestraChange = (tipo) => {
    setFormData(prev => ({ ...prev, tipo_de_muestra: tipo }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "folios") {
      const numValue = parseInt(value, 10);
      if (isNaN(numValue) || numValue < 1 || numValue >= 100) {
        return;
      }
      setFormData(prev => ({ ...prev, [name]: numValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleClearForm = () => {
    setFormData(prev => ({
      ...initialFormData,
      id_especialidad_requerida: prev.id_especialidad_requerida,
      especialidad_requerida: prev.especialidad_requerida,
      tipo_de_muestra: prev.tipo_de_muestra,
    }));
  };
  
  const handlePeritoSelect = (perito) => setFormData(prev => ({ ...prev, id_usuario_perito_asignado: perito.id_usuario, perito_asignado: perito.nombre_completo, cip_perito_asignado: perito.CIP }));
  
  const handleTipoExamenToggle = (examenId, examenName) => {
    setFormData(prev => {
      const isSelected = prev.id_tipos_examen.includes(examenId);
      const new_ids = isSelected
        ? prev.id_tipos_examen.filter(id => id !== examenId)
        : [...prev.id_tipos_examen, examenId];
      const new_names = isSelected
        ? prev.tipos_examen.filter(n => n !== examenName)
        : [...prev.tipos_examen, examenName];
      
      // Al cambiar los exámenes, reseteamos el perito seleccionado
      return { 
        ...prev, 
        id_tipos_examen: new_ids, 
        tipos_examen: new_names,
        id_usuario_perito_asignado: "",
        perito_asignado: "",
        cip_perito_asignado: "",
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id_especialidad_requerida || !formData.id_usuario_perito_asignado || !formData.id_prioridad) {
      setFeedback("Error: Debe seleccionar especialidad, perito y prioridad.");
      setToastType('error');
      return;
    }
    if (formData.id_tipos_examen.length === 0) {
      setFeedback("Error: Debe seleccionar al menos un tipo de examen.");
      setToastType('error');
      return;
    }
    setFeedback("Procesando...");
    setToastType('success');
    try {
      if (formData.numeroOficio) {
        const checkResp = await OficiosService.checkNumero(formData.numeroOficio);
        if (checkResp.exists) {
          setFeedback(`Error: Ya existe un oficio con el número ${formData.numeroOficio}`);
          setToastType('error');
          return;
        }
      }
      const payload = { ...formData, mesadepartesData: { id_usuario: user.id_usuario, CIP: user.CIP, nombre_completo: user.nombre_completo } };
      const createResp = await OficiosService.createOficio(payload);

      if (createResp.success) {
        const newCodigo = createResp.data.numero_oficio || `ID-${createResp.data.id_oficio}`;
        setFeedback(`¡Oficio creado! Código: ${newCodigo}`);
        setToastType('success');
        handleClearForm();
      } else {
        setFeedback(`Error del servidor: ${createResp.message}`);
        setToastType('error');
      }
    } catch {
      setFeedback("Error de conexión.");
      setToastType('error');
    }
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button onClick={() => handleTipoMuestraChange('TOMA DE MUESTRAS')} className={`p-4 text-left rounded-lg border-2 border-gray-200 dark:border-dark-border transition-all duration-200 cursor-pointer  hover:scale-102 ${isTomaMuestra ? ' bg-[#1a4d2e] text-white' : ''}`}>
            <h3 className={`text-lg font-semibold ${!isTomaMuestra ? 'text-gray-700 dark:text-dark-text-secondary' : ''}`}>REQUIERE TOMA DE MUESTRA</h3>
            <p className="text-sm dark:text-gray-400">El perito asignado se encargará de recolectar la muestra.</p>
          </button>
          <button onClick={() => handleTipoMuestraChange('MUESTRAS REMITIDAS')} className={`p-4 text-left rounded-lg border-2 border-gray-200 dark:border-dark-border transition-all duration-200 cursor-pointer hover:scale-102 ${isRemitido ? 'bg-yellow-500 text-black' : ' dark:text-white'}`}>
            <h3 className={`text-lg font-semibold ${!isRemitido ? 'text-gray-700 dark:text-dark-text-secondary' : ''}`}>MUESTRA REMITIDA</h3>
            <p className="text-sm ">La muestra física se entrega junto con el oficio.</p>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <FormSection title="1. Información del Registro">
            <FormInput label="Número de Oficio" name="numeroOficio" value={formData.numeroOficio} onChange={handleChange} required/>
            <FormInput label="Número de Folios" name="folios" type="number" value={formData.folios} onChange={handleChange} min="1" max="99" />
            <FormInput label="Referencia (Opcional)" name="referencia" value={formData.referencia} onChange={handleChange} />
            <FormInput label="Unidad Solicitante" name="fiscalia" value={formData.fiscalia} onChange={handleChange} required />
            <FormInput label="Región Solicitante" name="regionSolicitante" value={formData.regionSolicitante} onChange={handleChange} />
            <FormInput label="Celular del conductor" name="celularConductor" value={formData.celularConductor} onChange={handleChange} />
            {!isRemitido  && 
            (<div className="grid grid-cols-2 gap-4">
              <FormInput label="Fecha del Incidente" name="fechaIncidente" type="date" value={formData.fechaIncidente} onChange={handleChange} />
              <FormInput label="Hora del Incidente" name="horaIncidente" type="time" value={formData.horaIncidente} onChange={handleChange} />
            </div>)
            }
          </FormSection>

          <FormSection title="2. Información del Implicado">
            <FormInput label="Nombre Completo" name="implicado" value={formData.implicado} onChange={handleChange} required />
            <FormInput label="Documento de Identidad (DNI)" name="dniImplicado" value={formData.dniImplicado} onChange={handleChange} />
            <FormInput label="Dirección" name="direccionImplicado" value={formData.direccionImplicado} onChange={handleChange} />
            <FormInput label="Celular de Contacto" name="celular" value={formData.celular} onChange={handleChange} />
            <FormInput label="Delito" name="delito" value={formData.delito} onChange={handleChange} required />
            <FormSelect 
                label="Situación de la Persona" 
                name="situacionPersona" 
                value={formData.situacionPersona} 
                onChange={handleChange} 
                required
              >
                <option value="">Seleccione situación</option>
                <option value="Ocsiso">Ocsiso</option>
                <option value="Agraviado">Agraviado</option>
                <option value="Detenido">Detenido</option>
                <option value="Investigado">Investigado</option>
              </FormSelect>
          </FormSection>

          <FormSection title="4. Exámenes y Derivación">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2 block">Tipos de Examen Requeridos</label>
              <div className="p-4 border dark:border-dark-border rounded-lg flex flex-wrap gap-3 bg-white dark:bg-dark-bg-primary">
                {tiposExamen.length > 0 ? tiposExamen.map(examen => (
                  <button type="button" key={examen.id_tipo_de_examen} onClick={() => handleTipoExamenToggle(examen.id_tipo_de_examen, examen.nombre)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer hover:scale-105 ${
                      formData.id_tipos_examen.includes(examen.id_tipo_de_examen)
                        ? 'bg-pnp-green text-white shadow-md'
                        : 'bg-gray-200 dark:bg-dark-bg-tertiary text-gray-700 dark:text-dark-text-secondary hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {examen.nombre}
                  </button>
                )) : <p className="text-gray-500 dark:text-dark-text-muted">No hay exámenes para este departamento.</p>}
              </div>
            </div>
            
            {/* --- New Perito Assignment UI --- */}
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 block">
                Asignar a Perito <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-4">
                <div className="flex-grow p-2 border rounded-lg bg-gray-50 dark:bg-dark-bg-tertiary min-h-[42px]">
                  {formData.perito_asignado ? (
                    <span className="text-gray-800 dark:text-dark-text-primary">{formData.perito_asignado}</span>
                  ) : (
                    <span className="text-gray-400">No seleccionado</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleOpenPeritoModal}
                  disabled={isLoadingPeritos}
                  className="py-2 px-4 bg-[#1a4d2e] text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 cursor-pointer"
                >
                  {isLoadingPeritos ? 'Cargando...' : 'Seleccionar'}
                </button>
              </div>
            </div>

            <FormSelect label="Prioridad" name="id_prioridad" value={formData.id_prioridad} onChange={handleChange} required>
              <option value="">Seleccione prioridad</option>
              {prioridades.map(p => <option key={p.id_prioridad} value={p.id_prioridad}>{p.nombre_prioridad}</option>)}
            </FormSelect>
          </FormSection>

          <FormSection title="5. Actas y Asunto">
            <div className="flex items-center">
                <button type="button" onClick={() => alert('Funcionalidad para Acta de Observaciones pendiente.')} disabled={isTomaMuestra} className="px-4 py-2 rounded-lg bg-[#1a4d2e] text-white disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-green-700 cursor-pointer">
                    Generar Acta de Observaciones
                </button>
            </div>
            <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Asunto</label>
                <textarea name="asunto" value={formData.asunto} onChange={handleChange} rows="3" className="w-full border p-2 rounded-lg bg-white dark:bg-dark-bg-tertiary dark:border-dark-border"></textarea>
            </div>
          </FormSection>

          <div className="flex justify-end gap-4 mt-8 border-t dark:border-dark-border pt-4">
            <button type="button" onClick={handleClearForm} className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-dark-bg-tertiary dark:text-gray-200 dark:hover:bg-gray-600 font-semibold">Limpiar Formulario</button>
            <button type="submit" className="px-6 py-2 rounded-lg bg-pnp-green hover:bg-pnp-green-light text-white font-semibold">Crear y Generar Código</button>
          </div>
        </form>
        
        <AsignacionPerito 
          isModalOpen={isModalOpen}
          peritos={peritosDisponibles}
          onClose={() => setIsModalOpen(false)}
          onPeritoSelect={handlePeritoSelect}
          loading={isLoadingPeritos}
        />
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-extrabold text-center mb-8 text-gray-800 dark:text-gray-100">Crear Nuevo Oficio</h1>
      {feedback && (
        <ShowToast 
          type={toastType} 
          message={feedback} 
          onClose={() => setFeedback(null)} 
        />
      )}

      {step === 1 ? renderDepartmentSelection() : renderDynamicForm()}
    </div>
  );
}

export default CrearOficio;