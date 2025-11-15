import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MesaDePartesService from '../../services/mesadepartesService';
import FlechaAbajo from '../../assets/icons/FlechaAbajo';

// --- Iconos para la Línea de Tiempo ---
const IconoCrear = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>;
const IconoVisto = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>;
const IconoProceso = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h13.5m-13.5 0a2.25 2.25 0 0 1-2.25-2.25V3.75c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v2.25a2.25 2.25 0 0 1-2.25 2.25m-13.5 0v11.25c0 1.24 1.01 2.25 2.25 2.25h9c1.24 0 2.25-1.01 2.25-2.25V8.25" /></svg>;
const IconoDerivar = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" /></svg>;
const IconoFinalizado = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;

const TimelineIcon = ({ estado }) => {
  const upperEstado = estado?.toUpperCase() || '';
  if (upperEstado.includes('CREACION')) return <IconoCrear />;
  if (upperEstado.includes('VISTO')) return <IconoVisto />;
  if (upperEstado.includes('PROCESO')) return <IconoProceso />;
  if (upperEstado.includes('DERIVADO')) return <IconoDerivar />;
  if (upperEstado.includes('COMPLETADO') || upperEstado.includes('CERRADO')) return <IconoFinalizado />;
  return <IconoFinalizado />;
};

const getStatusInfo = (evento) => {
    const upperEstado = evento?.estado_nuevo?.toUpperCase() || 'PENDIENTE';
    const seccion = evento?.nombre_seccion_usuario || '';

    if (upperEstado.includes('CREACION')) return { title: 'Creado', subtitle: 'Por Mesa de Partes' };
    if (upperEstado.includes('VISTO')) return { title: 'Visto', subtitle: `Por ${seccion || 'Perito'}` };
    if (upperEstado.includes('PROCESO')) return { title: 'En Proceso', subtitle: `En ${seccion || 'Sección'}` };
    if (upperEstado.startsWith('DERIVADO A:')) return { title: 'Derivado', subtitle: `A ${upperEstado.substring(11)}` };
    if (upperEstado.includes('COMPLETADO')) return { title: 'Finalizado', subtitle: `En ${seccion || 'Sección'}` };
    if (upperEstado.includes('CERRADO')) return { title: 'Cerrado', subtitle: 'Por Mesa de Partes' };
    
    return { title: evento.estado_nuevo, subtitle: '' };
}

// --- Sub-componente de Badge de Estado ---
const EstadoBadge = ({ estado }) => {
  let colorClasses = 'bg-gray-200 text-gray-800';
  let text = estado || 'SIN ESTADO';
  switch (text.toUpperCase()) {
    case 'CREACION DEL OFICIO': colorClasses = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'; text = 'Recién Creado'; break;
    case 'OFICIO VISTO': colorClasses = 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'; text = 'Visto'; break;
    case 'OFICIO EN PROCESO': colorClasses = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'; text = 'En Proceso'; break;
    case 'COMPLETADO': case 'CERRADO': colorClasses = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'; text = 'Finalizado'; break;
    default: if (text.startsWith('DERIVADO A:')) colorClasses = 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'; break;
  }
  return <span className={`px-3 py-1 text-sm font-semibold rounded-full ${colorClasses}`}>{text}</span>;
};

// --- Sub-componente de Línea de Tiempo Horizontal ---
const HorizontalTimeline = ({ historial, currentStepId }) => {
  if (!historial || historial.length === 0) {
    return <p className="text-gray-500 dark:text-dark-text-secondary p-4 text-center">No hay historial de seguimiento.</p>;
  }

  return (
    <div className="w-full overflow-x-auto py-4 px-2">
      <div className="flex justify-center">
        <div className="inline-flex items-start">
          {historial.map((evento, index) => {
            const isCurrent = evento.id_seguimiento === currentStepId;
            const statusInfo = getStatusInfo(evento);
            const iconBg = isCurrent ? 'bg-pnp-green-light' : 'bg-pnp-green';
            const ringClasses = isCurrent ? 'ring-4 ring-pnp-green-light/50 animate-pulse' : 'ring-4 ring-gray-300/50 dark:ring-gray-700/50';

            return (
              <div key={evento.id_seguimiento} className="flex items-start">
                {/* Nodo de información */}
                <div className="relative group flex flex-col items-center text-center flex-shrink-0" style={{width: '150px'}}>
                  <div className={`w-10 h-10 flex items-center justify-center ${iconBg} rounded-full z-10 text-white shadow-md ${ringClasses}`}>
                    <TimelineIcon estado={evento.estado_nuevo} />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-gray-800 dark:text-gray-100 uppercase tracking-wider truncate w-full" title={statusInfo.title}>
                    {statusInfo.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate w-full" title={statusInfo.subtitle}>{statusInfo.subtitle}</p>
                  <time className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(evento.fecha_seguimiento).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                  </time>
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-3 w-64 bg-gray-800 text-white text-xs rounded-lg py-2 px-3 text-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <p className="font-bold">{evento.estado_nuevo}</p>
                    <p>{new Date(evento.fecha_seguimiento).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}</p>
                    <p className="mt-1">Por: <span className="font-medium">{evento.nombre_usuario}</span></p>
                    {evento.nombre_conductor && <p>Asignado a: <span className="font-medium">{evento.nombre_conductor}</span></p>}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-800"></div>
                  </div>
                </div>

                {/* Línea de conexión */}
                {index < historial.length - 1 && (
                  <div className="w-16 h-1 bg-gray-300 dark:bg-gray-600" style={{marginTop: '1.125rem'}}></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};


// --- Componente Principal ---
const SeguimientoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caso, setCaso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetalle = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await MesaDePartesService.getDetalleCaso(id);
        if (response.error) throw new Error(response.error);
        setCaso(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetalle();
  }, [id]);

  const InfoItem = ({ label, value }) => (
    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-gray-500 dark:text-dark-text-secondary">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900 dark:text-dark-text-primary sm:mt-0 sm:col-span-2">{value || 'N/A'}</dd>
    </div>
  );

  if (loading) {
    return (
      <div className="text-center p-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pnp-green mx-auto"></div><p className="mt-4">Cargando detalles del caso...</p></div>
    );
  }

  if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  if (!caso) return <div className="text-center p-10">No se encontraron los detalles del caso.</div>;

  const currentStep = caso.seguimiento_historial?.[caso.seguimiento_historial.length - 1];

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-dark-bg-tertiary dark:text-gray-200 font-semibold transition-colors">
        <FlechaAbajo className="w-4 h-4 transform rotate-90"/> Volver
      </button>

      {/* --- Tarjeta de Cabecera --- */}
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

      {/* --- Línea de Tiempo Horizontal --- */}
      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-lg border dark:border-dark-border">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white p-4 border-b dark:border-dark-border">Línea de Tiempo</h3>
        <HorizontalTimeline historial={caso.seguimiento_historial} currentStepId={currentStep?.id_seguimiento} />
      </div>

      {/* --- Tarjetas de Detalles --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-lg border dark:border-dark-border">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white border-b dark:border-dark-border pb-3 mb-4">Detalles del Oficio</h3>
          <dl>
            <InfoItem label="Unidad Solicitante" value={caso.unidad_solicitante} />
            <InfoItem label="Remitente" value={caso.unidad_remitente} />
            <InfoItem label="Fecha de Incidente" value={new Date(caso.fecha_hora_incidente).toLocaleString('es-ES')} />
            <InfoItem label="Prioridad" value={caso.nombre_prioridad} />
            <InfoItem label="Tipos de Examen" value={caso.tipos_de_examen.join(', ')} />
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
