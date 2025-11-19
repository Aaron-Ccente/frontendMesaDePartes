import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../../hooks/useAuth';
import { OficiosService } from '../../../services/oficiosService';
import { ProcedimientoService } from '../../../services/procedimientoService';
import { DocumentService } from '../../../services/documentService';
import PDFPreviewModal from '../../documentos/PDFPreviewModal';
import { GuardarIcon, CancelarIcon, PreviewIcon } from '../../../assets/icons/Actions';

const ProcedimientoConsolidacion = () => {
    const { id: id_oficio } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Estados
    const [oficio, setOficio] = useState(null);
    const [resultadosPrevios, setResultadosPrevios] = useState([]);
    const [metadata, setMetadata] = useState({});
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Estados para el Informe Final (Consolidado)
    const [formData, setFormData] = useState({
        destinatario_cargo: 'JEFE DE LA UNIDAD SOLICITANTE',
        destinatario_nombre: '',
        asunto: '',
        conclusiones: '',
        observaciones: ''
    });

    // Modal PDF
    const [pdfUrl, setPdfUrl] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            // 1. Obtener detalles del oficio
            const resOficio = await OficiosService.getOficioDetalle(id_oficio);
            if (!resOficio.data) throw new Error('No se encontró el oficio.');
            setOficio(resOficio.data);

            // 2. Obtener TODOS los resultados registrados
            const resResultados = await ProcedimientoService.obtenerResultadosCompletos(id_oficio);
            if (resResultados.success) {
                setResultadosPrevios(resResultados.data || []);

                // Extraer metadatos si existen en el primer resultado o buscar endpoint específico
                // Por ahora simulamos que vienen en los resultados o del oficio
                setMetadata({
                    objeto_pericia: resOficio.data.objeto_pericia || 'Análisis Toxicológico',
                    metodo_utilizado: 'Ver anexos respectivos.'
                });

                // Generar sugerencias
                const sugerencia = generarConclusionSugerida(resResultados.data, resOficio.data.examinado_incriminado);
                setFormData(prev => ({
                    ...prev,
                    asunto: `Informe Pericial de ${resOficio.data.asunto || 'Toxicología'}`,
                    conclusiones: sugerencia
                }));
            }

        } catch (error) {
            toast.error(`Error al cargar datos: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, [id_oficio]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const generarConclusionSugerida = (resultados, nombreImplicado) => {
        if (!resultados || resultados.length === 0) return '';
        let positivos = [];
        resultados.forEach(res => {
            if (res.resultados) {
                Object.entries(res.resultados).forEach(([key, val]) => {
                    if (val === 'POSITIVO') positivos.push(key.toUpperCase().replace(/_/g, ' '));
                });
            }
        });
        positivos = [...new Set(positivos)];

        if (positivos.length > 0) {
            return `Las muestras analizadas de la persona "${nombreImplicado}" dieron resultado POSITIVO para: ${positivos.join(', ')}.`;
        } else {
            return `Las muestras analizadas de la persona "${nombreImplicado}" dieron resultado NEGATIVO para las sustancias investigadas.`;
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePreview = async () => {
        if (!oficio || !user) return;

        const coverData = {
            lugarFecha: `Huancayo, ${new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}`,
            numOficio: oficio.numero_oficio,
            destCargo: formData.destinatario_cargo,
            destNombre: formData.destinatario_nombre,
            destPuesto: '',
            asuntoBase: `Informe Pericial de ${oficio.asunto || 'Toxicología'}`,
            asuntoRemite: 'REMITE',
            referencia: `OF. N° ${oficio.numero_oficio}`,
            cuerpoP1_1: 'Me dirijo a Usted, con la finalidad de remitir adjunto al presente el informe Pericial de Ingeniería Forense – ',
            cuerpoP1_2: 'Físico N° 2328-2329/25',
            cuerpoP1_3: ', practicado en las muestras remitidas ',
            cuerpoP1_4: 'M1 y M2: (Planchas metálicas con caracteres y números "A4P-236" "D11", las mismas que se adjuntan a la presente con su respectiva cadena de custodia)',
            cuerpoP1_5: ', de conformidad al documento de la referencia. Se adjunta acta de deslacrado y lacrado de muestras para análisis pericial de ingeniería forense.',
            regNum: 'PENDIENTE',
            regIniciales: user.nombre_completo ? user.nombre_completo.split(' ').map(n => n.charAt(0)).join('').substring(0, 3) : 'XXX',
            firmanteQS: user.cip,
            firmanteNombre: user.nombre_completo,
            firmanteCargo: user.cargo,
            firmanteDependencia: 'OFICRI PNP - HUANCAYO',
            conclusiones_finales: formData.conclusiones,
            observaciones_finales: formData.observaciones,
        };

        // Formatear anexos para el template
        const anexos = resultadosPrevios.map((res) => ({
            reportNumber: `${oficio.numero_oficio}-${res.tipo_procedimiento}`,
            procedencia: oficio.unidad_solicitante,
            oficioNumber: oficio.numero_oficio,
            oficioDate: oficio.fecha,
            incidentTime: oficio.hora_incidente || 'No encontrado',
            incidentDate: oficio.fecha_incidente || 'No encontrado',
            sampleTime: res.hora_toma_muestra || 'No encontrado',
            sampleDate: res.fecha_toma_muestra || 'No encontrado',
            subjectName: oficio.examinado_incriminado,
            subjectAge: oficio.edad_examinado,
            conductor: oficio.conductor,
            sarroResult: res.resultados.sarro_ungueal || 'No encontrado',
            resultados: res.resultados,
            conclusion1: `La muestra M1 analizada de la persona: "${oficio.examinado_incriminado} (${oficio.edad_examinado})", dieron resultado: ${
                Object.values(res.resultados).includes('POSITIVO') ? `<strong>POSITIVO</strong> para ${Object.keys(res.resultados).filter(k => res.resultados[k] === 'POSITIVO').join(', ')}` : 'NEGATIVO'
            } en el análisis toxicológico y <strong>${res.resultados.sarro_ungueal || 'No encontrado'}</strong> para ADHERENCIAS DE DROGAS ILICITAS en muestra de SARRO UNGUEAL.`,
            perito: {
                nombre: res.perito_nombre,
                cip: res.perito_cip,
                dni: res.perito_dni,
                cqfp: res.perito_cqfp,
                iniciales: res.perito_nombre.split(' ').map(n => n.charAt(0)).join(''),
                cg: res.perito_cg,
                grado: res.perito_grado,
            },
            footerDate: `Huancayo, ${new Date(res.fecha_creacion).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}`,
        }));

        const extraData = {
            ...coverData,
            anexos: anexos,
        };

        toast.info('Generando vista previa del Dictamen Consolidado...');
        const url = await DocumentService.getPreviewUrl(id_oficio, 'lab/dictamen_consolidado', extraData);

        if (url) {
            setPdfUrl(url);
            setIsModalOpen(true);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.conclusiones) {
            toast.error('Las conclusiones son obligatorias.');
            return;
        }

        if (!window.confirm('¿Está seguro de emitir el Dictamen Pericial? Esta acción cerrará el caso.')) {
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                conclusiones: formData.conclusiones,
                observaciones: formData.observaciones,
                cerrar_caso: true
            };

            const res = await ProcedimientoService.registrarConsolidacion(id_oficio, payload);

            if (res.success) {
                toast.success('Dictamen emitido exitosamente. El caso ha sido cerrado.');
                navigate('/perito/dashboard');
            } else {
                throw new Error(res.message);
            }
        } catch (error) {
            toast.error(`Error al consolidar: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Cargando datos para consolidación...</div>;

    return (
        <>
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text-primary">
                        Consolidación y Emisión de Dictamen Pericial
                    </h1>
                    <p className="text-lg text-gray-500 dark:text-dark-text-secondary mt-1">
                        Oficio N°: <span className="font-semibold text-pnp-green-dark dark:text-dark-pnp-green">{oficio?.numero_oficio}</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* COLUMNA IZQUIERDA: DATOS PARA CONSIDERAR */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-dark-surface p-5 rounded-xl shadow-sm border dark:border-dark-border">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3 border-b pb-2">
                                Datos para el Dictamen
                            </h3>
                            <div className="space-y-4 text-sm">
                                <div>
                                    <span className="block font-semibold text-gray-600 dark:text-gray-400">Objeto de la Pericia:</span>
                                    <p className="text-gray-800 dark:text-gray-200">{metadata.objeto_pericia || 'No especificado'}</p>
                                </div>
                                <div>
                                    <span className="block font-semibold text-gray-600 dark:text-gray-400">Método Utilizado:</span>
                                    <p className="text-gray-800 dark:text-gray-200">{metadata.metodo_utilizado || 'No especificado'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-dark-surface p-5 rounded-xl shadow-sm border dark:border-dark-border">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3 border-b pb-2">
                                Resultados Previos
                            </h3>
                            {resultadosPrevios.length === 0 ? (
                                <p className="text-gray-500 italic text-sm">No hay resultados registrados.</p>
                            ) : (
                                <div className="space-y-3">
                                    {resultadosPrevios.map((res, idx) => (
                                        <div key={idx} className="p-3 bg-gray-50 dark:bg-dark-bg-tertiary rounded border dark:border-dark-border text-sm">
                                            <div className="font-bold text-pnp-green-dark mb-1">{res.tipo_procedimiento}</div>
                                            <div className="text-xs text-gray-500 mb-2">Por: {res.perito_nombre}</div>
                                            <div className="grid grid-cols-1 gap-1">
                                                {res.resultados && Object.entries(res.resultados).map(([key, val]) => (
                                                    <div key={key} className="flex justify-between">
                                                        <span className="capitalize text-gray-600">{key.replace(/_/g, ' ')}:</span>
                                                        <span className={`font-semibold ${val === 'POSITIVO' ? 'text-red-600' : 'text-green-600'}`}>{val}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: FORMULARIO DE REDACCIÓN */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-md border dark:border-dark-border space-y-6">
                            <div className="flex justify-between items-center border-b dark:border-dark-border pb-3">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Redacción del Dictamen</h3>
                                <button type="button" onClick={handlePreview} className="btn-secondary text-sm flex items-center gap-2">
                                    <PreviewIcon />
                                    <span>Vista Previa Completa</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-dark-text-secondary">Cargo Destinatario</label>
                                    <input type="text" name="destinatario_cargo" value={formData.destinatario_cargo} onChange={handleInputChange} className="mt-1 form-input w-full" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-dark-text-secondary">Nombre Destinatario (Opcional)</label>
                                    <input type="text" name="destinatario_nombre" value={formData.destinatario_nombre} onChange={handleInputChange} className="mt-1 form-input w-full" placeholder="Ej: CAP. PNP JUAN PEREZ" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-600 dark:text-dark-text-secondary">Asunto</label>
                                    <input type="text" name="asunto" value={formData.asunto} onChange={handleInputChange} className="mt-1 form-input w-full" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-dark-text-secondary mb-2">
                                    Conclusiones Finales
                                </label>
                                <textarea
                                    name="conclusiones"
                                    value={formData.conclusiones}
                                    onChange={handleInputChange}
                                    rows="6"
                                    className="form-input w-full font-mono text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-dark-text-secondary mb-2">
                                    Observaciones Finales
                                </label>
                                <textarea
                                    name="observaciones"
                                    value={formData.observaciones}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="form-input w-full"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t dark:border-dark-border">
                                <button type="button" onClick={() => navigate('/perito/dashboard')} className="btn-secondary">
                                    <CancelarIcon />
                                    <span>Cancelar</span>
                                </button>
                                <button type="submit" disabled={isSubmitting} className="btn-primary bg-blue-600 hover:bg-blue-700 border-blue-600">
                                    <GuardarIcon />
                                    <span>{isSubmitting ? 'Procesando...' : 'Emitir Dictamen y Cerrar Caso'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <PDFPreviewModal pdfUrl={pdfUrl} onClose={() => setIsModalOpen(false)} />
            )}
        </>
    );
};

export default ProcedimientoConsolidacion;
