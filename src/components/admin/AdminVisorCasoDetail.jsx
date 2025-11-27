// frontend-mesa-de-partes/src/components/admin/AdminVisorCasoDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import adminViewerService from '../../services/adminViewerService';
import { Toaster, toast } from 'sonner';
import { getStatusBadge } from './AdminUIHelpers';
import ResultadosRenderer from './ResultadosRenderer';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

const DetailCard = ({ title, children }) => (
  <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6 mb-6">
    <h2 className="text-xl font-bold mb-4 text-[#1a4d2e] dark:text-green-400 border-b-2 border-gray-200 dark:border-dark-border pb-2">{title}</h2>
    {children}
  </div>
);

const InfoPair = ({ label, value }) => (
    <div className="flex flex-col sm:flex-row mb-2">
        <p className="w-full sm:w-1/3 font-semibold text-gray-600 dark:text-dark-text-secondary">{label}:</p>
        <p className="w-full sm:w-2/3 text-gray-800 dark:text-dark-text-primary break-words">{value || 'N/A'}</p>
    </div>
);

const AdminVisorCasoDetail = () => {
  const { id } = useParams();
  const [caso, setCaso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCaso = async () => {
      try {
        setLoading(true);
        const response = await adminViewerService.getCaseById(id);
        if (response.success) {
            setCaso(response.data);
        } else {
            throw new Error(response.message || 'Failed to fetch case details');
        }
        setError(null);
      } catch (err) {
        setError(err.message);
        toast.error(`Error al cargar los detalles del caso: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCaso();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d2e]"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4 bg-red-100 rounded-md">Error: {error}</div>;
  }
  
  if (!caso) {
    return <div className="text-center">No se encontraron datos para este caso.</div>;
  }

  const { oficio, perito_asignado, examenes, muestras, seguimiento, resultados_peritos, documentos } = caso;

  return (
    <div className="container mx-auto p-4">
      <Toaster richColors position="top-center" />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text-primary">Detalle del Caso: {oficio.numero_oficio}</h1>
        <Link to="/admin/dashboard/visor-casos" className="bg-[#1a4d2e] text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition-colors duration-200">
          &larr; Volver a la Lista
        </Link>
      </div>

      <DetailCard title="Información del Oficio">
        <InfoPair label="N° Oficio" value={oficio.numero_oficio} />
        <InfoPair label="Asunto" value={oficio.asunto} />
        <InfoPair label="Fecha de Creación" value={new Date(oficio.fecha_creacion).toLocaleString('es-ES')} />
        <InfoPair label="Administrado" value={oficio.examinado_incriminado} />
        <InfoPair label="Delito" value={oficio.delito} />
        <InfoPair label="Unidad Solicitante" value={oficio.unidad_solicitante} />
      </DetailCard>

      {perito_asignado && (
        <DetailCard title="Perito Asignado Principal">
          <InfoPair label="Nombre" value={perito_asignado.nombre_completo} />
          <InfoPair label="CIP" value={perito_asignado.CIP} />
        </DetailCard>
      )}

      <DetailCard title="Exámenes Requeridos">
        <ul className="list-disc list-inside space-y-1">
          {examenes?.map((e, i) => <li key={i} className="text-gray-800 dark:text-dark-text-primary">{e.nombre_examen} ({e.seccion_cargo})</li>)}
        </ul>
      </DetailCard>

      <DetailCard title="Muestras Registradas">
        {muestras?.length > 0 ? (
          <div className="space-y-4">
            {muestras.map(m => (
              <div key={m.id_muestra} className="border rounded-lg p-4 bg-gray-50 dark:bg-dark-bg-tertiary dark:border-dark-border">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100">{m.codigo_muestra}</h4>
                  {m.esta_lacrado ? (
                    <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full dark:bg-blue-800 dark:text-blue-200">Lacrado</span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full dark:bg-red-800 dark:text-red-200">No Lacrado</span>
                  )}
                </div>
                <InfoPair label="Tipo" value={m.tipo_muestra} />
                <InfoPair label="Cantidad" value={m.cantidad} />
                {m.descripcion && <InfoPair label="Descripción" value={m.descripcion} />}
                <InfoPair label="Fecha Recolección" value={new Date(m.fecha_recoleccion).toLocaleString('es-ES')} />
                
                {m.resultado_analisis && (
                    <div className="mt-3 pt-3 border-t dark:border-dark-border">
                        <h5 className="font-semibold text-md mb-1 text-gray-700 dark:text-gray-200">Resultado del Análisis:</h5>
                        <ResultadosRenderer jsonData={m.resultado_analisis} />
                    </div>
                )}
              </div>
            ))}
          </div>
        ) : <p className="text-gray-500 dark:text-gray-400">No hay muestras registradas.</p>}
      </DetailCard>
      
      <DetailCard title="Historial de Seguimiento">
        <div className="relative border-l-2 border-gray-200 dark:border-dark-border ml-3">
            {seguimiento?.map((s, i) => (
                <div key={s.id_seguimiento} className={`mb-6 ml-8 ${i === seguimiento.length - 1 ? 'mb-0' : ''}`}>
                    <div className="absolute -left-1.5 mt-1.5 w-4 h-4 bg-[#1a4d2e] rounded-full border-4 border-white dark:border-dark-surface"></div>
                    <time className="mb-1 text-sm font-normal leading-none text-gray-500 dark:text-dark-text-secondary">{new Date(s.fecha_seguimiento).toLocaleString('es-ES')}</time>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary flex items-center gap-2">
                        {getStatusBadge(s.estado_nuevo)}
                    </h3>
                    <p className="text-sm font-normal text-gray-600 dark:text-dark-text-primary">Usuario: {s.nombre_usuario}</p>
                    {s.observaciones && <p className="mt-1 text-base font-normal text-gray-500 dark:text-gray-400">{s.observaciones}</p>}
                </div>
            ))}
        </div>
      </DetailCard>

      <DetailCard title="Resultados de Peritos">
        {resultados_peritos?.length > 0 ? (
            resultados_peritos.map((r, index) => (
                <div key={index} className="mb-4 p-3 border rounded-md bg-gray-50 dark:bg-dark-bg-tertiary dark:border-dark-border">
                    <p><strong>Perito:</strong> {r.perito_nombres}</p>
                    <p><strong>Fecha:</strong> {new Date(r.fecha_resultado).toLocaleString('es-ES')}</p>
                    <div className="mt-2">
                      <ResultadosRenderer jsonData={r.resultados} />
                    </div>
                </div>
            ))
        ) : <p className="text-gray-500 dark:text-gray-400">Aún no hay resultados registrados.</p>}
      </DetailCard>

      <DetailCard title="Documentos Adjuntos">
         {documentos?.length > 0 ? (
            <ul className="list-disc list-inside space-y-2">
                {documentos.map((doc, index) => (
                    <li key={index}>
                        <a 
                            href={`${API_BASE_URL}/${doc.ruta_archivo_local.replace(/\\/g, '/')}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                            {doc.nombre_archivo} <span className="text-gray-500 text-sm">({doc.tipo_archivo})</span>
                        </a>
                    </li>
                ))}
            </ul>
         ) : <p className="text-gray-500 dark:text-gray-400">No hay documentos adjuntos.</p>}
      </DetailCard>

    </div>
  );
};

export default AdminVisorCasoDetail;
