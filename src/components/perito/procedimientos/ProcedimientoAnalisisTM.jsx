import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../../hooks/useAuth';
import { OficiosService } from '../../../services/oficiosService';
import { ProcedimientoService } from '../../../services/procedimientoService';
import { LimpiarIcon, GuardarIcon, CancelarIcon, PreviewIcon } from '../../../assets/icons/Actions';
import DeleteIcon from '../../../assets/icons/DeleteIcon';
import PDFPreviewModal from '../../documentos/PDFPreviewModal';
import { generarActaApertura, generarInformeSarroUngueal } from '../../documentos/GeneradorDocumentosPericiales';

// --- Constantes para la lógica de negocio ---
const TIPOS_DE_MUESTRA = ['Sangre', 'Orina', 'Hisopo Ungueal', 'Visceras', 'Cabello', 'Otro'];
const EXAMEN_A_TIPO_MUESTRA = {
  'Dosaje Etilico': 'Sangre',
  'Toxicologico': 'Orina',
  'Sarro Ungueal': 'Hisopo Ungueal',
};
// -----------------------------------------

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
  const [muestrasAnalizadas, setMuestrasAnalizadas] = useState([]);

  // Estados del modal de vista previa
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Carga inicial de datos del oficio
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await OficiosService.getOficioDetalle(id_oficio);
      if (res.data) {
        setOficio(res.data);
      } else {
        throw new Error(res.message || 'No se pudieron cargar los detalles del oficio.');
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

  // Efecto para pre-poblar las muestras a analizar
  useEffect(() => {
    if (oficio && oficio.tipos_de_examen) {
      const tiposSugeridos = new Set(
        oficio.tipos_de_examen
          .map(examen => EXAMEN_A_TIPO_MUESTRA[examen])
          .filter(Boolean)
      );

      const muestrasIniciales = [...tiposSugeridos].map(tipo => ({
        id: Date.now() + Math.random(),
        codigo_muestra: '',
        tipo_muestra: tipo,
        resultado_analisis: '',
      }));

      if (muestrasIniciales.length === 0) {
        muestrasIniciales.push({ id: Date.now(), codigo_muestra: '', tipo_muestra: '', resultado_analisis: '' });
      }
      setMuestrasAnalizadas(muestrasIniciales);
    }
  }, [oficio]);

  const handleAperturaChange = (field, value) => {
    setAperturaData(prev => ({ ...prev, [field]: value }));
  };

  const handleMuestraChange = (index, field, value) => {
    const newMuestras = [...muestrasAnalizadas];
    newMuestras[index][field] = value;
    setMuestrasAnalizadas(newMuestras);
  };

  const addMuestra = () => {
    setMuestrasAnalizadas([...muestrasAnalizadas, { id: Date.now(), codigo_muestra: '', tipo_muestra: '', resultado_analisis: '' }]);
  };

  const removeMuestra = (index) => {
    if (muestrasAnalizadas.length > 1) {
      setMuestrasAnalizadas(muestrasAnalizadas.filter((_, i) => i !== index));
    } else {
      toast.error('Debe haber al menos una muestra a analizar.');
    }
  };

  const handlePreview = async (tipo) => {
    if (!oficio || !user) {
      toast.error('Los datos del oficio o del perito no están cargados.');
      return;
    }

    let promise;
    if (tipo === 'Acta de Apertura') {
      promise = generarActaApertura({ oficio, perito: user, aperturaData, muestrasAnalizadas });
    } else if (tipo === 'Informe de Resultados') {
      promise = generarInformeSarroUngueal({ oficio, perito: user, muestrasAnalizadas });
    } else {
      toast.error('Tipo de documento no reconocido.');
      return;
    }

    try {
      toast.info(`Generando vista previa de "${tipo}"...`);
      const url = await promise;
      setPdfUrl(url);
      setIsModalOpen(true);
    } catch (error) {
      console.error(`Error al generar PDF para ${tipo}:`, error);
      toast.error(`No se pudo generar la vista previa: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!aperturaData.descripcion_paquete) {
      toast.error('Debe describir el estado del paquete recibido.');
      return;
    }
    const muestrasValidas = muestrasAnalizadas.filter(m => m.codigo_muestra && m.resultado_analisis);
    if (muestrasValidas.length === 0) {
      toast.error('Debe registrar el análisis de al menos una muestra con su código y resultado.');
      return;
    }

    setIsSubmitting(true);
    toast.info('Registrando análisis...');

    const payload = {
      apertura_data: aperturaData,
      muestras_analizadas: muestrasValidas,
    };

    try {
      const res = await ProcedimientoService.registrarAnalisis(id_oficio, payload);
      if (res.success) {
        toast.success(res.message);
        navigate('/perito/dashboard/mis-casos/analisis-tm');
      } else {
        throw new Error(res.message || 'Ocurrió un error desconocido.');
      }
    } catch (error) {
      toast.error(`Error al registrar: ${error.message}`);
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
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text-primary">
            Procedimiento de Análisis de Muestra (TM)
          </h1>
          <p className="text-lg text-gray-500 dark:text-dark-text-secondary mt-1">
            Oficio N°: <span className="font-semibold text-pnp-green-dark dark:text-dark-pnp-green">{oficio?.numero_oficio}</span>
          </p>
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

        {/* PASO 1: APERTURA */}
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-md border dark:border-dark-border space-y-6">
          <div className="flex justify-between items-center border-b dark:border-dark-border pb-3">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Paso 1: Apertura del Paquete Lacrado</h3>
              <button type="button" onClick={() => handlePreview('Acta de Apertura')} className="btn-secondary text-sm flex items-center gap-2">
                  <PreviewIcon />
                  <span>Acta de Apertura</span>
              </button>
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

        {/* PASO 2: ANÁLISIS */}
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-md border dark:border-dark-border space-y-6">
          <div className="flex justify-between items-center border-b dark:border-dark-border pb-3">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Paso 2: Registro y Análisis de Muestras</h3>
              <button type="button" onClick={() => handlePreview('Informe de Resultados')} className="btn-secondary text-sm flex items-center gap-2">
                  <PreviewIcon />
                  <span>Informe de Resultados</span>
              </button>
          </div>
          <div className="space-y-4">
              {muestrasAnalizadas.map((muestra, index) => (
              <div key={muestra.id} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-dark-bg-tertiary rounded-lg border dark:border-dark-border">
                  <span className="text-pnp-green-dark dark:text-dark-pnp-green font-bold text-lg pt-2">{index + 1}</span>
                  <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-dark-text-secondary">Código de Muestra</label>
                      <input type="text" value={muestra.codigo_muestra} onChange={(e) => handleMuestraChange(index, 'codigo_muestra', e.target.value)} placeholder="Leer y escribir código de la etiqueta" className="mt-1 form-input" required />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-dark-text-secondary">Tipo de Muestra</label>
                      <select value={muestra.tipo_muestra} onChange={(e) => handleMuestraChange(index, 'tipo_muestra', e.target.value)} className="mt-1 form-select" required>
                          <option value="">Seleccione un tipo...</option>
                          {TIPOS_DE_MUESTRA.map(tipo => (<option key={tipo} value={tipo}>{tipo}</option>))}
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-dark-text-secondary">Resultado del Análisis</label>
                      <input type="text" value={muestra.resultado_analisis} onChange={(e) => handleMuestraChange(index, 'resultado_analisis', e.target.value)} placeholder="Ej: POSITIVO para..." className="mt-1 form-input" required />
                  </div>
                  </div>
                  <button type="button" onClick={() => removeMuestra(index)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20" title="Eliminar muestra">
                      <DeleteIcon />
                  </button>
              </div>
              ))}
          </div>
          <button type="button" onClick={addMuestra} className="mt-4 btn-secondary text-sm">
              + Agregar Muestra Encontrada
          </button>
        </div>

        <div className="flex flex-wrap justify-end items-center gap-3 pt-6 border-t dark:border-dark-border">
          <button type="button" onClick={() => navigate('/perito/dashboard')} className="btn-secondary">
              <CancelarIcon />
              <span>Cancelar</span>
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
              <GuardarIcon />
              <span>{isSubmitting ? 'Guardando...' : 'Finalizar y Guardar Análisis'}</span>
          </button>
        </div>
      </form>
      
      {isModalOpen && (
        <PDFPreviewModal pdfUrl={pdfUrl} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
};

export default ProcedimientoAnalisisTM;
