import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../../hooks/useAuth';
import { ProcedimientoService } from '../../../services/procedimientoService';
import { DictamenService } from '../../../services/dictamenService.js';
import { GuardarIcon, CancelarIcon, UploadIcon, DownloadIcon, SendIcon } from '../../../assets/icons/Actions';
import { EditableField } from '../../ui/InformeConsolidadoComponents';
import CaratulaPreview from '../../ui/CaratulaPreview';
import InformePreview from '../../ui/InformePreview';
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

    // Estado unificado para el formulario del INFORME
    const [informeFormData, setInformeFormData] = useState({
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
        recolector_muestra: '',
        conclusion_principal: '',
    });

    const [peritoFormData, setPeritoFormData] = useState({
        grado: '',
        nombre_completo: '',
        cip: '',
        dni_perito: '',
        cqfp: '',
        titulo_profesional: 'Perito Químico Farmacéutico'
    });
    
    // --- NUEVOS ESTADOS MEJORADOS ---
    const [conclusionesSecundarias, setConclusionesSecundarias] = useState(['Muestras agotadas en los análisis.']);
    const [metodos, setMetodos] = useState([]);
    const [muestrasEditables, setMuestrasEditables] = useState([]);
    const [sufijoNumeroOficio, setSufijoNumeroOficio] = useState('IV-MACREPOL-JUN-DIVINCRI/OFICRI.');

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
    const [informePdfUrl, setInformePdfUrl] = useState(null);
    const [tabIndex, setTabIndex] = useState(0);

    // --- MANEJADORES DE INPUTS ---
    const handleInformeInputChange = (e) => {
        const { name, value } = e.target;
        setInformeFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePeritoInputChange = (e) => {
        const { name, value } = e.target;
        setPeritoFormData(prev => ({ ...prev, [name]: value }));
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
                
                // Inicializar muestras editables
                setMuestrasEditables(muestras.map(m => ({
                    id_muestra: m.id_muestra,
                    descripcion: m.descripcion || ''
                })));

                // Inicializar métodos (lógica simple basada en resultados previos)
                const examenMetodoMapDefault = {
                    'Sarro Ungueal': { nombre: 'Análisis de Sarro Ungueal', metodo: 'Químico - colorimétrico' },
                    'Toxicológico': { nombre: 'Análisis Toxicológico', metodo: 'Cromatografía en capa fina, Inmunoensayo' },
                    'Dosaje Etílico': { nombre: 'Análisis de Dosaje Etílico', metodo: 'Espectrofotometría – UV VIS' }
                };
                
                const metodosInit = [];
                resultados_previos?.forEach(res => {
                    const info = examenMetodoMapDefault[res.tipo_resultado] || { nombre: res.tipo_resultado, metodo: 'No especificado' };
                    if (!metodosInit.find(m => m.examen === res.tipo_resultado)) {
                        metodosInit.push({ examen: res.tipo_resultado, metodo: info.metodo });
                    }
                });
                setMetodos(metodosInit);


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

                // Pre-llenar formulario de PERITO
                setPeritoFormData({
                    grado: oficio.grado_perito || '',
                    nombre_completo: oficio.nombre_perito_actual || oficio.perito_asignado || '',
                    cip: oficio.cip_perito || '',
                    dni_perito: oficio.dni_perito || '',
                    cqfp: oficio.cqfp || '',
                    titulo_profesional: 'Perito Químico Farmacéutico' // Default, debería venir de BD idealmente
                });

                // Pre-llenar formulario de CARÁTULA
                const peritoAsignado = oficio.perito_asignado; 
                setCaratulaFormData({
                    lugarFecha: `Huancayo, ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`,
                    numOficio: oficio.numero_oficio.split('/').slice(0, -1).join('/') + '/ING.', 
                    membreteComando: "",
                    membreteDireccion: "",
                    membreteRegion: "",
                    destCargo: 'JEFE DE LA OFICRI PNP - HYO', 
                    destNombre: 'Nombre del Jefe', 
                    destPuesto: '',
                    asuntoBase: `Informe Pericial ... por motivo que se indica.`, 
                    asuntoRemite: 'REMITE',
                    referencia: oficio.documento_referencia,
                    cuerpoP1_1: 'Me dirijo a Usted, con la finalidad de remitir adjunto al presente el informe Pericial de Ingeniería Forense – ',
                    cuerpoP1_2: `Físico N° ${oficio.numero_oficio.split('-')[0]}`,
                    cuerpoP1_3: ', practicado en las muestras remitidas ',
                    cuerpoP1_4: muestras.map((m, i) => `M${i + 1}: (${m.descripcion})`).join(', '),
                    cuerpoP1_5: ', de conformidad al documento de la referencia. Se adjunta acta de deslacrado y lacrado de muestras para análisis pericial de ingeniería forense.',
                    regNum: '', 
                    regIniciales: `${user.nombre_completo.split(' ').map(n => n[0]).join('')}/lgp.`,
                    firmanteQS: oficio.cip_perito || '',
                    firmanteNombre: oficio.nombre_perito_actual || user.nombre_completo,
                    firmanteCargo: oficio.grado_perito || 'PERITO OFICRI',
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

    const handleGuardarYContinuar = async () => {
        if (!informeFormData.objeto_pericia || !informeFormData.conclusion_principal) {
            toast.error('El Objeto de la Pericia y la Conclusión Principal son obligatorios.');
            return;
        }
        setIsSubmitting(true);
        try {
            // Payload mejorado con todos los nuevos campos
            const payload = { 
                informe: { 
                    ...informeFormData, 
                    examenes: examenesConsolidados,
                    metodos: metodos,
                    muestras: muestrasEditables,
                    conclusiones_secundarias: conclusionesSecundarias,
                    sufijo_numero_oficio: sufijoNumeroOficio
                },
                perito: peritoFormData 
            };
            
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
    
    // --- MANEJADORES PARA LISTAS EDITABLES ---
    const updateMetodo = (index, newValue) => {
        const newMetodos = [...metodos];
        newMetodos[index].metodo = newValue;
        setMetodos(newMetodos);
    };

    const updateMuestraDescripcion = (index, newValue) => {
        const newMuestras = [...muestrasEditables];
        newMuestras[index].descripcion = newValue;
        setMuestrasEditables(newMuestras);
    };

    const addConclusionSecundaria = () => {
        setConclusionesSecundarias([...conclusionesSecundarias, '']);
    };
    
    const removeConclusionSecundaria = (index) => {
        const newConc = [...conclusionesSecundarias];
        newConc.splice(index, 1);
        setConclusionesSecundarias(newConc);
    };

    const updateConclusionSecundaria = (index, value) => {
        const newConc = [...conclusionesSecundarias];
        newConc[index] = value;
        setConclusionesSecundarias(newConc);
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
        <div className="max-w-[1600px] mx-auto space-y-6 dark:text-white px-4">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Proceso de Consolidación Final</h1>
                <p className="text-lg text-gray-500">Oficio N°: {oficio?.numero_oficio}</p>
            </div>

            <Tabs selectedIndex={tabIndex} onSelect={index => setTabIndex(index)}>
                <TabList>
                    <Tab>1. Editor de Carátula</Tab>
                    <Tab>2. Editor de Informe Pericial</Tab>
                    <Tab disabled={!informeEmitido}>3. Firma y Envío</Tab>
                </TabList>

                {/* --- PESTAÑA 1: CARÁTULA --- */}
                <TabPanel>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-250px)]">
                        {/* COLUMNA IZQUIERDA: FORMULARIO */}
                        <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-md border dark:border-dark-border overflow-y-auto">
                            <h3 className="text-xl font-bold border-b pb-3 mb-4 dark:border-dark-border">Datos de la Carátula</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <EditableField label="Lugar y Fecha" name="lugarFecha" value={caratulaFormData.lugarFecha} onChange={handleCaratulaInputChange} />
                                <EditableField label="Número de Oficio" name="numOficio" value={caratulaFormData.numOficio} onChange={handleCaratulaInputChange} />
                                <EditableField label="Referencia" name="referencia" value={caratulaFormData.referencia} onChange={handleCaratulaInputChange} />
                                
                                <h4 className="text-lg font-semibold border-b mt-4 dark:border-dark-border text-pnp-green-dark">Destinatario</h4>
                                <EditableField label="Cargo" name="destCargo" value={caratulaFormData.destCargo} onChange={handleCaratulaInputChange} />
                                <EditableField label="Nombre" name="destNombre" value={caratulaFormData.destNombre} onChange={handleCaratulaInputChange} />
                                
                                <h4 className="text-lg font-semibold border-b mt-4 dark:border-dark-border text-pnp-green-dark">Cuerpo del Oficio</h4>
                                <div className="col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">Párrafo Introductorio</label>
                                    <textarea 
                                        name="cuerpoP1_1" 
                                        value={caratulaFormData.cuerpoP1_1} 
                                        onChange={handleCaratulaInputChange}
                                        rows={3}
                                        className="w-full rounded-md border-gray-300 dark:bg-dark-bg-tertiary dark:border-dark-border shadow-sm focus:border-pnp-green-light focus:ring-pnp-green-light sm:text-sm"
                                    />
                                </div>
                                
                                <h4 className="text-lg font-semibold border-b mt-4 dark:border-dark-border text-pnp-green-dark">Firmante</h4>
                                <EditableField label="Nombre" name="firmanteNombre" value={caratulaFormData.firmanteNombre} onChange={handleCaratulaInputChange} />
                                <EditableField label="Cargo" name="firmanteCargo" value={caratulaFormData.firmanteCargo} onChange={handleCaratulaInputChange} />
                            </div>
                        </div>

                        {/* COLUMNA DERECHA: VISTA PREVIA EN VIVO */}
                        <div className="hidden lg:block h-full">
                            <div className="sticky top-4 h-full">
                                <h3 className="text-center text-sm text-gray-500 mb-2 font-medium uppercase tracking-wide">Vista Previa en Tiempo Real</h3>
                                <CaratulaPreview data={caratulaFormData} />
                            </div>
                        </div>
                    </div>
                </TabPanel>

                {/* --- PESTAÑA 2: INFORME PERICIAL --- */}
                <TabPanel>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-250px)]">
                        {/* COLUMNA IZQUIERDA: FORMULARIO */}
                        <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-md border dark:border-dark-border overflow-y-auto">
                            <h3 className="text-xl font-bold border-b pb-3 mb-4 dark:border-dark-border">Contenido del Informe</h3>
                            
                            <div className="grid grid-cols-1 gap-4">
                                <h4 className="text-lg font-semibold border-b mt-2 dark:border-dark-border text-pnp-green-dark">I. Información General</h4>
                                <EditableField label="Sufijo N° Oficio" value={sufijoNumeroOficio} onChange={(e) => setSufijoNumeroOficio(e.target.value)} />
                                <EditableField label="A. Procedencia" name="unidad_solicitante" value={informeFormData.unidad_solicitante} onChange={handleInformeInputChange} />
                                <EditableField label="B. Documento Referencia" name="documento_referencia" value={informeFormData.documento_referencia} onChange={handleInformeInputChange} />
                                <EditableField label="Fecha Doc." name="fecha_documento" type="date" value={informeFormData.fecha_documento} onChange={handleInformeInputChange} />

                                <h4 className="text-lg font-semibold border-b mt-4 dark:border-dark-border text-pnp-green-dark">II. Objeto de la Pericia</h4>
                                <EditableField label="Descripción del Objeto" name="objeto_pericia" value={informeFormData.objeto_pericia} onChange={handleInformeInputChange} isTextarea={true} rows={4} />

                                <h4 className="text-lg font-semibold border-b mt-4 dark:border-dark-border text-pnp-green-dark">Muestras y Métodos</h4>
                                
                                {/* EDITOR DE MUESTRAS */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripciones de Muestras</label>
                                    {muestrasEditables.map((m, idx) => (
                                        <div key={m.id_muestra} className="flex gap-2 items-center">
                                            <span className="font-bold text-sm w-10">M{idx+1}:</span>
                                            <input 
                                                type="text" 
                                                className="flex-1 rounded-md border-gray-300 dark:bg-dark-bg-tertiary dark:border-dark-border shadow-sm text-sm"
                                                value={m.descripcion}
                                                onChange={(e) => updateMuestraDescripcion(idx, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* EDITOR DE MÉTODOS */}
                                <div className="space-y-3 mt-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Métodos Utilizados</label>
                                    {metodos.map((m, idx) => (
                                        <div key={idx} className="flex flex-col gap-1 border p-2 rounded bg-gray-50 dark:bg-dark-bg-tertiary">
                                            <span className="font-bold text-xs uppercase text-gray-500">{m.examen}</span>
                                            <textarea 
                                                className="w-full rounded-md border-gray-300 dark:bg-dark-surface shadow-sm text-sm"
                                                rows={2}
                                                value={m.metodo}
                                                onChange={(e) => updateMetodo(idx, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <h4 className="text-lg font-semibold border-b mt-4 dark:border-dark-border text-pnp-green-dark">Datos del Perito (Firmante)</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <EditableField label="Grado" name="grado" value={peritoFormData.grado} onChange={handlePeritoInputChange} />
                                    <EditableField label="Nombre Completo" name="nombre_completo" value={peritoFormData.nombre_completo} onChange={handlePeritoInputChange} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <EditableField label="CIP" name="cip" value={peritoFormData.cip} onChange={handlePeritoInputChange} />
                                    <EditableField label="DNI" name="dni_perito" value={peritoFormData.dni_perito} onChange={handlePeritoInputChange} />
                                    <EditableField label="CQFP" name="cqfp" value={peritoFormData.cqfp} onChange={handlePeritoInputChange} />
                                    <EditableField label="Título Profesional" name="titulo_profesional" value={peritoFormData.titulo_profesional} onChange={handlePeritoInputChange} />
                                </div>

                                <h4 className="text-lg font-semibold border-b mt-4 dark:border-dark-border text-pnp-green-dark">IV. Conclusiones</h4>
                                <EditableField label="Conclusión Principal" name="conclusion_principal" value={informeFormData.conclusion_principal} onChange={handleInformeInputChange} isTextarea={true} rows={6} />
                                
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Conclusiones Secundarias</label>
                                    {conclusionesSecundarias.map((conc, idx) => (
                                        <div key={idx} className="flex gap-2 mb-2">
                                            <span className="pt-2 text-sm font-bold">{idx + 2}.</span>
                                            <textarea 
                                                className="flex-1 rounded-md border-gray-300 dark:bg-dark-bg-tertiary shadow-sm text-sm"
                                                rows={2}
                                                value={conc}
                                                onChange={(e) => updateConclusionSecundaria(idx, e.target.value)}
                                            />
                                            <button type="button" onClick={() => removeConclusionSecundaria(idx)} className="text-red-500 hover:text-red-700 px-2">✕</button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={addConclusionSecundaria} className="text-sm text-pnp-green-dark hover:underline">+ Agregar conclusión secundaria</button>
                                </div>

                                <div className="flex justify-end gap-3 pt-6 mt-6 border-t dark:border-dark-border">
                                    <button type="button" onClick={() => navigate('/perito/dashboard')} className="btn-secondary"><CancelarIcon /><span>Cancelar</span></button>
                                    <button type="button" onClick={handleGuardarYContinuar} disabled={isSubmitting} className="btn-primary"><GuardarIcon /><span>{isSubmitting ? 'Procesando...' : 'Guardar y Continuar a Firma'}</span></button>
                                </div>
                            </div>
                        </div>

                        {/* COLUMNA DERECHA: VISTA PREVIA EN VIVO */}
                        <div className="hidden lg:block h-full">
                            <div className="sticky top-4 h-full">
                                <h3 className="text-center text-sm text-gray-500 mb-2 font-medium uppercase tracking-wide">Vista Previa en Tiempo Real</h3>
                                <InformePreview data={informeFormData} examenesConsolidados={examenesConsolidados} />
                            </div>
                        </div>
                    </div>
                </TabPanel>

                {/* --- PESTAÑA 3: FIRMA Y ENVÍO --- */}
                <TabPanel>
                    <div className="max-w-4xl mx-auto bg-white dark:bg-dark-surface p-6 rounded-xl shadow-md border dark:border-dark-border text-center">
                        <h3 className="text-xl font-bold mb-4">Paso Final: Firma y Envío</h3>
                        <p className="mb-6">Los documentos han sido generados. Descárguelos, firme el Informe Pericial y súbalo para completar el proceso.</p>

                        <div className="flex justify-center gap-4 mb-8">
                            <a href={caratulaPdfUrl} download={`Caratula-${oficio?.numero_oficio}.pdf`} className="flex bg-yellow-300 items-center px-4 py-2 rounded-lg text-black dark:bg-yellow-400 font-medium hover:bg-yellow-400 transition-colors"><DownloadIcon className="mr-2" /> Descargar Carátula</a>
                            <a href={informePdfUrl} download={`Informe-Pericial-${oficio?.numero_oficio}.pdf`} className="btn-primary"><DownloadIcon className="mr-2" /> Descargar Informe</a>
                        </div>

                        <div className="max-w-md mx-auto border-t pt-6 dark:border-dark-border">
                            <label htmlFor="informe-firmado-upload" className="block text-sm font-medium mb-2">Subir Informe Pericial Firmado (PDF)</label>
                            <div className="flex items-center justify-center bg-gray-50 dark:bg-dark-bg-tertiary p-4 rounded-lg border-2 border-dashed dark:border-dark-border hover:border-pnp-green-dark transition-colors">
                                <input id="informe-firmado-upload" type="file" accept="application/pdf" onChange={handleFileChange} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pnp-green-light file:text-pnp-green-dark hover:file:bg-pnp-green-light/80 cursor-pointer" />
                            </div>
                            {selectedFile && <p className="text-sm mt-2 text-green-600 font-medium">Archivo seleccionado: {selectedFile.name}</p>}
                        </div>

                        <div className="flex justify-end gap-3 pt-6 mt-6 border-t dark:border-dark-border">
                            <button type="button" onClick={() => setTabIndex(1)} className="btn-secondary">Volver a Edición</button>
                            <button type="button" onClick={handleFinalSubmit} disabled={!selectedFile || isSubmitting} className="btn-primary">
                                <SendIcon /><span>{isSubmitting ? 'Enviando...' : 'Enviar a Mesa de Partes'}</span>
                            </button>
                        </div>
                    </div>
                </TabPanel>
            </Tabs>
        </div>
    );
};

export default ProcedimientoConsolidacion;