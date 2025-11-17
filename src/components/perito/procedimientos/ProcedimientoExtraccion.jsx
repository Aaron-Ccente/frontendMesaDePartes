import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../../hooks/useAuth';
import { OficiosService } from '../../../services/oficiosService';
import { ProcedimientoService } from '../../../services/procedimientoService';
import { generarActaExtraccion } from '../../documentos/GeneradorActa';
import PDFPreviewModal from '../../documentos/PDFPreviewModal';
import DeleteIcon from '../../../assets/icons/DeleteIcon';
import { LimpiarIcon, PreviewIcon, GuardarIcon, CancelarIcon } from '../../../assets/icons/Actions';


const ProcedimientoExtraccion = () => {
  const { id: id_oficio } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Estados del componente
  const [oficio, setOficio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados del formulario
  const [fueExitosa, setFueExitosa] = useState(true);
  const [observaciones, setObservaciones] = useState('');
  const [muestras, setMuestras] = useState([{ id: Date.now(), descripcion: '', cantidad: '' }]);

  // Estados del modal de vista previa
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleMuestraChange = (index, field, value) => {
    const newMuestras = [...muestras];
    newMuestras[index][field] = value;
    setMuestras(newMuestras);
  };

  const addMuestra = () => {
    setMuestras([...muestras, { id: Date.now(), descripcion: '', cantidad: '' }]);
  };

  const removeMuestra = (index) => {
    if (muestras.length > 1) {
      const newMuestras = muestras.filter((_, i) => i !== index);
      setMuestras(newMuestras);
    } else {
      toast.error('Debe haber al menos una muestra.');
    }
  };

  const handleClear = () => {
    if (window.confirm('¿Estás seguro de que deseas limpiar todos los campos del formulario?')) {
      setFueExitosa(true);
      setObservaciones('');
      setMuestras([{ id: Date.now(), descripcion: '', cantidad: '' }]);
      toast.success('Formulario limpiado.');
    }
  };

  const handlePreview = async () => {
    if (!oficio || !user) {
      toast.error('Los datos del oficio o del perito no están cargados.');
      return;
    }
    
    const datosParaActa = {
      oficio,
      perito: user,
      muestras,
      observaciones,
      fue_exitosa: fueExitosa,
    };

    try {
      toast.info('Generando vista previa...');
      const url = await generarActaExtraccion(datosParaActa);
      setPdfUrl(url);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      toast.error(`No se pudo generar la vista previa: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    toast.info('Registrando procedimiento...');

    const payload = {
      fue_exitosa: fueExitosa,
      observaciones,
      muestras: fueExitosa ? muestras.filter(m => m.descripcion && m.cantidad) : [],
    };

    if (fueExitosa && payload.muestras.length === 0) {
        toast.error('Debe registrar al menos una muestra válida para una extracción exitosa.');
        setIsSubmitting(false);
        return;
    }

    try {
      const res = await ProcedimientoService.registrarExtraccion(id_oficio, payload);
      if (res.success) {
        toast.success(res.message);
        navigate('/perito/dashboard/mis-casos/extraccion');
      } else {
        throw new Error(res.message);
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
        {/* Cabecera */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text-primary">
            Procedimiento de Extracción de Muestra
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
                <InfoField label="Perito Asignado" value={oficio?.nombre_perito_actual} />
                <InfoField label="Prioridad" value={oficio?.nombre_prioridad} />
            </div>
        </div>

        {/* Formulario del Procedimiento */}
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-md border dark:border-dark-border space-y-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b dark:border-dark-border pb-3">Registro del Procedimiento</h3>
            
            {/* Resultado del Procedimiento */}
            <div className="p-4 border rounded-lg dark:border-dark-border">
                <h4 className="text-lg font-semibold text-gray-700 dark:text-dark-text-primary mb-4">1. Resultado del Procedimiento</h4>
                <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20">
                        <input type="radio" name="resultado" checked={fueExitosa} onChange={() => setFueExitosa(true)} className="h-5 w-5 text-pnp-green-dark focus:ring-pnp-green-light" />
                        <span className="text-base font-medium text-gray-700 dark:text-dark-text-primary">Extracción Exitosa</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20">
                        <input type="radio" name="resultado" checked={!fueExitosa} onChange={() => setFueExitosa(false)} className="h-5 w-5 text-red-600 focus:ring-red-500" />
                        <span className="text-base font-medium text-gray-700 dark:text-dark-text-primary">Extracción Fallida</span>
                    </label>
                </div>
            </div>

            {/* Muestras Recolectadas */}
            {fueExitosa && (
                <div className="p-4 border rounded-lg dark:border-dark-border">
                    <h4 className="text-lg font-semibold text-gray-700 dark:text-dark-text-primary mb-4">2. Muestras Recolectadas</h4>
                    <div className="space-y-4">
                        {muestras.map((muestra, index) => (
                        <div key={muestra.id} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-dark-bg-tertiary rounded-lg border dark:border-dark-border">
                            <span className="text-pnp-green-dark dark:text-dark-pnp-green font-bold text-lg pt-2">{index + 1}</span>
                            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-dark-text-secondary">Descripción de la Muestra</label>
                                <input type="text" value={muestra.descripcion} onChange={(e) => handleMuestraChange(index, 'descripcion', e.target.value)} placeholder="Ej: Frasco de plástico con orina" className="mt-1 form-input" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-dark-text-secondary">Cantidad / Volumen</label>
                                <input type="text" value={muestra.cantidad} onChange={(e) => handleMuestraChange(index, 'cantidad', e.target.value)} placeholder="Ej: 50 ml aprox." className="mt-1 form-input" required />
                            </div>
                            </div>
                            <button type="button" onClick={() => removeMuestra(index)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors" title="Eliminar muestra">
                            <DeleteIcon />
                            </button>
                        </div>
                        ))}
                    </div>
                    <button type="button" onClick={addMuestra} className="mt-4 btn-secondary text-sm">
                        + Agregar Muestra
                    </button>
                </div>
            )}

            {/* Observaciones */}
            <div className="p-4 border rounded-lg dark:border-dark-border">
                <h4 className="text-lg font-semibold text-gray-700 dark:text-dark-text-primary mb-2">{fueExitosa ? '3. Observaciones Adicionales' : '2. Motivo de la Falla'}</h4>
                <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} rows="4" placeholder={fueExitosa ? 'Detalles relevantes del procedimiento...' : 'Especifique por qué no se pudo realizar la extracción...'} className="mt-1 form-input w-full" required={!fueExitosa} />
            </div>
        </div>

        {/* Botones de Acción */}
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
                type="button" 
                onClick={handlePreview} 
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors text-pnp-green-dark border border-pnp-green-dark hover:bg-green-50 dark:text-dark-pnp-green dark:border-dark-pnp-green dark:hover:bg-dark-pnp-green/10"
            >
                <PreviewIcon />
                <span>Vista Previa</span>
            </button>
            <button 
                type="submit" 
                disabled={isSubmitting} 
                className="btn-primary"
            >
                <GuardarIcon />
                <span>{isSubmitting ? 'Guardando...' : 'Finalizar y Guardar'}</span>
            </button>
        </div>
      </form>

      {isModalOpen && (
        <PDFPreviewModal pdfUrl={pdfUrl} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
};

export default ProcedimientoExtraccion;

