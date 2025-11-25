import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../../hooks/useAuth';
import { ProcedimientoService } from '../../../services/procedimientoService';
import { DictamenService } from '../../../services/dictamenService.js';
import { GuardarIcon, CancelarIcon, PreviewIcon } from '../../../assets/icons/Actions';
import { InfoCard, ReadOnlyField, EditableField } from '../../ui/InformeConsolidadoComponents';
import PDFPreviewModal from '../../documentos/PDFPreviewModal';

const ProcedimientoConsolidacion = () => {
    const { id: id_oficio } = useParams();
    const navigate = useNavigate();
    useAuth(); // Se mantiene por si el hook tiene efectos globales, pero 'user' no se usa.

    // Estados para datos crudos del backend
    const [oficio, setOficio] = useState(null);
    const [muestras, setMuestras] = useState([]);
    const [resultadosPrevios, setResultadosPrevios] = useState([]);
    
    // Estado para la UI 
    const [examenesConsolidados, setExamenesConsolidados] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [previewLoading, setPreviewLoading] = useState(false);
    
    // State unificado para todo el formulario del informe
    const [formData, setFormData] = useState({
        unidad_solicitante: '',
        documento_referencia: '',
        fecha_documento: '',
        objeto_pericia: '',
        hora_incidente: '',
        fecha_incidente: '',
        hora_toma_muestra: '',
        fecha_toma_muestra: '',
        conductor: '',
        examinado_incriminado: '',
        edad_examinado: '',
        conclusion_principal: '',
        recolector_muestra: ''
    });

    // State para el modal de vista previa
    const [pdfUrl, setPdfUrl] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const offset = date.getTimezoneOffset();
        const adjustedDate = new Date(date.getTime() + (offset * 60 * 1000));
        return adjustedDate.toISOString().split('T')[0];
    };

    // Carga de datos y pre-llenado del formulario
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const res = await ProcedimientoService.getDatosConsolidacion(id_oficio);
                if (!res.success) throw new Error(res.message);

                const { oficio, resultados_previos, metadata, muestras, recolector_muestra } = res.data;
                
                setOficio(oficio);
                setResultadosPrevios(resultados_previos || []);
                setMuestras(muestras || []);

                setFormData({
                    unidad_solicitante: oficio.unidad_solicitante || '',
                    documento_referencia: oficio.documento_referencia || '',
                    fecha_documento: formatDateForInput(oficio.fecha_documento),
                    objeto_pericia: metadata.objeto_pericia || oficio?.tipos_de_examen?.join(', ') || '',
                    hora_incidente: oficio.hora_incidente || '',
                    fecha_incidente: formatDateForInput(oficio.fecha_incidente),
                    hora_toma_muestra: oficio.hora_toma_muestra || '',
                    fecha_toma_muestra: formatDateForInput(oficio.fecha_toma_muestra),
                    conductor: oficio.conductor || '',
                    examinado_incriminado: oficio.examinado_incriminado || '',
                    edad_examinado: oficio.edad_examinado || '',
                    recolector_muestra: recolector_muestra || '',
                    conclusion_principal: generarConclusionSugerida(resultados_previos, oficio.examinado_incriminado || 'el examinado')
                });

            } catch (error) {
                toast.error(`Error al cargar datos: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id_oficio]);

    // Procesamiento de resultados para la UI
    useEffect(() => {
        if (!resultadosPrevios.length || !muestras.length) {
            setExamenesConsolidados([]);
            return;
        }

        const consolidados = {};
        resultadosPrevios.forEach(res => {
            const examenInfo = { nombre: res.tipo_resultado };
            if (!consolidados[res.tipo_resultado]) {
                consolidados[res.tipo_resultado] = {
                    nombre: examenInfo.nombre,
                    resultados: []
                };
            }

            muestras.forEach((muestra, index) => {
                const idMuestra = muestra.id_muestra;
                const codigoMuestra = `M${index + 1}`;
                if (res.resultados && res.resultados[idMuestra]) {
                    for (const analito in res.resultados[idMuestra]) {
                        if (analito !== 'descripcion_detallada' && analito !== 'no_aplicable') {
                             let resultadoFormateado = res.resultados[idMuestra][analito];
                             let analitoFormateado = analito.charAt(0).toUpperCase() + analito.slice(1).replace(/_/g, ' ');
                             if (res.tipo_resultado === 'Sarro Ungueal') {
                                 analitoFormateado = 'Sarro Ungueal';
                                 resultadoFormateado = `: ${resultadoFormateado}`;
                             } else {
                                 resultadoFormateado = `: ${resultadoFormateado} en (${codigoMuestra})`;
                             }
                            consolidados[res.tipo_resultado].resultados.push({ analito: analitoFormateado, resultado: resultadoFormateado });
                        }
                    }
                }
            });
        });
        setExamenesConsolidados(Object.values(consolidados));
    }, [resultadosPrevios, muestras]);

    const generarConclusionSugerida = (resultados, nombreImplicado) => {
        let positivos = [];
        let dosaje = null;
        let sarroResult = null;
        if (!resultados) return '';
    
        resultados.forEach(res => {
            if (res.tipo_resultado === 'Dosaje Etílico') {
                const idMuestra = Object.keys(res.resultados)[0];
                if (idMuestra && res.resultados[idMuestra]) {
                   dosaje = res.resultados[idMuestra]['alcohol_etilico_en_sangre'];
                }
            } else if (res.tipo_resultado === 'Sarro Ungueal') {
                 const idMuestra = Object.keys(res.resultados)[0];
                 if (idMuestra && res.resultados[idMuestra]) {
                    sarroResult = res.resultados[idMuestra]['resultado_sarro_ungueal'];
                 }
            } else {
                for (const idMuestra in res.resultados) {
                    for (const analito in res.resultados[idMuestra]) {
                        if (res.resultados[idMuestra][analito] === 'POSITIVO') {
                            positivos.push(analito.toUpperCase().replace(/_/g, ' '));
                        }
                    }
                }
            }
        });
        positivos = [...new Set(positivos)];
    
        let conclusion = `La muestra analizada de la persona: “${nombreImplicado}”, dieron resultado: `;
        let partes = [];
        if (positivos.length > 0) {
            partes.push(`POSITIVO para las siguientes sustancias: ${positivos.join(', ')}`);
        } else {
            partes.push('NEGATIVO para las sustancias químicas toxicológicas investigadas');
        }

        if (sarroResult) {
            partes.push(`y ${sarroResult} para adherencias de drogas en Sarro Ungueal`);
        }
    
        if (dosaje) {
            partes.push(`y en el Dosaje Etílico arrojó ${dosaje}`);
        }
    
        return conclusion + partes.join(' ') + '.';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.objeto_pericia || !formData.conclusion_principal) {
            toast.error('El Objeto de la Pericia y la Conclusión Principal son obligatorios.');
            return;
        }

        if (!window.confirm('¿Está seguro de emitir el Informe Pericial Consolidado? Esta acción cerrará el caso y no se podrá revertir.')) {
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                informe: { ...formData, examenes: examenesConsolidados }
            };
            const res = await DictamenService.generarDictamen(id_oficio, payload);
            if (res.success) {
                toast.success('Informe emitido exitosamente. El caso ha sido cerrado.');
                navigate('/perito/dashboard');
            } else { throw new Error(res.message); }
        } catch (error) {
            toast.error(`Error al emitir el informe: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePreview = async () => {
        setPreviewLoading(true);
        try {
            const payload = {
                informe: { ...formData, examenes: examenesConsolidados }
            };
            const pdfBlob = await DictamenService.getInformePreview(id_oficio, payload);
            const url = URL.createObjectURL(pdfBlob);
            setPdfUrl(url);
            setIsModalOpen(true);
        } catch (error) {
            toast.error(`Error al generar la vista previa: ${error.message}`);
        } finally {
            setPreviewLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Cargando...</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Editor de Informe Pericial Consolidado</h1>
                <p className="text-lg text-gray-500">Oficio N°: {oficio?.nro_oficio}</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-md border dark:border-dark-border">
                <div className="flex justify-between items-center border-b pb-3 dark:border-dark-border">
                    <h3 className="text-xl font-bold">Contenido del Informe</h3>
                    <button type="button" onClick={handlePreview} disabled={previewLoading} className="btn-secondary border border-gray-300 dark:border-gray-600">
                        <PreviewIcon />
                        <span>{previewLoading ? 'Generando...' : 'Vista Previa'}</span>
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-4">
                    <h4 className="md:col-span-2 text-lg font-semibold border-b dark:border-dark-border">Datos Generales</h4>
                    <EditableField label="A. Procedencia" name="unidad_solicitante" value={formData.unidad_solicitante} onChange={handleInputChange} />
                    <EditableField label="B. Antecedente" name="documento_referencia" value={formData.documento_referencia} onChange={handleInputChange} />
                    <EditableField type="date" label="Fecha de Antecedente" name="fecha_documento" value={formData.fecha_documento} onChange={handleInputChange} />
                    <EditableField label="G. Conductor" name="conductor" value={formData.conductor} onChange={handleInputChange} />
                    <EditableField label="H. Muestra Tomada A" name="examinado_incriminado" value={formData.examinado_incriminado} onChange={handleInputChange} />
                    <EditableField label="Edad" name="edad_examinado" value={formData.edad_examinado} onChange={handleInputChange} />

                    <h4 className="md:col-span-2 text-lg font-semibold border-b mt-4 dark:border-dark-border">Detalles del Incidente</h4>
                    <EditableField type="time" label="E. Hora del Incidente" name="hora_incidente" value={formData.hora_incidente} onChange={handleInputChange} />
                    <EditableField type="date" label="Fecha del Incidente" name="fecha_incidente" value={formData.fecha_incidente} onChange={handleInputChange} />
                    <EditableField type="time" label="F. Hora Toma de Muestra" name="hora_toma_muestra" value={formData.hora_toma_muestra} onChange={handleInputChange} />
                    <EditableField type="date" label="Fecha Toma de Muestra" name="fecha_toma_muestra" value={formData.fecha_toma_muestra} onChange={handleInputChange} />

                    <h4 className="md:col-span-2 text-lg font-semibold border-b mt-4 dark:border-dark-border">Contenido de la Pericia</h4>
                    <div className="md:col-span-2">
                        <EditableField label="D. Objeto de la Pericia" name="objeto_pericia" value={formData.objeto_pericia} onChange={handleInputChange} isTextarea={true} rows={3} />
                    </div>
                    <div className="md:col-span-2">
                        <h4 className="block text-sm font-medium mb-2">J. Examen (Resultados Consolidados) - Solo Lectura</h4>
                        <div className="p-3 bg-gray-50 dark:bg-dark-bg-tertiary rounded border dark:border-dark-border space-y-2">
                            {examenesConsolidados.length > 0 ? examenesConsolidados.map(examen => (
                                <div key={examen.nombre}>
                                    <p className="font-semibold text-pnp-green-dark underline">{examen.nombre}</p>
                                    <div className="pl-4 text-sm">
                                        {examen.resultados.map((r, i) => (
                                            <div key={`${r.analito}-${i}`} className="flex justify-between">
                                                <span>{r.analito}</span>
                                                <span className="font-mono">{r.resultado}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )) : <p className="text-sm italic text-gray-500">No hay resultados para mostrar.</p>}
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <EditableField label="K. Conclusión Principal" name="conclusion_principal" value={formData.conclusion_principal} onChange={handleInputChange} isTextarea={true} rows={5} />
                    </div>
                     <div className="md:col-span-2">
                        <EditableField label="L. Muestra Tomada Por (Recolector)" name="recolector_muestra" value={formData.recolector_muestra} onChange={handleInputChange} />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t mt-6 dark:border-dark-border">
                    <button type="button" onClick={() => navigate('/perito/dashboard')} className="btn-secondary"><CancelarIcon /><span>Cancelar</span></button>
                    <button type="submit" disabled={isSubmitting} className="btn-primary"><GuardarIcon /><span>{isSubmitting ? 'Procesando...' : 'Emitir Informe y Cerrar Caso'}</span></button>
                </div>
            </form>

            {isModalOpen && pdfUrl && (
                <PDFPreviewModal pdfUrl={pdfUrl} onClose={() => setIsModalOpen(false)} />
            )}
        </div>
    );
};

export default ProcedimientoConsolidacion;