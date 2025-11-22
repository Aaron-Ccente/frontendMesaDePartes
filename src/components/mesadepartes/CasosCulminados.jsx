import { useState, useEffect, useCallback } from 'react';
import MesaDePartesService from '../../services/mesadepartesService';
import CasoCard from '../perito/casos/CasoCard';
import { toast } from 'sonner';

const CasosCulminados = () => {
  const [casos, setCasos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCasosCulminados = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await MesaDePartesService.getCasosCulminados();
      if (response.data) {
        setCasos(response.data);
      } else {
        throw new Error(response.error || 'Error al obtener los casos culminados');
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCasosCulminados();
  }, [fetchCasosCulminados]);

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-dark-surface rounded-2xl shadow-lg">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-dark-text-primary mb-6 border-b border-gray-200 dark:border-dark-border pb-4">
        Bandeja de Casos Culminados
      </h1>
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d2e] dark:border-dark-pnp-green"></div>
        </div>
      )}
      {error && (
        <div className="text-center text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/20 p-4 rounded-lg">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
        </div>
      )}
      {!loading && !error && (
        <div>
          {casos.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {casos.map((caso) => (
                <CasoCard 
                  key={caso.id_oficio} 
                  caso={caso}
                  // No se pasan props de acción para que la tarjeta sea de solo lectura
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-dark-text-secondary py-16">
              <p className="text-lg">No hay casos culminados para mostrar.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CasosCulminados;
