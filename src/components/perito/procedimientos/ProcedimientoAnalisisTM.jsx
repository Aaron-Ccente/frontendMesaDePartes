import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../../hooks/useAuth';
import { OficiosService } from '../../../services/oficiosService';
import { ProcedimientoService } from '../../../services/procedimientoService';
import { LimpiarIcon, GuardarIcon, CancelarIcon, PreviewIcon } from '../../../assets/icons/Actions';
import DeleteIcon from '../../../assets/icons/DeleteIcon';
import { DocumentService } from '../../../services/documentService';
import PDFPreviewModal from '../../documentos/PDFPreviewModal';

// --- Constantes ---
const TIPOS_DE_MUESTRA = ['Sangre', 'Orina', 'Hisopo Ungueal', 'Visceras', 'Cabello', 'Otro'];
const EXAMEN_A_TIPO_MUESTRA = {
  'Dosaje Etilico': 'Sangre',
  'Toxicologico': 'Orina',
  'Sarro Ungueal': 'Hisopo Ungueal',
};

const OBJETO_PERICIA_DEFAULTS = {
  'Dosaje Etilico': 'Cuantificación de alcohol etílico en muestra biológica.',
  'Toxicologico': 'Identificación de sustancias tóxicas y/o drogas en muestra biológica.',
  'Sarro Ungueal': 'Identificación de adherencias de drogas ilícitas en muestra de sarro ungueal.',
};

const METODO_UTILIZADO_DEFAULTS = {
  'Dosaje Etilico': 'Espectrofotometría – UV VIS.',
  'Toxicologico': 'Cromatografía en capa fina, Inmunoensayo.',
  'Sarro Ungueal': 'Químico - colorimétrico.',
};

const TIPOS_DROGA = [
  { key: 'cocaina', label: 'Alcaloide de cocaína' },
  { key: 'marihuana', label: 'Cannabinoides (Marihuana)' },
  { key: 'benzodiacepinas', label: 'Benzodiacepinas' },
  { key: 'fenotiacinas', label: 'Fenotiacinas' },
  { key: 'barbituricos', label: 'Barbitúricos' },
  { key: 'sarro_ungueal', label: 'Sarro Ungueal' },
];
// -----------------

const ProcedimientoAnalisisTM = () => {
  const { id: id_oficio } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Estados del componente
  const [oficio, setOficio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados del formulario
  const [aperturaData, setAperturaData] = useState({ descripcion_paquete: '', observaciones: '' });
  const [metadata, setMetadata] = useState({ objeto_pericia: '', metodo_utilizado: '' });
  const [muestrasAnalizadas, setMuestrasAnalizadas] = useState([]);
  const [muestrasAgotadas, setMuestrasAgotadas] = useState(true);

  // Estados del modal
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // 1. Intentar obtener datos de un análisis previo PRIMERO.
      const procRes = await ProcedimientoService.getDatosAnalisisTM(id_oficio);

      // 2. Si hay datos, estamos en MODO EDICIÓN.
      if (procRes.success && procRes.data) {
        toast.info('Modo edición: se han cargado los datos del análisis guardado.');
        
        // Cargar los datos del procedimiento guardado
        setAperturaData(procRes.data.aperturaData);
        setMetadata(procRes.data.metadata);
        setMuestrasAnalizadas(procRes.data.muestrasAnalizadas);
        setMuestrasAgotadas(procRes.data.muestrasAgotadas);

        // También necesitamos los datos del oficio para la cabecera
        const oficioRes = await OficiosService.getOficioDetalle(id_oficio);
        if (oficioRes.success) setOficio(oficioRes.data);

        return; // Salir temprano para no ejecutar la lógica de creación.
      }
      
      // 3. Si no hay datos, estamos en MODO CREACIÓN.
      const oficioRes = await OficiosService.getOficioDetalle(id_oficio);
      if (oficioRes.success) {
        setOficio(oficioRes.data);
      } else {
        throw new Error(oficioRes.message || 'No se pudieron cargar los detalles del oficio.');
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

  useEffect(() => {
    if (oficio && oficio.tipos_de_examen) {
      const tiposSugeridos = new Set(oficio.tipos_de_examen.map(examen => EXAMEN_A_TIPO_MUESTRA[examen]).filter(Boolean));
      const initialResultados = TIPOS_DROGA.reduce((acc, droga) => ({ ...acc, [droga.key]: 'NEGATIVO' }), {});
      const muestrasIniciales = [...tiposSugeridos].map(tipo => ({
        id: Date.now() + Math.random(),
        codigo_muestra: '',
        tipo_muestra: tipo,
        descripcion_detallada: '',
        resultados: { ...initialResultados },
      }));
      if (muestrasIniciales.length === 0) {
        muestrasIniciales.push({ id: Date.now(), codigo_muestra: '', tipo_muestra: '', descripcion_detallada: '', resultados: { ...initialResultados } });
      }
      setMuestrasAnalizadas(muestrasIniciales);
      const examenes = oficio.tipos_de_examen || [];
      const objetoPericia = examenes.map(e => OBJETO_PERICIA_DEFAULTS[e]).filter(Boolean).join(' ');
      const metodoUtilizado = examenes.map(e => METODO_UTILIZADO_DEFAULTS[e]).filter(Boolean).join(' ');
      setMetadata({ objeto_pericia: objetoPericia || '', metodo_utilizado: metodoUtilizado || '' });
    }
  }, [oficio]);

  const handleAperturaChange = (field, value) => setAperturaData(prev => ({ ...prev, [field]: value }));
  const handleMetadataChange = (field, value) => setMetadata(prev => ({ ...prev, [field]: value }));
  const handleMuestraChange = (index, field, value, subfield = null) => {
    const newMuestras = [...muestrasAnalizadas];
    if (subfield) newMuestras[index][field][subfield] = value;
    else newMuestras[index][field] = value;
    setMuestrasAnalizadas(newMuestras);
  };
  const addMuestra = () => {
    const initialResultados = TIPOS_DROGA.reduce((acc, droga) => ({ ...acc, [droga.key]: 'NEGATIVO' }), {});
    setMuestrasAnalizadas([...muestrasAnalizadas, { id: Date.now(), codigo_muestra: '', tipo_muestra: '', descripcion_detallada: '', resultados: { ...initialResultados } }]);
  };
  const removeMuestra = (index) => {
    if (muestrasAnalizadas.length > 1) setMuestrasAnalizadas(muestrasAnalizadas.filter((_, i) => i !== index));
    else toast.error('Debe haber al menos una muestra a analizar.');
  };
  
  const handlePreview = async (tipo) => {
    if (!oficio || !user) {
      toast.error('Los datos del oficio o del perito no están cargados.');
      return;
    }
    const templateName = tipo === 'Acta de Apertura' ? 'tm/acta_apertura' : 'tm/informe_pericial_tm';
    const extraData = { perito: user, aperturaData, muestrasAnalizadas, metadata, muestrasAgotadas };
    toast.info(`Generando vista previa de "${tipo}"...`);
    const url = await DocumentService.getPreviewUrl(id_oficio, templateName, extraData);
    if (url) {
      setPdfUrl(url);
      setIsPreviewModalOpen(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!aperturaData.descripcion_paquete) return toast.error('Debe describir el estado del paquete recibido.');
    const muestrasValidas = muestrasAnalizadas.filter(m => m.codigo_muestra);
    if (muestrasValidas.length === 0) return toast.error('Debe registrar el análisis de al menos una muestra con su código.');

    setIsSubmitting(true);
    toast.info('Registrando análisis...');
    const payload = { apertura_data: aperturaData, muestras_analizadas: muestrasValidas, metadata, muestras_agotadas: muestrasAgotadas };

    try {
      const res = await ProcedimientoService.registrarAnalisis(id_oficio, payload);
      if (res.success) {
        toast.success(res.message || 'Análisis guardado exitosamente.');
        navigate('/perito/dashboard');
      } else {
        throw new Error(res.message || 'Ocurrió un error desconocido.');
      }
    } catch (error) {
      toast.error(`Error al registrar: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pnp-green-dark"></div></div>;

  const InfoField = ({ label, value }) => (
    <div>
      <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">{label}</h4>
      <p className="text-base text-gray-800 dark:text-gray-200">{value || 'No especificado'}</p>
    </div>
  );

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8 max-w-6xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text-primary">Procedimiento de Análisis de Muestra (TM)</h1>
          <p className="text-lg text-gray-500 dark:text-dark-text-secondary mt-1">Oficio N°: <span className="font-semibold text-pnp-green-dark dark:text-dark-pnp-green">{oficio?.numero_oficio}</span></p>
        </div>
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
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-md border dark:border-dark-border space-y-6">
          <div className="flex justify-between items-center border-b dark:border-dark-border pb-3">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Paso 1: Apertura del Paquete Lacrado</h3>
            <button type="button" onClick={() => handlePreview('Acta de Apertura')} className="btn-secondary text-sm flex items-center gap-2"><PreviewIcon /><span>Acta de Apertura</span></button>
          </div>
          <div>
            <label htmlFor="descripcion_paquete" className="block text-sm font-medium text-gray-600 dark:text-dark-text-secondary">Descripción del Paquete Recibido</label>
            <textarea id="descripcion_paquete" value={aperturaData.descripcion_paquete} onChange={(e) => handleAperturaChange('descripcion_paquete', e.target.value)} rows="2" placeholder="Ej: Sobre manila A4 lacrado con cinta de embalaje, sin signos de alteración." className="mt-1 form-input w-full" required />
          </div>
          <div>
            <label htmlFor="observaciones_apertura" className="block text-sm font-medium text-gray-600 dark:text-dark-text-secondary">Observaciones de la Apertura (Opcional)</label>
            <textarea id="observaciones_apertura" value={aperturaData.observaciones} onChange={(e) => handleAperturaChange('observaciones', e.target.value)} rows="2" placeholder="Detalles relevantes observados durante la apertura..." className="mt-1 form-input w-full" />
          </div>
        </div>
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-md border dark:border-dark-border space-y-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white border-b dark:border-dark-border pb-3">Paso 2: Datos del Informe Pericial</h3>
          <div>
            <label htmlFor="objeto_pericia" className="block text-sm font-medium text-gray-600 dark:text-dark-text-secondary">Objeto de la Pericia</label>
            <textarea id="objeto_pericia" value={metadata.objeto_pericia} onChange={(e) => handleMetadataChange('objeto_pericia', e.target.value)} rows="2" placeholder="Ej: Identificación de sustancias tóxicas y adherencias de drogas ilícitas en muestra biológica." className="mt-1 form-input w-full" />
          </div>
          <div>
            <label htmlFor="metodo_utilizado" className="block text-sm font-medium text-gray-600 dark:text-dark-text-secondary">Método Utilizado</label>
            <textarea id="metodo_utilizado" value={metadata.metodo_utilizado} onChange={(e) => handleMetadataChange('metodo_utilizado', e.target.value)} rows="3" placeholder="Ej: Toxicológico: Cromatografía en capa fina, Inmunoensayo. Sarro ungueal: Químico - colorimétrico." className="mt-1 form-input w-full" />
          </div>
        </div>
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-md border dark:border-dark-border space-y-6">
          <div className="flex justify-between items-center border-b dark:border-dark-border pb-3">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Paso 3: Registro y Análisis de Muestras</h3>
            <button type="button" onClick={() => handlePreview('Informe de Resultados')} className="btn-secondary text-sm flex items-center gap-2"><PreviewIcon /><span>Informe de Resultados</span></button>
          </div>
          <div className="space-y-4">
            {muestrasAnalizadas.map((muestra, index) => (
              <div key={muestra.id} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-dark-bg-tertiary rounded-lg border dark:border-dark-border">
                <span className="text-pnp-green-dark dark:text-dark-pnp-green font-bold text-lg pt-2">{index + 1}</span>
                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-600 dark:text-dark-text-secondary">Código de Muestra</label><input type="text" value={muestra.codigo_muestra} onChange={(e) => handleMuestraChange(index, 'codigo_muestra', e.target.value)} placeholder="Leer y escribir código de la etiqueta" className="mt-1 form-input" required /></div>
                  <div><label className="block text-sm font-medium text-gray-600 dark:text-dark-text-secondary">Tipo de Muestra</label><select value={muestra.tipo_muestra} onChange={(e) => handleMuestraChange(index, 'tipo_muestra', e.target.value)} className="mt-1 form-select" required><option value="">Seleccione un tipo...</option>{TIPOS_DE_MUESTRA.map(tipo => (<option key={tipo} value={tipo}>{tipo}</option>))}</select></div>
                  <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-600 dark:text-dark-text-secondary">Descripción Detallada de la Muestra</label><textarea value={muestra.descripcion_detallada} onChange={(e) => handleMuestraChange(index, 'descripcion_detallada', e.target.value)} placeholder="Ej: Un (01) frasco de plástico transparente..." rows="2" className="mt-1 form-input w-full" /></div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600 dark:text-dark-text-secondary mb-2">Resultados del Análisis</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 p-3 border rounded-md bg-gray-100 dark:bg-dark-surface">
                      {TIPOS_DROGA.map(droga => (<div key={droga.key} className="flex items-center justify-between"><label htmlFor={`${muestra.id}-${droga.key}`} className="text-sm text-gray-700 dark:text-dark-text-secondary">{droga.label}:</label><select id={`${muestra.id}-${droga.key}`} value={muestra.resultados[droga.key]} onChange={(e) => handleMuestraChange(index, 'resultados', e.target.value, droga.key)} className="form-select-sm"><option value="NEGATIVO">NEGATIVO</option><option value="POSITIVO">POSITIVO</option></select></div>))}
                    </div>
                  </div>
                </div>
                <button type="button" onClick={() => removeMuestra(index)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20" title="Eliminar muestra"><DeleteIcon /></button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addMuestra} className="mt-4 btn-secondary text-sm">+ Agregar Muestra Encontrada</button>
        </div>
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-md border dark:border-dark-border">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b dark:border-dark-border pb-3">Paso 4: Conclusiones Adicionales</h3>
          <div className="flex items-center">
            <input type="checkbox" id="muestrasAgotadas" checked={muestrasAgotadas} onChange={(e) => setMuestrasAgotadas(e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-pnp-green-dark focus:ring-pnp-green-dark" />
            <label htmlFor="muestrasAgotadas" className="ml-3 block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">¿Las muestras se agotaron durante el análisis?</label>
          </div>
        </div>
        <div className="flex flex-wrap justify-end items-center gap-3 pt-6 border-t dark:border-dark-border">
          <button type="button" onClick={() => navigate('/perito/dashboard')} className="btn-secondary"><CancelarIcon /><span>Cancelar</span></button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-2">
            <GuardarIcon />
            <span>{isSubmitting ? 'Guardando...' : 'Finalizar Análisis'}</span>
          </button>
        </div>
      </form>
      {isPreviewModalOpen && (<PDFPreviewModal pdfUrl={pdfUrl} onClose={() => setIsPreviewModalOpen(false)} />)}
    </>
  );
};

export default ProcedimientoAnalisisTM;
