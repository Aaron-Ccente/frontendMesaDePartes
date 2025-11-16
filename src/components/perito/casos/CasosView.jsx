import { useState, useEffect, useCallback } from 'react';
import { OficioAssignedPeritoService } from '../../../services/oficioAssignedPerito.js';
import { OficiosService } from '../../../services/oficiosService.js';
import CasoCard from './CasoCard';
import DerivacionModal from '../DerivacionModal';
import { toast } from 'sonner';

const CasosView = ({ funcion, title }) => {
  const [casos, setCasos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para el modal de derivación
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedCasoId, setSelectedCasoId] = useState(null);
  const [isDeriving, setIsDeriving] = useState(false);

  const fetchCasos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await OficioAssignedPeritoService.getCasosPorFuncion(funcion);
      if (response.success) {
        setCasos(response.data);
      } else {
        throw new Error(response.message || 'Error al obtener los casos');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [funcion]);

  useEffect(() => {
    fetchCasos();
  }, [fetchCasos]);

  // --- Lógica del Modal de Derivación ---

  const handleDerivarClick = (casoId) => {
    setSelectedCasoId(casoId);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isDeriving) return; // Evitar cerrar mientras se procesa
    setModalOpen(false);
    setSelectedCasoId(null);
  };

  const handlePeritoSelect = async (perito) => {
    if (!selectedCasoId || !perito.id_usuario) return;
    
    setIsDeriving(true);
    toast.info('Derivando caso...');

    try {
      // Aquí usamos el servicio para llamar al endpoint de derivación del backend
      const response = await OficiosService.derivarOficio(selectedCasoId, perito.id_usuario, perito.seccion_nombre);
      
      if (response.success) {
        toast.success('Caso derivado exitosamente.');
        handleCloseModal();
        fetchCasos(); // Recargar la lista de casos
      } else {
        throw new Error(response.message || 'Error al derivar el caso.');
      }
    } catch (err) {
      console.error('Error en handlePeritoSelect:', err);
      toast.error(err.message || 'Ocurrió un error inesperado.');
    } finally {
      setIsDeriving(false);
    }
  };


  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-dark-surface rounded-2xl shadow-lg">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-dark-text-primary mb-6 border-b border-gray-200 dark:border-dark-border pb-4">
        {title}
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
                  onDerivarClick={handleDerivarClick}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-dark-text-secondary py-16">
              <p className="text-lg">No hay casos pendientes en esta categoría.</p>
            </div>
          )}
        </div>
      )}

      {/* Renderizar el modal si está abierto */}
      {isModalOpen && (
        <DerivacionModal 
          casoId={selectedCasoId}
          onClose={handleCloseModal}
          onPeritoSelect={handlePeritoSelect}
        />
      )}
    </div>
  );
};

export default CasosView;
