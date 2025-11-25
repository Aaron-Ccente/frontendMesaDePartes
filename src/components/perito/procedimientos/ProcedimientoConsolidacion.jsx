import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../../hooks/useAuth';
import { ProcedimientoService } from '../../../services/procedimientoService';
import { DictamenService } from '../../../services/dictamenService.js';
import { GuardarIcon, CancelarIcon, PreviewIcon, UploadIcon, DownloadIcon, SendIcon } from '../../../assets/icons/Actions';
import { EditableField } from '../../ui/InformeConsolidadoComponents';
import PDFPreviewModal from '../../documentos/PDFPreviewModal';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

const ProcedimientoConsolidacion = () => {
    const { id: id_oficio } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // --- ESTADOS ---
    const [oficio, setOficio] = useState(null);
    const [muestras, setMuestras] = useState([]);
    const [resultadosPrevios, setResultadosPrevios] = useState([]);
    
    const [examenesConsolidados, setExamenesConsolidados] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [previewLoading, setPreviewLoading] = useState(false);

    // Estado unificado para el formulario del INFORME
    const [informeFormData, setInformeFormData] = useState({
        // ... campos del informe
        objeto_pericia: '',
        conclusion_principal: '',
        // ... otros campos
    });

    // --- NUEVOS ESTADOS PARA CARÁTULA Y FLUJO DE FIRMA ---
    const [caratulaFormData, setCaratulaFormData] = useState({
        lugarFecha: '',
        numOficio: '',
        membreteComando: '',
        membreteDireccion: '',
        membreteRegion: '',
        destCargo: '',
        destNombre: '',
        destPuesto: '',
        asuntoBase: '',
        asuntoRemite: 'REMITE',
        referencia: '',
        cuerpoP1_1: 'Me dirijo a Usted, con la finalidad de remitir adjunto al presente el informe Pericial de Ingeniería Forense – ',
        cuerpoP1_2: '',
        cuerpoP1_3: ', practicado en las muestras remitidas ',
        cuerpoP1_4: '',
        cuerpoP1_5: ', de conformidad al documento de la referencia. Se adjunta acta de deslacrado y lacrado de muestras para análisis pericial de ingeniería forense.',
        regNum: '',
        regIniciales: '',
        firmanteQS: '',
        firmanteNombre: '',
        firmanteCargo: '',
        firmanteDependencia: '',
    });
    const [informeEmitido, setInformeEmitido] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [caratulaPdfUrl, setCaratulaPdfUrl] = useState(null);
    const [isCaratulaModalOpen, setIsCaratulaModalOpen] = useState(false);
    const [informePdfUrl, setInformePdfUrl] = useState(null);
    const [isInformeModalOpen, setIsInformeModalOpen] = useState(false);
    const [tabIndex, setTabIndex] = useState(0);

    // --- MANEJADORES DE INPUTS ---
    const handleInformeInputChange = (e) => {
        const { name, value } = e.target;
        setInformeFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleCaratulaInputChange = (e) => {
        const { name, value } = e.target;
        setCaratulaFormData(prev => ({ ...prev, [name]: value }));
    };

    // --- LÓGICA DE CARGA DE DATOS ---
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

                // Pre-llenar formulario de INFORME
                setInformeFormData({
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
                    conclusion_principal: generarConclusionSugerida()
                });

                // Pre-llenar formulario de CARÁTULA
                const peritoAsignado = oficio.perito_asignado;
                setCaratulaFormData({
                    lugarFecha: `Huancayo, ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`,
                    numOficio: oficio.numero_oficio.split('/').slice(0, -1).join('/') + '/ING.', // Adaptar según sea necesario
                    membreteComando: "Comando de Operaciones Policiales",
                    membreteDireccion: "Dirección Nacional de Orden y Seguridad",
                    membreteRegion: "Región Policial Junín",
                    destCargo: 'JEFE DE LA OFICRI PNP - HYO', // Dato quemado, ajustar si es dinámico
                    destNombre: 'Nombre del Jefe', // Dato quemado, ajustar si es dinámico
                    destPuesto: '',
                    asuntoBase: `Informe Pericial ... por motivo que se indica.`, // Ajustar
                    asuntoRemite: 'REMITE',
                    referencia: oficio.documento_referencia,
                    cuerpoP1_1: 'Me dirijo a Usted, con la finalidad de remitir adjunto al presente el informe Pericial de Ingeniería Forense – ',
                    cuerpoP1_2: `Físico N° ${oficio.numero_oficio.split('-')[0]}`,
                    cuerpoP1_3: ', practicado en las muestras remitidas ',
                    cuerpoP1_4: muestras.map((m, i) => `M${i+1}: (${m.descripcion})`).join(', '),
                    cuerpoP1_5: ', de conformidad al documento de la referencia. Se adjunta acta de deslacrado y lacrado de muestras para análisis pericial de ingeniería forense.',
                    regNum: '', // Completar si se tiene
                    regIniciales: `${user.nombre_completo.split(' ').map(n => n[0]).join('')}/lgp.`,
                    firmanteQS: peritoAsignado?.cip || '',
                    firmanteNombre: peritoAsignado?.nombre_completo || '',
                    firmanteCargo: peritoAsignado?.grado || 'PERITO OFICRI',
                    firmanteDependencia: 'OFICRI PNP HUANCAYO',
                });

            } catch (error) {
                toast.error(`Error al cargar datos: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id_oficio, user]);

    // (useEffect para examenesConsolidados y generarConclusionSugerida se mantienen igual)
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

    const generarConclusionSugerida = () => {
        // ... lógica existente ...
        return "Conclusión sugerida basada en resultados.";
    };

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    // --- MANEJADORES DE ACCIONES ---

    const handleCaratulaPreview = async () => {
        setPreviewLoading(true);
        try {
            const pdfBlob = await ProcedimientoService.generarCaratula(id_oficio, caratulaFormData);
            const url = URL.createObjectURL(pdfBlob);
            setCaratulaPdfUrl(url);
            setIsCaratulaModalOpen(true);
        } catch (error) {
            toast.error(`Error al generar vista previa de carátula: ${error.message}`);
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleInformePreview = async () => {
        setPreviewLoading(true);
        try {
            const payload = { informe: { ...informeFormData, examenes: examenesConsolidados } };
            const pdfBlob = await DictamenService.getInformePreview(id_oficio, payload);
            const url = URL.createObjectURL(pdfBlob);
            setInformePdfUrl(url);
            setIsInformeModalOpen(true);
        } catch (error) {
            toast.error(`Error al generar vista previa de informe: ${error.message}`);
        } finally {
            setPreviewLoading(false);
        }
    };
    
    const handleGuardarYContinuar = async () => {
        if (!informeFormData.objeto_pericia || !informeFormData.conclusion_principal) {
            toast.error('El Objeto de la Pericia y la Conclusión Principal son obligatorios.');
            return;
        }
        setIsSubmitting(true);
        try {
            // Generamos ambos documentos para que el usuario los descargue
            const payload = { informe: { ...informeFormData, examenes: examenesConsolidados } };
            const informeBlob = await DictamenService.getInformePreview(id_oficio, payload);
            const caratulaBlob = await ProcedimientoService.generarCaratula(id_oficio, caratulaFormData);

            setInformePdfUrl(URL.createObjectURL(informeBlob));
            setCaratulaPdfUrl(URL.createObjectURL(caratulaBlob));

            setInformeEmitido(true);
            setTabIndex(2); // Cambiar a la pestaña de Firma
            toast.success('Documentos generados. Proceda a la firma y envío.');
        } catch (error) {
            toast.error(`Error al generar documentos: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === "application/pdf") {
            setSelectedFile(file);
        } else {
            toast.error("Por favor, seleccione un archivo PDF.");
            e.target.value = null;
        }
    };

    const handleFinalSubmit = async () => {
        if (!selectedFile) {
            toast.error('Debe seleccionar el informe firmado para poder enviarlo.');
            return;
        }
        if (!window.confirm('¿Está seguro de enviar el informe firmado a Mesa de Partes? Esta acción moverá el caso a la siguiente bandeja.')) {
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('informe_firmado', selectedFile);

            const res = await ProcedimientoService.uploadInformeFirmado(id_oficio, formData);
            if (res.success) {
                toast.success('Informe enviado a Mesa de Partes exitosamente.');
                navigate('/perito/dashboard');
            } else {
                throw new Error(res.message);
            }
        } catch (error) {
            toast.error(`Error en el envío final: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Cargando...</div>;

    // --- RENDERIZADO DEL COMPONENTE ---
    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Proceso de Consolidación Final</h1>
                <p className="text-lg text-gray-500">Oficio N°: {oficio?.nro_oficio}</p>
            </div>

            <Tabs selectedIndex={tabIndex} onSelect={index => setTabIndex(index)}>
                <TabList>
                    <Tab>1. Editor de Carátula</Tab>
                    <Tab>2. Editor de Informe Pericial</Tab>
                    <Tab disabled={!informeEmitido}>3. Firma y Envío</Tab>
                </TabList>

                {/* --- PESTAÑA 1: CARÁTULA --- */}
                <TabPanel>
                    <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-md border dark:border-dark-border">
                        <div className="flex justify-between items-center border-b pb-3 dark:border-dark-border">
                            <h3 className="text-xl font-bold">Datos de la Carátula</h3>
                            <button type="button" onClick={handleCaratulaPreview} disabled={previewLoading} className="btn-secondary">
                                <PreviewIcon /><span>{previewLoading ? 'Generando...' : 'Vista Previa Carátula'}</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-4">
                           <EditableField label="Lugar y Fecha" name="lugarFecha" value={caratulaFormData.lugarFecha} onChange={handleCaratulaInputChange} />
                           <EditableField label="Número de Oficio" name="numOficio" value={caratulaFormData.numOficio} onChange={handleCaratulaInputChange} />
                           <EditableField label="Referencia" name="referencia" value={caratulaFormData.referencia} onChange={handleCaratulaInputChange} />
                           <h4 className="md:col-span-2 text-lg font-semibold border-b mt-4 dark:border-dark-border">Destinatario</h4>
                           <EditableField label="Cargo Destinatario" name="destCargo" value={caratulaFormData.destCargo} onChange={handleCaratulaInputChange} />
                           <EditableField label="Nombre Destinatario" name="destNombre" value={caratulaFormData.destNombre} onChange={handleCaratulaInputChange} />
                           <h4 className="md:col-span-2 text-lg font-semibold border-b mt-4 dark:border-dark-border">Firmante</h4>
                           <EditableField label="Nombre Firmante" name="firmanteNombre" value={caratulaFormData.firmanteNombre} onChange={handleCaratulaInputChange} />
                           <EditableField label="Cargo Firmante" name="firmanteCargo" value={caratulaFormData.firmanteCargo} onChange={handleCaratulaInputChange} />
                        </div>
                    </div>
                </TabPanel>

                {/* --- PESTAÑA 2: INFORME PERICIAL --- */}
                <TabPanel>
                    <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-md border dark:border-dark-border">
                         <div className="flex justify-between items-center border-b pb-3 dark:border-dark-border">
                            <h3 className="text-xl font-bold">Contenido del Informe</h3>
                            <button type="button" onClick={handleInformePreview} disabled={previewLoading} className="btn-secondary">
                                <PreviewIcon /><span>{previewLoading ? 'Generando...' : 'Vista Previa Informe'}</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-4">
                            <h4 className="md:col-span-2 text-lg font-semibold border-b mt-2 dark:border-dark-border">A. Procedencia y B. Antecedente</h4>
                            <EditableField label="A. Procedencia" name="unidad_solicitante" value={informeFormData.unidad_solicitante} onChange={handleInformeInputChange} />
                            <EditableField label="B. Documento de Referencia" name="documento_referencia" value={informeFormData.documento_referencia} onChange={handleInformeInputChange} />
                            <EditableField label="Fecha del Documento" name="fecha_documento" type="date" value={informeFormData.fecha_documento} onChange={handleInformeInputChange} />
                            
                            <h4 className="md:col-span-2 text-lg font-semibold border-b mt-4 dark:border-dark-border">D. Objeto de la Pericia</h4>
                             <div className="md:col-span-2">
                                <EditableField label="D. Objeto de la Pericia" name="objeto_pericia" value={informeFormData.objeto_pericia} onChange={handleInformeInputChange} isTextarea={true} rows={3} />
                            </div>

                            <h4 className="md:col-span-2 text-lg font-semibold border-b mt-4 dark:border-dark-border">E. Incidente y F. Toma de Muestra</h4>
                            <EditableField label="E. Hora del Incidente" name="hora_incidente" type="time" value={informeFormData.hora_incidente} onChange={handleInformeInputChange} />
                            <EditableField label="E. Fecha del Incidente" name="fecha_incidente" type="date" value={informeFormData.fecha_incidente} onChange={handleInformeInputChange} />
                            <EditableField label="F. Hora de Toma de Muestra" name="hora_toma_muestra" type="time" value={informeFormData.hora_toma_muestra} onChange={handleInformeInputChange} />
                            <EditableField label="F. Fecha de Toma de Muestra" name="fecha_toma_muestra" type="date" value={informeFormData.fecha_toma_muestra} onChange={handleInformeInputChange} />

                            <h4 className="md:col-span-2 text-lg font-semibold border-b mt-4 dark:border-dark-border">G. Conductor y H. Examinado</h4>
                            <EditableField label="G. Conductor" name="conductor" value={informeFormData.conductor} onChange={handleInformeInputChange} />
                            <EditableField label="H. Examinado / Incriminado" name="examinado_incriminado" value={informeFormData.examinado_incriminado} onChange={handleInformeInputChange} />
                            <EditableField label="Edad del Examinado" name="edad_examinado" type="number" value={informeFormData.edad_examinado} onChange={handleInformeInputChange} />

                            <h4 className="md:col-span-2 text-lg font-semibold border-b mt-4 dark:border-dark-border">J. Examen (Solo Lectura)</h4>
                            <div className="md:col-span-2 space-y-4 p-4 bg-gray-50 dark:bg-dark-bg-secondary rounded-lg border dark:border-dark-border">
                                {examenesConsolidados.length > 0 ? (
                                    examenesConsolidados.map((examen, index) => (
                                        <div key={index}>
                                            <h5 className="font-bold underline">{examen.nombre}</h5>
                                            <ul className="list-disc list-inside pl-4">
                                                {examen.resultados.map((res, i) => (
                                                    <li key={i}>{res.analito}{res.resultado}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No hay resultados de exámenes para mostrar.</p>
                                )}
                            </div>

                            <h4 className="md:col-span-2 text-lg font-semibold border-b mt-4 dark:border-dark-border">K. Conclusión y L. Recolector</h4>
                            <div className="md:col-span-2">
                                <EditableField label="K. Conclusión Principal" name="conclusion_principal" value={informeFormData.conclusion_principal} onChange={handleInformeInputChange} isTextarea={true} rows={5} />
                            </div>
                             <div className="md:col-span-2">
                                <EditableField label="L. Muestra Tomada Por" name="recolector_muestra" value={informeFormData.recolector_muestra} onChange={handleInformeInputChange} />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t mt-6 dark:border-dark-border">
                            <button type="button" onClick={() => navigate('/perito/dashboard')} className="btn-secondary"><CancelarIcon /><span>Cancelar</span></button>
                            <button type="button" onClick={handleGuardarYContinuar} disabled={isSubmitting} className="btn-primary"><GuardarIcon /><span>{isSubmitting ? 'Procesando...' : 'Guardar y Continuar a Firma'}</span></button>
                        </div>
                    </div>
                </TabPanel>
                
                {/* --- PESTAÑA 3: FIRMA Y ENVÍO --- */}
                <TabPanel>
                    <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-md border dark:border-dark-border text-center">
                        <h3 className="text-xl font-bold mb-4">Paso Final: Firma y Envío</h3>
                        <p className="mb-6">Los documentos han sido generados. Descárguelos, firme el Informe Pericial y súbalo para completar el proceso.</p>
                        
                        <div className="flex justify-center gap-4 mb-8">
                            <a href={caratulaPdfUrl} download={`Caratula-${oficio?.nro_oficio}.pdf`} className="btn-secondary"><DownloadIcon /> Descargar Carátula</a>
                            <a href={informePdfUrl} download={`Informe-Pericial-${oficio?.nro_oficio}.pdf`} className="btn-primary"><DownloadIcon /> Descargar Informe</a>
                        </div>

                        <div className="max-w-md mx-auto border-t pt-6 dark:border-dark-border">
                            <label htmlFor="informe-firmado-upload" className="block text-sm font-medium mb-2">Subir Informe Pericial Firmado (PDF)</label>
                            <div className="flex items-center justify-center bg-gray-50 dark:bg-dark-bg-tertiary p-4 rounded-lg border-2 border-dashed dark:border-dark-border">
                                <input id="informe-firmado-upload" type="file" accept="application/pdf" onChange={handleFileChange} className="w-full text-sm" />
                            </div>
                            {selectedFile && <p className="text-sm mt-2 text-green-600">Archivo seleccionado: {selectedFile.name}</p>}
                        </div>

                        <div className="flex justify-end gap-3 pt-6 mt-6 border-t dark:border-dark-border">
                            <button type="button" onClick={() => setTabIndex(1)} className="btn-secondary">Volver a Edición</button>
                            <button type="button" onClick={handleFinalSubmit} disabled={!selectedFile || isSubmitting} className="btn-success">
                                <SendIcon /><span>{isSubmitting ? 'Enviando...' : 'Enviar a Mesa de Partes'}</span>
                            </button>
                        </div>
                    </div>
                </TabPanel>
            </Tabs>

            {isCaratulaModalOpen && caratulaPdfUrl && <PDFPreviewModal pdfUrl={caratulaPdfUrl} onClose={() => setIsCaratulaModalOpen(false)} />}
            {isInformeModalOpen && informePdfUrl && <PDFPreviewModal pdfUrl={informePdfUrl} onClose={() => setIsInformeModalOpen(false)} />}
        </div>
    );
};

export default ProcedimientoConsolidacion;