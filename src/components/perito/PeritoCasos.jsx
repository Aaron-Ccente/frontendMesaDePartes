import { useState, useEffect } from 'react';
import { OficioAssignedPeritoService } from '../../services/oficioAssignedPerito';
import ShowToast from '../ui/ShowToast';

const PeritoCasos = () => {
  const [casos, setCasos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    loadCasos();
  }, []);

  const loadCasos = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await OficioAssignedPeritoService.getAssignedOficios();
      setCasos(result.data || []);
    } catch (err) {
      setError(err.message || 'Error al cargar casos');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (id_oficio, estado_actual) => {
    try {
      setResponding(true);
      setError(null);

      // Determinar siguiente estado según el actual
      let nuevo_estado = 'OFICIO VISTO';
      if (estado_actual === 'CREACION DEL OFICIO') {
        nuevo_estado = 'OFICIO VISTO';
      } else if (estado_actual === 'OFICIO VISTO') {
        nuevo_estado = 'OFICIO EN PROCESO';
      } else if (estado_actual === 'OFICIO EN PROCESO') {
        nuevo_estado = 'COMPLETADO';
      }

      await OficioAssignedPeritoService.respondToOficio(
        id_oficio,
        nuevo_estado,
        estado_actual
      );

      await loadCasos(); // Recargar casos
      setError({ type: 'success', message: 'Estado actualizado exitosamente' });
    } catch (err) {
      setError(err.message || 'Error al responder');
    } finally {
      setResponding(false);
    }
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'CREACION DEL OFICIO': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'OFICIO VISTO': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'OFICIO EN PROCESO': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'COMPLETADO': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getNextActionLabel = (estado_actual) => {
    switch (estado_actual) {
      case 'CREACION DEL OFICIO': return 'Marcar como visto';
      case 'OFICIO VISTO': return 'Iniciar proceso';
      case 'OFICIO EN PROCESO': return 'Marcar completado';
      case 'COMPLETADO': return 'Completado';
      default: return 'Actualizar estado';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-[#1a4d2e] dark:text-green-400 mb-2">
          Mis Casos
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Revisa y gestiona los casos asignados a ti
        </p>
      </div>

      {/* Feedback */}
      {error && (
        <ShowToast
          type={error.type || 'error'}
          message={error.message}
          onClose={() => setError(null)}
        />
      )}

      {/* Cases List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d2e]"></div>
          </div>
        ) : casos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No tienes casos asignados actualmente.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {casos.map((caso) => (
              <div key={caso.id_oficio} className="border dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                      Oficio N° {caso.numero_oficio}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(caso.fecha_creacion).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(caso.ultimo_estado)}`}>
                    {caso.ultimo_estado}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Unidad Solicitante</p>
                    <p className="font-medium dark:text-gray-200">{caso.unidad_solicitante}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Especialidad</p>
                    <p className="font-medium dark:text-gray-200">{caso.especialidad}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tipo de Examen</p>
                    <p className="font-medium dark:text-gray-200">{caso.tipo_examen}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Prioridad</p>
                    <p className="font-medium dark:text-gray-200">{caso.nombre_prioridad}</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => handleRespond(caso.id_oficio, caso.ultimo_estado)}
                    disabled={responding || caso.ultimo_estado === 'COMPLETADO'}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${caso.ultimo_estado === 'COMPLETADO'
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-[#1a4d2e] text-white hover:bg-[#2d7d4a]'}`}
                  >
                    {responding ? 'Actualizando...' : getNextActionLabel(caso.ultimo_estado)}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PeritoCasos;
