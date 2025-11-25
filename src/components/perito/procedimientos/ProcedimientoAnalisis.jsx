import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../../hooks/useAuth';
import { OficiosService } from '../../../services/oficiosService';
import { ProcedimientoService } from '../../../services/procedimientoService';
import { DocumentService } from '../../../services/documentService';
import { GuardarIcon, CancelarIcon, PreviewIcon } from '../../../assets/icons/Actions';
import AddIcon from '../../../assets/icons/AddIcon';
import DeleteIcon from '../../../assets/icons/DeleteIcon';
import PDFPreviewModal from '../../documentos/PDFPreviewModal';
import DetallesCasoHeader from '../common/DetallesCasoHeader';
import SelectField from '../../ui/forms/SelectField';
import TextareaField from '../../ui/forms/TextareaField';
import { 
    TIPOS_DE_MUESTRA, 
    EXAMEN_A_TIPO_MUESTRA, 
    OBJETO_PERICIA_DEFAULTS, 
    METODO_UTILIZADO_DEFAULTS, 
} from '../../../utils/constants';
import ResultadosSarroUngueal from './resultados/ResultadosSarroUngueal.jsx';
import ResultadosDosajeEtilico from './resultados/ResultadosDosajeEtilico.jsx';
import ResultadosToxicologico from './resultados/ResultadosToxicologico.jsx';
import ResultadosAnteriores from './resultados/ResultadosAnteriores.jsx';
import { normalizeString } from '../../../utils/stringUtils.js';

const ProcedimientoAnalisis = () => {
  const { id: id_oficio } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Estados del componente
  const [oficio, setOficio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreationMode, setIsCreationMode] = useState(false);
  const [isFirstPerito, setIsFirstPerito] = useState(false);
  const [canEditSamples, setCanEditSamples] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  // Estados del formulario
  const [aperturaData, setAperturaData] = useState({ descripcion_paquete: '', observaciones: '' });
  const [metadata, setMetadata] = useState({ objeto_pericia: '', metodo_utilizado: '', observaciones_finales: '' });
  const [muestras, setMuestras] = useState([]);
  const [resultadosAnteriores, setResultadosAnteriores] = useState([]);
  const [muestrasAgotadas, setMuestrasAgotadas] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const oficioRes = await OficiosService.getOficioDetalle(id_oficio);
      if (!oficioRes.success) throw new Error(oficioRes.message || 'No se pudieron cargar los detalles del oficio.');
      setOficio(oficioRes.data);

      const procRes = await ProcedimientoService.getDatosAnalisis(id_oficio);
      if (!procRes.success) {
        setIsCreationMode(true);
        const muestrasPrecargadas = oficioRes.data.muestras_registradas || [];
        setMuestras(muestrasPrecargadas.map(m => ({ ...m, resultados: {} })));
        return; 
      }

      const {
        aperturaData: ad,
        metadata: md,
        muestrasAnalizadas: ma,
        resultadosAnteriores: ra,
        muestrasAgotadas: mag,
        tieneResultadosGuardados,
        esPrimerPeritoDelFlujo,
        permiteEditarMuestras,
      } = procRes.data;

      setIsCreationMode(!tieneResultadosGuardados);
      setIsFirstPerito(esPrimerPeritoDelFlujo);
      setCanEditSamples(permiteEditarMuestras);

      setAperturaData(ad || { descripcion_paquete: '', observaciones: '' });
      setMetadata(md || {});
      setMuestras(ma || []);
      setResultadosAnteriores(ra || []);
      setMuestrasAgotadas(!!mag);

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
    if (oficio && oficio.tipos_de_examen && !metadata.objeto_pericia && muestras.length > 0) {
      const examenes = oficio.tipos_de_examen || [];
      const objetoPericia = examenes.map(e => OBJETO_PERICIA_DEFAULTS[e]).filter(Boolean).join(' ');
      const metodoUtilizado = examenes.map(e => METODO_UTILIZADO_DEFAULTS[e]).filter(Boolean).join(' ');
      setMetadata(prev => ({ ...prev, objeto_pericia: objetoPericia || '', metodo_utilizado: metodoUtilizado || '' }));
    }
  }, [oficio, metadata.objeto_pericia, muestras]);

  const handleAperturaChange = (e) => setAperturaData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleMetadataChange = (e) => setMetadata(prev => ({ ...prev, [e.target.name]: e.target.value }));
  
  const handleMuestraChange = (id_muestra, field, value) => {
    setMuestras(prevMuestras => 
      prevMuestras.map(m => 
        m.id === id_muestra ? { ...m, [field]: value } : m
      )
    );
  };

  const handleResultadoChange = (id_muestra, newResultados) => {
    setMuestras(prevMuestras =>
      prevMuestras.map(m =>
        m.id === id_muestra ? { ...m, resultados: { ...m.resultados, ...newResultados } } : m
      )
    );
  };

  const handleAddMuestra = () => {
    const examenes = oficio?.tipos_de_examen || [];
    const suggestedTipo = examenes.length > 0 ? (EXAMEN_A_TIPO_MUESTRA[examenes[0]] || '') : '';
    setMuestras(prev => [...prev, {
      id: `temp_${Date.now()}`,
      isNew: true,
      tipo_muestra: suggestedTipo,
      descripcion: '',
      descripcion_detallada: '',
      resultados: {},
    }]);
  };
  
  const handleRemoveMuestra = (id) => {
    setMuestras(prev => prev.filter(m => m.id !== id));
  };
  
  const handleGenerarActa = async () => {
    if (!aperturaData.descripcion_paquete) {
      toast.error('Debe rellenar la descripción del paquete para generar el acta.');
      return;
    }
    toast.info('Generando Acta de Apertura...');
    const data = { aperturaData, muestras };
    const url = await DocumentService.generarActaApertura(id_oficio, data);
    if (url) {
      setPdfUrl(url);
      setIsPreviewModalOpen(true);
      toast.success('Acta generada exitosamente.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isFirstPerito && !aperturaData.descripcion_paquete) {
      return toast.error('Debe describir el estado del paquete recibido, ya que es el primer perito en analizar una muestra remitida.');
    }
    if (muestras.length === 0) return toast.error('Debe registrar al menos una muestra.');
    if (isCreationMode) {
      for (const m of muestras) {
        if (!m.tipo_muestra || !m.descripcion) {
          return toast.error('Todas las muestras nuevas deben tener un tipo y una descripción.');
        }
      }
    }

    setIsSubmitting(true);
    toast.info('Registrando análisis...');

    const payload = { 
      isCreationMode,
      apertura_data: aperturaData, 
      muestras: muestras.map(m => ({
          ...m,
          id: m.isNew ? undefined : m.id,
      })),
      metadata, 
      muestras_agotadas: muestrasAgotadas,
    };

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

  const renderResultados = (muestra) => {
    if (!user || !user.seccion_nombre) return null;
    
    const noAplicable = muestra.resultados?.no_aplicable || false;
    const commonProps = {
      muestra,
      onChange: (res) => handleResultadoChange(muestra.id, res),
      no_aplicable: noAplicable,
    };

    const seccionNormalizada = normalizeString(user.seccion_nombre);
    switch (seccionNormalizada) {
      case 'TOMA DE MUESTRA':
        return <ResultadosSarroUngueal {...commonProps} />;
      case 'INSTRUMENTALIZACION':
        return <ResultadosDosajeEtilico {...commonProps} />;
      case 'LABORATORIO':
        return <ResultadosToxicologico {...commonProps} />;
      default:
        return <p className="text-red-500">Sección de usuario no reconocida.</p>;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pnp-green-dark"></div></div>;
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8 max-w-6xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text-primary">Procedimiento de Análisis de Muestras</h1>
          <p className="text-lg text-gray-500 dark:text-dark-text-secondary mt-1">Oficio N°: <span className="font-semibold text-pnp-green-dark dark:text-dark-pnp-green">{oficio?.numero_oficio}</span></p>
        </div>
        
        <DetallesCasoHeader oficio={oficio} />

        {(oficio?.tipo_de_muestra === 'MUESTRAS REMITIDAS' && isFirstPerito) && (
          <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-md border dark:border-dark-border space-y-6">
            <div className="flex justify-between items-center border-b dark:border-dark-border pb-3">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Paso 1: Apertura del Paquete Lacrado</h3>
              <button type="button" onClick={handleGenerarActa} className="btn-secondary text-sm flex items-center gap-2">
                <PreviewIcon />
                <span>Generar Acta</span>
              </button>
            </div>
            <TextareaField
              label="Descripción del Paquete Recibido"
              name="descripcion_paquete"
              value={aperturaData.descripcion_paquete}
              onChange={handleAperturaChange}
              rows={2}
              placeholder="Ej: Sobre manila A4 lacrado con cinta de embalaje, sin signos de alteración."
              required={isFirstPerito}
            />
            <TextareaField
              label="Observaciones de la Apertura (Opcional)"
              name="observaciones"
              value={aperturaData.observaciones}
              onChange={handleAperturaChange}
              rows={2}
              placeholder="Detalles relevantes observados durante la apertura..."
            />
          </div>
        )}

        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-md border dark:border-dark-border space-y-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white border-b dark:border-dark-border pb-3">Paso 2: Datos del Informe Pericial</h3>
          <TextareaField
            label="Objeto de la Pericia"
            name="objeto_pericia"
            value={metadata.objeto_pericia}
            onChange={handleMetadataChange}
            rows={2}
            placeholder="Ej: Identificación de sustancias tóxicas y adherencias de drogas ilícitas en muestra biológica."
          />
          <TextareaField
            label="Método Utilizado"
            name="metodo_utilizado"
            value={metadata.metodo_utilizado}
            onChange={handleMetadataChange}
            rows={3}
            placeholder="Ej: Toxicológico: Cromatografía en capa fina, Inmunoensayo. Sarro ungueal: Químico - colorimétrico."
          />
        </div>

        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-md border dark:border-dark-border space-y-6">
          <div className="flex justify-between items-center border-b dark:border-dark-border pb-3">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Paso 3: Registro y Análisis de Muestras</h3>
            <div className="flex items-center gap-4">
              {canEditSamples && (
                  <button type="button" onClick={handleAddMuestra} className="btn-primary text-sm flex items-center gap-2"><AddIcon /><span>Añadir Muestra</span></button>
              )}
              <button type="button" onClick={() => toast.info('Funcionalidad de informe parcial en desarrollo.')} className="btn-secondary text-sm flex items-center gap-2"><PreviewIcon /><span>Informe Parcial</span></button>
            </div>
          </div>
          
          {muestras.length === 0 && (
            <div className="text-center py-6 text-gray-500 dark:text-dark-text-secondary">
                <p>{canEditSamples ? "Haga clic en 'Añadir Muestra' para comenzar el registro." : "No hay muestras para analizar en este caso."}</p>
            </div>
          )}

          <div className="space-y-4">
            {muestras.map((muestra, index) => (
              <div key={muestra.id} className="p-4 bg-gray-50 dark:bg-dark-bg-tertiary rounded-lg border dark:border-dark-border">
                <div className="flex items-start space-x-4">
                  <span className="text-pnp-green-dark dark:text-dark-pnp-green font-bold text-lg pt-2">{index + 1}</span>
                  <div className="flex-grow">
                    {muestra.isNew ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <SelectField label="Tipo de Muestra" name="tipo_muestra" value={muestra.tipo_muestra} onChange={(e) => handleMuestraChange(muestra.id, 'tipo_muestra', e.target.value)} options={TIPOS_DE_MUESTRA.map(t => ({ value: t, label: t }))} required />
                        <TextareaField label="Descripción de la Muestra" name="descripcion" value={muestra.descripcion} onChange={(e) => handleMuestraChange(muestra.id, 'descripcion', e.target.value)} placeholder="Ej: Un (01) frasco..." rows={1} required />
                      </div>
                    ) : (
                      <>
                        <p className="font-semibold">{muestra.tipo_muestra} <span className="font-normal text-gray-500 dark:text-gray-400">- ({muestra.codigo_muestra})</span></p>
                        <p className="text-sm text-gray-600 dark:text-dark-text-secondary">{muestra.descripcion}</p>
                      </>
                    )}
                  </div>
                  {canEditSamples && (
                    <button type="button" onClick={() => handleRemoveMuestra(muestra.id)} className="text-red-500 hover:text-red-700 transition-colors">
                      <DeleteIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <div className="mt-4 pl-10 space-y-4">
                    <ResultadosAnteriores resultados={resultadosAnteriores} id_muestra={muestra.id} />
                    <TextareaField
                      label="Descripción Detallada para el Informe"
                      name="descripcion_detallada"
                      value={muestra.descripcion_detallada || ''}
                      onChange={(e) => handleMuestraChange(muestra.id, 'descripcion_detallada', e.target.value)}
                      placeholder="Ej: Muestra de sangre extraída y conservada en frasco de polipropileno con anticoagulante..."
                      rows={2}
                    />
                    {renderResultados(muestra)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-md border dark:border-dark-border space-y-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b dark:border-dark-border pb-3">Paso 4: Conclusiones Adicionales</h3>
          <div className="flex items-center">
            <input type="checkbox" id="muestrasAgotadas" checked={muestrasAgotadas} onChange={(e) => setMuestrasAgotadas(e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-pnp-green-dark focus:ring-pnp-green-dark" />
            <label htmlFor="muestrasAgotadas" className="ml-3 block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">¿Las muestras se agotaron durante el análisis?</label>
          </div>
          <TextareaField
            label="Observaciones Finales (Opcional)"
            name="observaciones_finales"
            value={metadata.observaciones_finales || ''}
            onChange={handleMetadataChange}
            rows={3}
            placeholder="Añada cualquier observación final relevante para el dictamen consolidado."
          />
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

export default ProcedimientoAnalisis;