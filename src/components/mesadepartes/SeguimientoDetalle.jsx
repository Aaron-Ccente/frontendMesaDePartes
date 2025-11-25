import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MesaDePartesService from '../../services/mesadepartesService';
import FlechaAbajo from '../../assets/icons/FlechaAbajo';
import { toast } from 'sonner';
import { DownloadIcon, SendIcon } from '../../assets/icons/Actions';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

// --- Componente Principal ---
const SeguimientoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caso, setCaso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [finalFiles, setFinalFiles] = useState([]);
  const [isArchiving, setIsArchiving] = useState(false);
  const [caratulaFormData, setCaratulaFormData] = useState({});
  const [isCaratulaLoading, setIsCaratulaLoading] = useState(false);


  useEffect(() => {
    const fetchDetalle = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await MesaDePartesService.getDetalleCaso(id);
        if (response.error) throw new Error(response.error);
        setCaso(response.data);

        // Pre-fill caratula form data
        const oficio = response.data;
        const peritoAsignado = oficio.perito_asignado;
        setCaratulaFormData({
            lugarFecha: `Huancayo, ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`,
            numOficio: oficio.numero_oficio.split('/').slice(0, -1).join('/') + '/ING.', // Adaptar según sea necesario
            membreteComando: "Comando de Operaciones Policiales",
            membreteDireccion: "Dirección Nacional de Orden y Seguridad",
            membreteRegion: "Región Policial Junín",
            destCargo: 'JEFE DE LA OFICRI PNP - HYO', // Dato quemado, ajustar si es dinámico
            destNombre: 'Nombre del Jefe', // Dato quemado, ajustar si es dinámico
            destPuesto: '',
            asuntoBase: `Informe Pericial ... por motivo que se indica.`, // Ajustar
            asuntoRemite: 'REMITE',
            referencia: oficio.documento_referencia,
            cuerpoP1_2: `Físico N° ${oficio.numero_oficio.split('-')[0]}`,
            cuerpoP1_4: oficio.muestras_registradas.map((m, i) => `M${i+1}: (${m.descripcion})`).join(', '),
            regNum: '', // Completar si se tiene
            regIniciales: ``,
            firmanteQS: peritoAsignado?.cip || '',
            firmanteNombre: peritoAsignado?.nombre_completo || '',
            firmanteCargo: peritoAsignado?.grado || 'PERITO OFICRI',
            firmanteDependencia: 'OFICRI PNP HUANCAYO',
        });

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetalle();
  }, [id]);
  
  const handleFileChange = (e) => {
    setFinalFiles([...e.target.files]);
  };

  const handleCaratulaDownload = async () => {
    setIsCaratulaLoading(true);
    try {
        const pdfBlob = await MesaDePartesService.generarCaratula(id, caratulaFormData);
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Caratula-${caso.numero_oficio}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        toast.error(`Error al generar carátula: ${error.message}`);
    } finally {
        setIsCaratulaLoading(false);
    }
  };

  const handleArchiveSubmit = async () => {
    if (finalFiles.length === 0) {
      toast.error('Debe seleccionar al menos un documento para archivar.');
      return;
    }
    if (!window.confirm('¿Está seguro de archivar estos documentos? Esta acción es final.')) {
      return;
    }
    setIsArchiving(true);
    try {
      const formData = new FormData();
      finalFiles.forEach(file => {
        formData.append('documentos_finales', file);
      });
      const res = await MesaDePartesService.uploadDocumentosFinales(id, formData);
      if (res.success) {
        toast.success('Caso archivado exitosamente.');
        navigate('/mesadepartes/dashboard');
      } else {
        throw new Error(res.message || 'Error al archivar.');
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsArchiving(false);
    }
  };

  const InfoItem = ({ label, value }) => (
    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-gray-500 dark:text-dark-text-secondary">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900 dark:text-dark-text-primary sm:mt-0 sm:col-span-2">{value || 'N/A'}</dd>
    </div>
  );

  if (loading) return <div className="text-center p-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pnp-green mx-auto"></div><p className="mt-4">Cargando detalles del caso...</p></div>;
  if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  if (!caso) return <div className="text-center p-10">No se encontraron los detalles del caso.</div>;

  const currentStep = caso.seguimiento_historial?.[caso.seguimiento_historial.length - 1];
  const isReadyForPickup = currentStep?.estado_nuevo === 'LISTO_PARA_RECOJO';

  const EstadoBadge = ({ estado }) => {
    let colorClasses = 'bg-gray-200 text-gray-800';
    let text = estado || 'SIN ESTADO';
    const upperText = text.toUpperCase();
  
    switch (true) {
      case upperText.includes('CREACION'): colorClasses = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'; text = 'Recién Creado'; break;
      case upperText.includes('VISTO'): colorClasses = 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'; text = 'Visto'; break;
      case upperText.includes('PROCESO'): colorClasses = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'; text = 'En Proceso'; break;
      case upperText.includes('LISTO_PARA_RECOJO'): colorClasses = 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300'; text = 'Listo para Recojo'; break;
      case upperText.includes('COMPLETADO') || upperText.includes('CERRADO') || upperText.includes('DICTAMEN') || upperText.includes('ENTREGADO'): colorClasses = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'; text = 'Finalizado'; break;
      case upperText.startsWith('DERIVADO'): colorClasses = 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'; break;
    }
    return <span className={`px-3 py-1 text-sm font-semibold rounded-full ${colorClasses}`}>{text}</span>;
  };

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-dark-bg-tertiary dark:text-gray-200 font-semibold transition-colors">
        <FlechaAbajo className="w-4 h-4 transform rotate-90"/> Volver
      </button>

      {/* Tarjeta de Cabecera */}
      <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-lg border dark:border-dark-border">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
                <p className="text-sm text-pnp-green-light font-semibold">Oficio N°: {caso.numero_oficio}</p>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">{caso.asunto}</h1>
            </div>
            <div className="flex-shrink-0 pt-1">
                <EstadoBadge estado={currentStep?.estado_nuevo} />
            </div>
        </div>
      </div>

      {/* Acciones de Entrega y Archivado (NUEVA SECCIÓN) */}
      {isReadyForPickup && (
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-lg border-2 border-pnp-green-light dark:border-pnp-green-dark">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white border-b dark:border-dark-border pb-3 mb-4">Acciones de Entrega y Archivado</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">1. Descargar Documentos para Entrega</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Descargue e imprima estos documentos para la entrega física.</p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={handleCaratulaDownload}
                  disabled={isCaratulaLoading}
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  <DownloadIcon />
                  {isCaratulaLoading ? 'Generando...' : 'Descargar Carátula'}
                </button>
                {caso.informe_pericial_firmado_path ? (
                  <a 
                    href={`${API_BASE_URL}/${caso.informe_pericial_firmado_path}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <DownloadIcon />
                    Descargar Informe Firmado
                  </a>
                ) : <p className="text-sm text-red-500">No se encontró el informe firmado.</p>}
              </div>
            </div>
            <div className="border-t dark:border-dark-border pt-6">
              <h4 className="font-semibold mb-2">2. Subir Documentos Finales Escaneados</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Una vez completada la entrega física, escanee y suba los documentos firmados y sellados para archivar el caso.</p>
              <input 
                type="file" 
                multiple 
                onChange={handleFileChange} 
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pnp-green-light/20 file:text-pnp-green-dark hover:file:bg-pnp-green-light/30"
              />
              {finalFiles.length > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  {finalFiles.length} archivo(s) seleccionados: {finalFiles.map(f => f.name).join(', ')}
                </div>
              )}
            </div>
            <div className="flex justify-end pt-4">
              <button 
                onClick={handleArchiveSubmit}
                disabled={isArchiving || finalFiles.length === 0}
                className="btn-success inline-flex items-center gap-2"
              >
                <SendIcon />
                {isArchiving ? 'Archivando...' : 'Archivar Caso'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tarjetas de Detalles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-lg border dark:border-dark-border">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white border-b dark:border-dark-border pb-3 mb-4">Detalles del Oficio</h3>
          <dl>
            <InfoItem label="Unidad Solicitante" value={caso.unidad_solicitante} />
            <InfoItem label="Fecha de Incidente" value={new Date(caso.fecha_hora_incidente).toLocaleString('es-ES')} />
            <InfoItem label="Prioridad" value={caso.nombre_prioridad} />
            <InfoItem label="Tipos de Examen" value={caso.tipos_de_examen.join(', ')} />
            <InfoItem label="Celular del conductor" value={caso.celular_conductor} />
          </dl>
        </div>
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-lg border dark:border-dark-border">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white border-b dark:border-dark-border pb-3 mb-4">Información del Implicado</h3>
          <dl>
            <InfoItem label="Nombre Completo" value={caso.examinado_incriminado} />
            <InfoItem label="DNI" value={caso.dni_examinado_incriminado} />
            <InfoItem label="Delito" value={caso.delito} />
            <InfoItem label="Dirección" value={caso.direccion_implicado} />
            <InfoItem label="Celular" value={caso.celular_implicado} />
          </dl>
        </div>
      </div>
    </div>
  );
};

export default SeguimientoDetalle;
