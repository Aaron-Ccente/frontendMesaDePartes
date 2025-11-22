import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../../hooks/useAuth';
import { OficiosService } from '../../../services/oficiosService';
import { ProcedimientoService } from '../../../services/procedimientoService';
import { DocumentService } from '../../../services/documentService';
import PDFPreviewModal from '../../documentos/PDFPreviewModal';
import DeleteIcon from '../../../assets/icons/DeleteIcon';
import { LimpiarIcon, PreviewIcon, GuardarIcon, CancelarIcon } from '../../../assets/icons/Actions';

// --- Constantes para la lógica de negocio ---
const TIPOS_DE_MUESTRA = ['Sangre', 'Orina', 'Hisopo Ungueal', 'Visceras', 'Cabello', 'Otro'];
const EXAMEN_A_TIPO_MUESTRA = {
  'Dosaje Etilico': 'Sangre',
  'Toxicologico': 'Orina',
  'Sarro Ungueal': 'Hisopo Ungueal',
};

const MUESTRA_DEFAULTS = {
  'Sangre': {
    descripcion: 'Muestra de sangre venosa extraída del pliegue del codo, en tubo de ensayo tapa lila con anticoagulante EDTA.',
    cantidad: '5 ml aprox.',
  },
  'Orina': {
    descripcion: 'Muestra de orina recolectada en un frasco de plástico estéril de boca ancha y tapa rosca.',
    cantidad: '50 ml aprox.',
  },
  'Hisopo Ungueal': {
    descripcion: 'Muestra de sarro ungueal obtenida mediante raspado con hisopo estéril de las uñas de ambas manos.',
    cantidad: '2 hisopos',
  },
};
// -----------------------------------------

const ProcedimientoExtraccion = () => {
  const { id: id_oficio } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const funcion = location.state?.funcion; // 'extraccion' o 'extraccion_y_analisis'

  // Estados del componente
  const [oficio, setOficio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados del formulario
  const [fueExitosa, setFueExitosa] = useState(true);
  const [observaciones, setObservaciones] = useState('');
  const [muestras, setMuestras] = useState([]);

  // Estados del modal de vista previa
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

// Carga inicial de datos: Lógica unificada para modo creación y edición.
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Intentar obtener datos de una extracción previa PRIMERO.
      const procRes = await ProcedimientoService.getDatosExtraccion(id_oficio);
      
      // 2. Si hay datos, estamos en MODO EDICIÓN.
      if (procRes.success && procRes.data) {
        toast.info('Modo edición: se han cargado los datos guardados anteriormente.');
        
        // Cargar los datos del procedimiento guardado
        setMuestras(procRes.data.muestras.map(m => ({ ...m, id: m.id_muestra })) || []);
        setObservaciones(procRes.data.observaciones || '');
        setFueExitosa(procRes.data.fue_exitosa);

        // También necesitamos los datos del oficio para la cabecera
        const oficioRes = await OficiosService.getOficioDetalle(id_oficio);
        if (oficioRes.success) setOficio(oficioRes.data);

        return; // Salir temprano para no ejecutar la lógica de creación.
      }

      // 3. Si no hay datos, estamos en MODO CREACIÓN.
      const oficioRes = await OficiosService.getOficioDetalle(id_oficio);
      if (!oficioRes.success) throw new Error(oficioRes.message || 'No se pudieron cargar los detalles del oficio.');
      
      const oficioData = oficioRes.data;
      setOficio(oficioData);

      if (oficioData && oficioData.tipos_de_examen) {
        const muestrasSugeridas = new Set();
        oficioData.tipos_de_examen.forEach(examen => {
          const tipoMuestraSugerido = Object.keys(EXAMEN_A_TIPO_MUESTRA).find(key => examen.toUpperCase() === key.toUpperCase());
          if (tipoMuestraSugerido) {
            muestrasSugeridas.add(EXAMEN_A_TIPO_MUESTRA[tipoMuestraSugerido]);
          }
        });

        if (muestrasSugeridas.size > 0) {
          const nuevasMuestras = [...muestrasSugeridas].map(tipo => ({
            id: Date.now() + Math.random(),
            tipo_muestra: tipo,
            descripcion: MUESTRA_DEFAULTS[tipo]?.descripcion || '',
            cantidad: MUESTRA_DEFAULTS[tipo]?.cantidad || '',
          }));
          setMuestras(nuevasMuestras);
        } else {
          setMuestras([{ id: Date.now(), tipo_muestra: '', descripcion: '', cantidad: '' }]);
        }
      }
    } catch (error) {
      toast.error(`Error al cargar datos: ${error.message}`);
      navigate('/perito/dashboard');
    } finally {
      setLoading(false);
    }
  }, [id_oficio, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);



  const handleMuestraChange = (index, field, value) => {
    const newMuestras = [...muestras];
    newMuestras[index][field] = value;

    if (field === 'tipo_muestra') {
      const defaults = MUESTRA_DEFAULTS[value];
      if (defaults) {
        newMuestras[index].descripcion = defaults.descripcion;
        newMuestras[index].cantidad = defaults.cantidad;
      }
    }
    
    setMuestras(newMuestras);
  };

  const addMuestra = () => {
    setMuestras([...muestras, { id: Date.now(), tipo_muestra: '', descripcion: '', cantidad: '' }]);
  };

  const removeMuestra = (index) => {
    const newMuestras = muestras.filter((_, i) => i !== index);
    setMuestras(newMuestras);
  };

  const handleClear = () => {
    if (window.confirm('¿Estás seguro de que deseas limpiar todos los campos del formulario?')) {
      setFueExitosa(true);
      setObservaciones('');
      setMuestras([{ id: Date.now(), tipo_muestra: '', descripcion: '', cantidad: '' }]);
      toast.success('Formulario limpiado.');
    }
  };

  const handlePreview = async () => {
    if (!oficio || !user) {
      toast.error('Los datos del oficio o del perito no están cargados.');
      return;
    }
    
    const extraData = {
      perito: user,
      muestras,
      observaciones,
      fue_exitosa: fueExitosa,
    };

    toast.info('Generando vista previa del Acta de Extracción...');
    const url = await DocumentService.getPreviewUrl(id_oficio, 'tm/acta_extraccion', extraData);

    if (url) {
      setPdfUrl(url);
      setIsModalOpen(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    toast.info('Guardando procedimiento...');

    const payload = {
      fue_exitosa: fueExitosa,
      observaciones,
      muestras: fueExitosa ? muestras.filter(m => m.tipo_muestra && m.cantidad) : [],
    };

    if (fueExitosa && payload.muestras.length === 0) {
        toast.error('Debe registrar al menos una muestra válida para una extracción exitosa.');
        setIsSubmitting(false);
        return;
    }

    try {
      let res;
      // Lógica condicional basada en el flujo de trabajo
      if (funcion === 'extraccion_y_analisis') {
        res = await ProcedimientoService.finalizarExtraccionInterna(id_oficio, payload);
      } else {
        res = await ProcedimientoService.registrarExtraccion(id_oficio, payload);
      }

      if (res.success) {
        toast.success(res.message || 'Procedimiento guardado exitosamente.');
        navigate('/perito/dashboard');
      } else {
        throw new Error(res.message || 'Ocurrió un error desconocido al guardar.');
      }
    } catch (error) {
      toast.error(`Error al guardar: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pnp-green-dark"></div>
      </div>
    );
  }

  const InfoField = ({ label, value }) => (
    <div>
      <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">{label}</h4>
      <p className="text-base text-gray-800 dark:text-gray-200">{value || 'No especificado'}</p>
    </div>
  );

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8 max-w-6xl mx-auto">
        {/* Cabecera */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text-primary">
            Procedimiento de Extracción de Muestra
          </h1>
          <p className="text-lg text-gray-500 dark:text-dark-text-secondary mt-1">
            Oficio N°: <span className="font-semibold text-pnp-green-dark dark:text-dark-pnp-green">{oficio?.numero_oficio}</span>
          </p>
        </div>

        {/* Detalles del Caso */}
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-md border dark:border-dark-border">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b dark:border-dark-border pb-3">Detalles del Caso</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <InfoField label="Asunto" value={oficio?.asunto} />
                <InfoField label="Implicado" value={oficio?.examinado_incriminado} />
                <InfoField label="Delito" value={oficio?.delito} />
                <InfoField label="Tipos de Examen" value={oficio?.tipos_de_examen?.join(', ')} />
                <InfoField label="Perito Asignado" value={oficio?.nombre_perito_actual} />
                <InfoField label="Prioridad" value={oficio?.nombre_prioridad} />
            </div>
        </div>

        {/* Formulario del Procedimiento */}
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-md border dark:border-dark-border space-y-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b dark:border-dark-border pb-3">Registro del Procedimiento</h3>
            
            <div className="p-4 border rounded-lg dark:border-dark-border">
                <h4 className="text-lg font-semibold text-gray-700 dark:text-dark-text-primary mb-4">1. Resultado del Procedimiento</h4>
                <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20">
                        <input type="radio" name="resultado" checked={fueExitosa} onChange={() => setFueExitosa(true)} className="h-5 w-5 text-pnp-green-dark dark:text-dark-pnp-green focus:ring-pnp-green-light dark:focus:ring-dark-pnp-green dark:bg-dark-surface" />
                        <span className="text-base font-medium text-gray-700 dark:text-dark-text-primary">Extracción Exitosa</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20">
                        <input type="radio" name="resultado" checked={!fueExitosa} onChange={() => setFueExitosa(false)} className="h-5 w-5 text-red-600 dark:text-red-500 focus:ring-red-500 dark:focus:ring-red-400 dark:bg-dark-surface" />
                        <span className="text-base font-medium text-gray-700 dark:text-dark-text-primary">Extracción Fallida</span>
                    </label>
                </div>
            </div>

            {fueExitosa && (
                <div className="p-4 border rounded-lg dark:border-dark-border">
                    <h4 className="text-lg font-semibold text-gray-700 dark:text-dark-text-primary mb-4">2. Muestras Recolectadas</h4>
                    <div className="space-y-4">
                        {muestras.map((muestra, index) => (
                        <div key={muestra.id} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-dark-bg-tertiary rounded-lg border dark:border-dark-border">
                            <span className="text-pnp-green-dark dark:text-dark-pnp-green font-bold text-lg pt-2">{index + 1}</span>
                            <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-dark-text-secondary">Tipo de Muestra</label>
                                <select value={muestra.tipo_muestra} onChange={(e) => handleMuestraChange(index, 'tipo_muestra', e.target.value)} className="mt-1 form-select" required>
                                    <option value="">Seleccione un tipo...</option>
                                    {TIPOS_DE_MUESTRA.map(tipo => (
                                        <option key={tipo} value={tipo}>{tipo}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-dark-text-secondary">Cantidad / Volumen</label>
                                <input type="text" value={muestra.cantidad} onChange={(e) => handleMuestraChange(index, 'cantidad', e.target.value)} placeholder="Ej: 50 ml aprox." className="mt-1 form-input" required />
                            </div>
                            <div className="md:col-span-3">
                                <label className="block text-sm font-medium text-gray-600 dark:text-dark-text-secondary">Descripción de la Muestra y Embalaje</label>
                                <textarea value={muestra.descripcion} onChange={(e) => handleMuestraChange(index, 'descripcion', e.target.value)} placeholder="Ej: Muestra de sangre venosa extraída del pliegue del codo..." rows="3" className="mt-1 form-input w-full" />
                            </div>
                            </div>
                            <button type="button" onClick={() => removeMuestra(index)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20" title="Eliminar muestra">
                            <DeleteIcon />
                            </button>
                        </div>
                        ))}
                    </div>
                    <button type="button" onClick={addMuestra} className="mt-4 btn-secondary text-sm">
                        + Agregar Muestra
                    </button>
                </div>
            )}

            <div className="p-4 border rounded-lg dark:border-dark-border">
                <h4 className="text-lg font-semibold text-gray-700 dark:text-dark-text-primary mb-2">{fueExitosa ? '3. Observaciones Adicionales' : '2. Motivo de la Falla'}</h4>
                <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} rows="4" placeholder={fueExitosa ? 'Detalles relevantes del procedimiento...' : 'Especifique por qué no se pudo realizar la extracción...'} className="mt-1 form-input w-full" required={!fueExitosa} />
            </div>
        </div>

        <div className="flex flex-wrap justify-end items-center gap-3 pt-6 border-t dark:border-dark-border">
            <button 
                type="button" 
                onClick={() => navigate('/perito/dashboard')} 
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors text-gray-700 bg-gray-200 hover:bg-gray-300 dark:text-dark-text-secondary dark:bg-dark-bg-tertiary dark:hover:bg-dark-border"
            >
                <CancelarIcon />
                <span>Cancelar</span>
            </button>
            <button 
                type="button" 
                onClick={handleClear} 
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors text-gray-700 bg-gray-200 hover:bg-gray-300 dark:text-dark-text-secondary dark:bg-dark-bg-tertiary dark:hover:bg-dark-border"
            >
                <LimpiarIcon />
                <span>Limpiar</span>
            </button>
            <button 
                type="button" 
                onClick={handlePreview} 
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors text-pnp-green-dark border border-pnp-green-dark hover:bg-green-50 dark:text-dark-pnp-green dark:border-dark-pnp-green dark:hover:bg-dark-pnp-green/10"
            >
                <PreviewIcon />
                <span>Vista Previa</span>
            </button>
            <button 
                type="submit" 
                disabled={isSubmitting} 
                className="btn-primary"
            >
                <GuardarIcon />
                <span>{isSubmitting ? 'Guardando...' : 'Guardar Procedimiento'}</span>
            </button>
        </div>
      </form>

      {isModalOpen && (
        <PDFPreviewModal pdfUrl={pdfUrl} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
};

export default ProcedimientoExtraccion;