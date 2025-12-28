import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../../hooks/useAuth';
import { OficiosService } from '../../../services/oficiosService';
import { ProcedimientoService } from '../../../services/procedimientoService';
import { DocumentService } from '../../../services/documentService';
import PDFPreviewModal from '../../documentos/PDFPreviewModal';
import DeleteIcon from '../../../assets/icons/DeleteIcon';
import { LimpiarIcon, PreviewIcon, GuardarIcon, CancelarIcon, UploadIcon, DownloadIcon } from '../../../assets/icons/Actions';
import DetallesCasoHeader from '../common/DetallesCasoHeader';
import SelectField from '../../ui/forms/SelectField';
import InputField from '../../ui/forms/InputField';
import TextareaField from '../../ui/forms/TextareaField';
import { TIPOS_DE_MUESTRA, EXAMEN_A_TIPO_MUESTRA, MUESTRA_DEFAULTS } from '../../../utils/constants';
import ConfirmationModal from '../../ui/ConfirmationModal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

const ProcedimientoExtraccion = () => {
  const { id: id_oficio } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const funcion = location.state?.funcion; // 'extraccion' o 'extraccion_y_analisis'

  // Estados del componente
  const [oficio, setOficio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Estados del formulario
  const [fueExitosa, setFueExitosa] = useState(true);
  const [observaciones, setObservaciones] = useState('');
  const [muestras, setMuestras] = useState([]);

  // Estado para manejo de extracción fallida previa
  const [isExtractionFailed, setIsExtractionFailed] = useState(false);
  const [signedFile, setSignedFile] = useState(null);

  // Estados de modales
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);


// Carga inicial de datos: Lógica unificada para modo creación y edición.
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErrors({});

      // 1. Intentar obtener datos de una extracción previa PRIMERO.
      const procRes = await ProcedimientoService.getDatosExtraccion(id_oficio);
      
      // 2. Si hay datos, estamos en MODO EDICIÓN o FINALIZACIÓN DE FALLO.
      if (procRes.success && procRes.data) {
        
        // Verificar si es una extracción fallida
        if (procRes.data.fue_exitosa === false) {
           setIsExtractionFailed(true);
           toast.warning('Este caso tiene una extracción fallida registrada. Proceda a subir el informe firmado.');
        } else {
           toast.info('Modo edición: se han cargado los datos guardados anteriormente.');
        }
        
        // Cargar los datos del procedimiento guardado
        setMuestras(procRes.data.muestras?.map(m => ({ ...m, id: m.id_muestra, errors: {} })) || []);
        setObservaciones(procRes.data.observaciones || '');
        setFueExitosa(procRes.data.fue_exitosa);

        // También necesitamos los datos del oficio para la cabecera
        const oficioRes = await OficiosService.getOficioDetalle(id_oficio);
        if (oficioRes.success) setOficio(oficioRes.data);

        return; // Salir temprano para no ejecutar la lógica de creación.
      }

      // 3. Si no hay datos, estamos en MODO CREACIÓN.
      const oficioRes = await OficiosService.getOficioDetalle(id_oficio);
      if (!oficioRes.success) throw new Error(oficioRes.message || 'No se pudieron cargar los detalles del oficio.');
      
      const oficioData = oficioRes.data;
      setOficio(oficioData);

      if (oficioData && oficioData.tipos_de_examen) {
        const muestrasSugeridas = new Set();
        oficioData.tipos_de_examen.forEach(examen => {
          const tipoMuestraSugerido = Object.keys(EXAMEN_A_TIPO_MUESTRA).find(key => examen.toUpperCase() === key.toUpperCase());
          if (tipoMuestraSugerido) {
            muestrasSugeridas.add(EXAMEN_A_TIPO_MUESTRA[tipoMuestraSugerido]);
          }
        });

        if (muestrasSugeridas.size > 0) {
          const nuevasMuestras = [...muestrasSugeridas].map(tipo => ({
            id: Date.now() + Math.random(),
            tipo_muestra: tipo,
            descripcion: MUESTRA_DEFAULTS[tipo]?.descripcion || '',
            cantidad: MUESTRA_DEFAULTS[tipo]?.cantidad || '',
            errors: {},
          }));
          setMuestras(nuevasMuestras);
        } else {
          setMuestras([{ id: Date.now(), tipo_muestra: '', descripcion: '', cantidad: '', errors: {} }]);
        }
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
    if(newMuestras[index].errors[field]){
        newMuestras[index].errors[field] = null;
    }

    if (field === 'tipo_muestra') {
      const defaults = MUESTRA_DEFAULTS[value];
      if (defaults) {
        newMuestras[index].descripcion = defaults.descripcion;
        newMuestras[index].cantidad = defaults.cantidad;
      }
    }
    
    setMuestras(newMuestras);
  };

  const addMuestra = () => {
    setMuestras([...muestras, { id: Date.now(), tipo_muestra: '', descripcion: '', cantidad: '', errors: {} }]);
  };

  const removeMuestra = (index) => {
    const newMuestras = muestras.filter((_, i) => i !== index);
    setMuestras(newMuestras);
  };

  const handleClear = () => {
    setIsClearModalOpen(true);
  };

  const handleConfirmClear = () => {
    setFueExitosa(true);
    setObservaciones('');
    setMuestras([{ id: Date.now(), tipo_muestra: '', descripcion: '', cantidad: '', errors: {} }]);
    setErrors({});
    toast.success('Formulario limpiado.');
    setIsClearModalOpen(false);
  };

  const handlePreview = async () => {
    if (!oficio || !user) {
      toast.error('Los datos del oficio o del perito no están cargados.');
      return;
    }
    
    const extraData = {
      perito: user,
      muestras,
      observaciones,
      fue_exitosa: fueExitosa,
    };

    const templateName = fueExitosa ? 'tm/acta_extraccion' : 'tm/informe_no_extraccion';
    const toastMessage = fueExitosa ? 'Generando vista previa del Acta de Extracción...' : 'Generando vista previa del Informe de No Extracción...';

    toast.info(toastMessage);
    const url = await DocumentService.getPreviewUrl(id_oficio, templateName, extraData);

    if (url) {
      setPdfUrl(url);
      setIsModalOpen(true);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!fueExitosa && !observaciones.trim()) {
        newErrors.observaciones = 'El motivo de la falla es requerido.';
    }
    
    let muestrasAreValid = true;
    if (fueExitosa) {
        if (muestras.length === 0) {
            muestrasAreValid = false;
        } else {
            const newMuestrasState = [...muestras];
            muestras.forEach((muestra, index) => {
                if (!muestra.tipo_muestra || !muestra.cantidad.trim()) {
                    muestrasAreValid = false;
                    if(!muestra.tipo_muestra) newMuestrasState[index].errors.tipo_muestra = 'Requerido';
                    if(!muestra.cantidad.trim()) newMuestrasState[index].errors.cantidad = 'Requerido';
                }
            });
            setMuestras(newMuestrasState);
        }

        if (!muestrasAreValid) {
            newErrors.muestras = 'Debe registrar al menos una muestra válida (con tipo y cantidad).';
        }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
        toast.error('Por favor, corrija los errores en el formulario.');
        return;
    }

    setIsSubmitting(true);
    toast.info('Guardando procedimiento...');

    const payload = {
      fue_exitosa: fueExitosa,
      observaciones,
      muestras: fueExitosa ? muestras.filter(m => m.tipo_muestra && m.cantidad) : [],
    };

    try {
      let res;
      // Lógica condicional basada en el flujo de trabajo
      if (funcion === 'extraccion_y_analisis') {
        res = await ProcedimientoService.finalizarExtraccionInterna(id_oficio, payload);
      } else {
        res = await ProcedimientoService.registrarExtraccion(id_oficio, payload);
      }

      if (res.success) {
        // Si se guardó como fallida, recargar la página para mostrar la UI de subida de archivos
        if (!fueExitosa) {
            toast.warning('Extracción marcada como fallida. Ahora debe subir el informe firmado para cerrar el caso.');
            loadData(); // Recargar datos para activar isExtractionFailed
        } else {
            toast.success(res.message || 'Procedimiento guardado exitosamente.');
            navigate('/perito/dashboard');
        }
      } else {
        throw new Error(res.message || 'Ocurrió un error desconocido al guardar.');
      }
    } catch (error) {
      toast.error(`Error al guardar: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Manejadores para Extracción Fallida ---

  const handleDownloadFailedReport = () => {
    // Usamos window.open para descargar directamente desde el endpoint
    const token = localStorage.getItem('peritoToken');
    // Construir URL con el token si es necesario o usar fetch con blob (mejor para auth)
    // Usamos fetch blob para pasar el header de autorización
    toast.info('Descargando informe...');
    fetch(`${API_BASE_URL}/api/procedimientos/${id_oficio}/generar-informe-no-extraccion`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(async response => {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Error al descargar el informe');
        }
        return response.blob();
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `informe_no_extraccion_${id_oficio}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    })
    .catch(error => toast.error('Error: ' + error.message));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSignedFile(e.target.files[0]);
    }
  };

  const handleUploadSignedReport = async () => {
    if (!signedFile) {
        toast.error('Debe seleccionar el archivo firmado.');
        return;
    }

    setIsSubmitting(true);
    toast.info('Subiendo informe y cerrando caso...');

    const formData = new FormData();
    formData.append('informe_firmado', signedFile);

    try {
        const res = await ProcedimientoService.uploadInformeFirmado(id_oficio, formData);
        if (res.success) {
            toast.success('Caso cerrado exitosamente. Enviado a Mesa de Partes.');
            navigate('/perito/dashboard');
        } else {
            throw new Error(res.message);
        }
    } catch (error) {
        toast.error('Error al subir informe: ' + error.message);
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

  // --- VISTA PARA EXTRACCIÓN FALLIDA ---
  if (isExtractionFailed) {
      return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-red-600 dark:text-red-500">
                    Extracción de Muestra Fallida
                </h1>
                <p className="text-lg text-gray-500 mt-2">
                    Este caso ha sido marcado como no viable para extracción.
                </p>
            </div>

            <DetallesCasoHeader oficio={oficio} />

            <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-md border dark:border-dark-border space-y-6">
                <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                    <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">Motivo Registrado:</h3>
                    <p className="text-gray-800 dark:text-gray-200 italic">"{observaciones}"</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    {/* Paso 1: Descargar */}
                    <div className="border p-6 rounded-xl flex flex-col items-center text-center space-y-4 hover:shadow-lg transition-shadow bg-gray-50 dark:bg-dark-bg-tertiary dark:border-dark-border">
                        <div className="p-4 bg-white dark:bg-dark-surface rounded-full shadow-sm">
                            <DownloadIcon className="w-8 h-8 text-pnp-green-dark" />
                        </div>
                        <h4 className="font-bold text-lg text-gray-800 dark:text-white">1. Descargar Informe</h4>
                        <p className="text-sm text-gray-500">Descargue el informe generado automáticamente con el motivo de la falla.</p>
                        <button 
                            onClick={handleDownloadFailedReport}
                            className="btn-secondary w-full"
                        >
                            Descargar PDF
                        </button>
                    </div>

                    {/* Paso 2: Subir y Cerrar */}
                    <div className="border p-6 rounded-xl flex flex-col items-center text-center space-y-4 hover:shadow-lg transition-shadow bg-gray-50 dark:bg-dark-bg-tertiary dark:border-dark-border">
                        <div className="p-4 bg-white dark:bg-dark-surface rounded-full shadow-sm">
                            <UploadIcon className="w-8 h-8 text-blue-600" />
                        </div>
                        <h4 className="font-bold text-lg text-gray-800 dark:text-white">2. Subir Informe Firmado</h4>
                        <p className="text-sm text-gray-500">Suba el documento firmado digitalmente para cerrar el caso.</p>
                        
                        <div className="w-full space-y-2">
                             <div className="flex items-center justify-center bg-white dark:bg-dark-surface p-4 rounded-lg border-2 border-dashed dark:border-dark-border">
                                <input 
                                    type="file" 
                                    accept=".pdf" 
                                    onChange={handleFileChange} 
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pnp-green-light file:text-pnp-green-dark hover:file:bg-pnp-green-light/80" 
                                />
                             </div>
                             {signedFile && <p className="text-xs text-pnp-green-dark font-medium">Archivo: {signedFile.name}</p>}
                             {!signedFile && isSubmitting && <p className="text-xs text-red-500">El archivo es obligatorio.</p>}
                        </div>

                        <button 
                            onClick={handleUploadSignedReport}
                            disabled={isSubmitting || !signedFile}
                            className="btn-primary w-full bg-blue-600 hover:bg-blue-700"
                        >
                            {isSubmitting ? 'Procesando...' : 'Finalizar y Cerrar Caso'}
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="flex justify-center">
                 <button 
                    type="button" 
                    onClick={() => navigate('/perito/dashboard')} 
                    className="flex items-center gap-2 px-6 py-2 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
                >
                    <CancelarIcon />
                    <span>Volver al Dashboard</span>
                </button>
            </div>
        </div>
      );
  }

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

        <DetallesCasoHeader oficio={oficio} />

        {/* Formulario del Procedimiento */}
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-md border dark:border-dark-border space-y-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b dark:border-dark-border pb-3">Registro del Procedimiento</h3>
            
            <div className="p-4 border rounded-lg dark:border-dark-border">
                <h4 className="text-lg font-semibold text-gray-700 dark:text-dark-text-primary mb-4">1. Resultado del Procedimiento</h4>
                <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20">
                        <input type="radio" name="resultado" checked={fueExitosa} onChange={() => setFueExitosa(true)} className="h-5 w-5 text-pnp-green-dark dark:text-dark-pnp-green focus:ring-pnp-green-light dark:focus:ring-dark-pnp-green dark:bg-dark-surface" />
                        <span className="text-base font-medium text-gray-700 dark:text-dark-text-primary">Extracción Exitosa</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20">
                        <input type="radio" name="resultado" checked={!fueExitosa} onChange={() => setFueExitosa(false)} className="h-5 w-5 text-red-600 dark:text-red-500 focus:ring-red-500 dark:focus:ring-red-400 dark:bg-dark-surface" />
                        <span className="text-base font-medium text-gray-700 dark:text-dark-text-primary">Extracción Fallida</span>
                    </label>
                </div>
            </div>

            {fueExitosa && (
                <div className="p-4 border rounded-lg dark:border-dark-border">
                    <h4 className="text-lg font-semibold text-gray-700 dark:text-dark-text-primary mb-4">2. Muestras Recolectadas</h4>
                    {errors.muestras && <p className="text-sm text-red-500 mb-2">{errors.muestras}</p>}
                    <div className="space-y-4">
                        {muestras.map((muestra, index) => (
                        <div key={muestra.id} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-dark-bg-tertiary rounded-lg border dark:border-dark-border">
                            <span className="text-pnp-green-dark dark:text-dark-pnp-green font-bold text-lg pt-2">{index + 1}</span>
                            <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4">
                            <SelectField
                                label="Tipo de Muestra"
                                name="tipo_muestra"
                                value={muestra.tipo_muestra}
                                onChange={(e) => handleMuestraChange(index, 'tipo_muestra', e.target.value)}
                                required
                                options={[
                                    { value: '', label: 'Seleccione un tipo...' },
                                    ...TIPOS_DE_MUESTRA.map(tipo => ({ value: tipo, label: tipo }))
                                ]}
                                error={muestra.errors?.tipo_muestra}
                            />
                            <InputField
                                label="Cantidad / Volumen"
                                name="cantidad"
                                value={muestra.cantidad}
                                onChange={(e) => handleMuestraChange(index, 'cantidad', e.target.value)}
                                placeholder="Ej: 50 ml aprox."
                                required
                                error={muestra.errors?.cantidad}
                            />
                            <div className="md:col-span-3">
                                <TextareaField
                                    label="Descripción de la Muestra y Embalaje"
                                    name="descripcion"
                                    value={muestra.descripcion}
                                    onChange={(e) => handleMuestraChange(index, 'descripcion', e.target.value)}
                                    placeholder="Ej: Muestra de sangre venosa extraída del pliegue del codo..."
                                    rows={3}
                                />
                            </div>
                            </div>
                            <button type="button" onClick={() => removeMuestra(index)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20" title="Eliminar muestra">
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

            <div className="p-4 border rounded-lg dark:border-dark-border">
                <TextareaField
                    label={fueExitosa ? '3. Observaciones Adicionales' : '2. Motivo de la Falla'}
                    name="observaciones"
                    value={observaciones}
                    onChange={(e) => {
                        setObservaciones(e.target.value);
                        if (errors.observaciones) setErrors(prev => ({...prev, observaciones: null}));
                    }}
                    rows={4}
                    placeholder={fueExitosa ? 'Detalles relevantes del procedimiento...' : 'Especifique por qué no se pudo realizar la extracción...'}
                    required={!fueExitosa}
                    error={errors.observaciones}
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
                <span>{isSubmitting ? 'Guardando...' : 'Guardar Procedimiento'}</span>
            </button>
        </div>
      </form>

      {isModalOpen && (
        <PDFPreviewModal pdfUrl={pdfUrl} onClose={() => setIsModalOpen(false)} />
      )}

      <ConfirmationModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleConfirmClear}
        title="Confirmar Limpieza de Formulario"
        message="¿Estás seguro de que deseas limpiar todos los campos? Esta acción no se puede deshacer."
      />
    </>
  );
};

export default ProcedimientoExtraccion;