import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { OficiosService } from '../../../services/oficiosService';
import { GuardarIcon, CancelarIcon } from '../../../assets/icons/Actions';

const InfoField = ({ label, value }) => (
  <div>
    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">{label}</h4>
    <p className="text-base text-gray-800 dark:text-gray-200">{value || 'No especificado'}</p>
  </div>
);

const PlaceholderProcedimiento = ({ pageTitle, onSave, saveButtonText = 'Guardar y Finalizar' }) => {
  const { id: id_oficio } = useParams();
  const navigate = useNavigate();

  const [oficio, setOficio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadOficio = useCallback(async () => {
    try {
      setLoading(true);
      const res = await OficiosService.getOficioDetalle(id_oficio);
      if (res.success) {
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
    loadOficio();
  }, [loadOficio]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    toast.info('Guardando procedimiento...');
    try {
      // onSave es la función que se pasa como prop, que llama al servicio correcto
      const res = await onSave(id_oficio);
      if (res.success) {
        toast.success(res.message || 'Procedimiento guardado exitosamente.');
        navigate('/perito/dashboard');
      } else {
        throw new Error(res.message || 'Ocurrió un error desconocido al guardar.');
      }
    } catch (error) {
      toast.error(`Error al guardar: ${error.message}`);
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

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Cabecera */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text-primary">
          {pageTitle}
        </h1>
        <p className="text-lg text-gray-500 dark:text-dark-text-secondary mt-1">
          Oficio N°: <span className="font-semibold text-pnp-green-dark dark:text-dark-pnp-green">{oficio?.numero_oficio}</span>
        </p>
      </div>

      {/* Detalles del Caso */}
      <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-md border dark:border-dark-border">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b dark:border-dark-border pb-3">Detalles del Caso</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoField label="Asunto" value={oficio?.asunto} />
              <InfoField label="Implicado" value={oficio?.examinado_incriminado} />
              <InfoField label="Delito" value={oficio?.delito} />
              <InfoField label="Tipos de Examen" value={oficio?.tipos_de_examen?.join(', ')} />
              <InfoField label="Perito Asignado" value={oficio?.perito_asignado} />
              <InfoField label="Prioridad" value={oficio?.nombre_prioridad} />
          </div>
      </div>

      {/* Formulario Placeholder */}
      <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-md border dark:border-dark-border text-center">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            Formulario en Construcción
          </h3>
          <p className="text-gray-600 dark:text-dark-text-secondary mb-6">
            La funcionalidad detallada para este procedimiento se implementará a futuro. <br/>
            Presione "Guardar" para completar este paso y continuar con el flujo de trabajo.
          </p>
      </div>
      
      {/* Botones de Acción */}
      <div className="flex flex-wrap justify-end items-center gap-3 pt-6 border-t dark:border-dark-border">
          <button 
              type="button" 
              onClick={() => navigate('/perito/dashboard')} 
              className="btn-secondary"
              disabled={isSubmitting}
          >
              <CancelarIcon />
              <span>Cancelar</span>
          </button>
          <button 
              type="button" 
              onClick={handleSubmit} 
              disabled={isSubmitting} 
              className="btn-primary"
          >
              <GuardarIcon />
              <span>{isSubmitting ? 'Guardando...' : saveButtonText}</span>
          </button>
      </div>
    </div>
  );
};

export default PlaceholderProcedimiento;
