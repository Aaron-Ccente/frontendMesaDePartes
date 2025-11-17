import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../../hooks/useAuth';
import { OficiosService } from '../../../services/oficiosService';
import { LimpiarIcon, GuardarIcon, CancelarIcon } from '../../../assets/icons/Actions';

const ProcedimientoAnalisisTM = () => {
  const { id: id_oficio } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [oficio, setOficio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [resultadoAnalisis, setResultadoAnalisis] = useState('');
  const [observaciones, setObservaciones] = useState('');

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

  const handleClear = () => {
    if (window.confirm('¿Estás seguro de que deseas limpiar todos los campos del formulario?')) {
      setResultadoAnalisis('');
      setObservaciones('');
      toast.success('Formulario limpiado.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resultadoAnalisis) {
      toast.error('Debe ingresar un resultado para el análisis.');
      return;
    }

    setIsSubmitting(true);
    toast.info('Registrando resultado del análisis...');

    // NOTA: Este es un placeholder. El backend necesita un endpoint para guardar
    // los resultados de un análisis específico. Usaremos un servicio ficticio por ahora.
    try {
      // const payload = { tipo_resultado: 'SARRO_UNGUEAL', resultados: { resultado: resultadoAnalisis, observaciones } };
      // await OficiosService.addResultadoOficio(id_oficio, payload);
      
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Resultado del análisis guardado exitosamente.');
      navigate('/perito/dashboard/mis-casos/analisis-tm');

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

      <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-md border dark:border-dark-border space-y-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b dark:border-dark-border pb-3">Registro del Análisis</h3>
        
        <div className="p-4 border rounded-lg dark:border-dark-border">
            <h4 className="text-lg font-semibold text-gray-700 dark:text-dark-text-primary mb-4">1. Resultado del Análisis de Sarro Ungueal</h4>
            <div>
                <label htmlFor="resultadoAnalisis" className="block text-sm font-medium text-gray-600 dark:text-dark-text-secondary">Resultado</label>
                <input
                id="resultadoAnalisis"
                type="text"
                value={resultadoAnalisis}
                onChange={(e) => setResultadoAnalisis(e.target.value)}
                placeholder="Ej: POSITIVO para Cannabis Sativa (Marihuana)"
                className="mt-1 form-input w-full"
                required
                />
            </div>
        </div>

        <div className="p-4 border rounded-lg dark:border-dark-border">
            <h4 className="text-lg font-semibold text-gray-700 dark:text-dark-text-primary mb-2">2. Observaciones</h4>
            <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows="4"
                placeholder="Detalles relevantes del análisis..."
                className="mt-1 form-input w-full"
            />
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
            type="submit" 
            disabled={isSubmitting} 
            className="btn-primary"
        >
            <GuardarIcon />
            <span>{isSubmitting ? 'Guardando...' : 'Finalizar y Guardar Análisis'}</span>
        </button>
      </div>
    </form>
  );
};

export default ProcedimientoAnalisisTM;

