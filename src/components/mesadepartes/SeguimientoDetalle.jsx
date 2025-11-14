import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MesaDePartesService from '../../services/mesadepartesService';

// Sub-componente para el gráfico de trazabilidad
const TrazabilidadGraph = ({ historial }) => {
  if (!historial || historial.length === 0) {
    return <p className="text-gray-500">No hay historial de seguimiento disponible.</p>;
  }

  return (
    <div className="p-4 bg-gray-50 dark:bg-dark-bg-secondary rounded-lg">
      <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-dark-text-primary">Línea de Tiempo del Caso</h3>
      <div className="flex items-center space-x-2 overflow-x-auto py-2">
        {historial.map((evento, index) => (
          <div key={evento.id_seguimiento} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className="w-5 h-5 bg-pnp-green rounded-full z-10"></div>
              <p className="text-xs text-center mt-2 w-28">{evento.estado_nuevo}</p>
              <p className="text-xs text-gray-500">{new Date(evento.fecha_seguimiento).toLocaleDateString()}</p>
            </div>
            {index < historial.length - 1 && (
              <div className="w-16 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};


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
        if (response.error) {
          throw new Error(response.error);
        }
        setCaso(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetalle();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center p-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pnp-green mx-auto"></div>
        <p className="mt-4">Cargando detalles del caso...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  }

  if (!caso) {
    return <div className="text-center p-10">No se encontraron los detalles del caso.</div>;
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/mesadepartes/dashboard/seguimiento/casos')}
        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-dark-bg-tertiary dark:text-gray-200 font-semibold"
      >
        &larr; Volver a la lista
      </button>

      <div className="bg-white dark:bg-dark-surface p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">Oficio N°: {caso.numero_oficio}</h1>
        <p className="text-sm text-gray-500 mb-4">ID del Caso: {caso.id_oficio}</p>

        {/* Gráfico de Trazabilidad */}
        <div className="mb-6">
          <TrazabilidadGraph historial={caso.seguimiento_historial} />
        </div>

        {/* Detalles del Caso */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-lg border-b pb-2 dark:border-dark-border">Detalles Generales</h3>
            <p><strong>Asunto:</strong> {caso.asunto}</p>
            <p><strong>Administrado:</strong> {caso.examinado_incriminado}</p>
            <p><strong>DNI:</strong> {caso.dni_examinado_incriminado}</p>
            <p><strong>Unidad Solicitante:</strong> {caso.unidad_solicitante}</p>
            <p><strong>Fecha de Incidente:</strong> {new Date(caso.fecha_hora_incidente).toLocaleString()}</p>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold text-lg border-b pb-2 dark:border-dark-border">Asignación y Estado</h3>
            <p><strong>Creado por:</strong> {caso.nombre_creador}</p>
            <p><strong>Fecha de Creación:</strong> {new Date(caso.fecha_creacion).toLocaleString()}</p>
            <p><strong>Perito Asignado Actualmente:</strong> {caso.nombre_perito_actual}</p>
            <p><strong>Especialidad Requerida:</strong> {caso.especialidad}</p>
            <p><strong>Prioridad:</strong> {caso.nombre_prioridad}</p>
            <p><strong>Tipos de Examen:</strong> {caso.tipos_de_examen.join(', ')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeguimientoDetalle;
