import { useState, useEffect, useCallback, useMemo } from 'react';
import MesaDePartesService from '../../services/mesadepartesService';
import { useNavigate } from 'react-router-dom';
import FlechaAbajo from '../../assets/icons/FlechaAbajo';

// Componente para el badge de estado (sin cambios, ya es robusto)
const EstadoBadge = ({ estado }) => {
  let colorClasses = 'bg-gray-200 text-gray-800';
  let text = estado || 'SIN ESTADO';

  switch (text.toUpperCase()) {
    case 'CREACION DEL OFICIO':
      colorClasses = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      text = 'Recién Creado';
      break;
    case 'OFICIO VISTO':
      colorClasses = 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
      text = 'Visto';
      break;
    case 'OFICIO EN PROCESO':
      colorClasses = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      text = 'En Proceso';
      break;
    case 'COMPLETADO':
    case 'CERRADO':
      colorClasses = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      text = 'Finalizado';
      break;
    default:
      if (text.startsWith('DERIVADO A:')) {
        colorClasses = 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      }
      break;
  }

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${colorClasses}`}>
      {text}
    </span>
  );
};


const SeguimientoCasos = () => {
  const [casos, setCasos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pendiente'); // Nuevo filtro de estado
  const navigate = useNavigate();

  const fetchCasos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // El backend espera 'pendiente' o 'todos', mapeamos nuestro filtro a eso.
      const backendStatus = statusFilter === 'finalizado' ? 'todos' : 'pendiente';
      
      const response = await MesaDePartesService.getCasos({ estado: backendStatus });
      if (response.error) {
        throw new Error(response.error);
      }
      setCasos(response.data || []);
    } catch (err) {
      setError(err.message);
      setCasos([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]); // Solo depende del filtro de estado para la llamada API

  useEffect(() => {
    fetchCasos();
  }, [fetchCasos]);

  const filteredCasos = useMemo(() => {
    let filtered = casos;

    // Filtrado por estado en el frontend para mayor granularidad
    if (statusFilter !== 'todos') {
      if (statusFilter === 'pendiente') {
        filtered = filtered.filter(c => !['COMPLETADO', 'CERRADO'].includes(c.estado_actual?.toUpperCase()));
      } else if (statusFilter === 'finalizado') {
         filtered = filtered.filter(c => ['COMPLETADO', 'CERRADO'].includes(c.estado_actual?.toUpperCase()));
      }
    }

    // Filtrado por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(caso =>
        caso.numero_oficio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caso.administrado?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caso.asunto?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [casos, searchTerm, statusFilter]);


  const handleRowClick = (id_oficio) => {
    navigate(`/mesadepartes/dashboard/seguimiento/casos/${id_oficio}`);
  };

  return (
    <div className="bg-white dark:bg-dark-surface p-4 sm:p-6 rounded-2xl shadow-lg">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Seguimiento de Casos</h1>
        <p className="text-gray-500 dark:text-dark-text-secondary mt-1">Busca y filtra los registros de oficios.</p>
      </div>
      
      {/* Filtros y Búsqueda */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 dark:bg-dark-bg-secondary rounded-xl border dark:border-dark-border">
        <div className="md:col-span-2">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">Buscar</label>
          <input
            id="search"
            type="text"
            placeholder="Por N° de Oficio, Asunto o Administrado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-dark-bg-tertiary dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-pnp-green-light"
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">Estado</label>
          <div className="relative">
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none px-4 py-2 border border-gray-300 rounded-lg dark:bg-dark-bg-tertiary dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-pnp-green-light"
            >
              <option value="todos">Todos</option>
              <option value="pendiente">Pendientes</option>
              <option value="finalizado">Finalizados</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-400">
              <FlechaAbajo className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Vista de Tabla para Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-dark-bg-tertiary dark:text-gray-300">
            <tr>
              <th scope="col" className="px-6 py-4 rounded-l-lg">N° Oficio</th>
              <th scope="col" className="px-6 py-4">Asunto</th>
              <th scope="col" className="px-6 py-4">Administrado</th>
              <th scope="col" className="px-6 py-4">Perito Asignado</th>
              <th scope="col" className="px-6 py-4">Fecha Creación</th>
              <th scope="col" className="px-6 py-4 rounded-r-lg">Estado</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pnp-green mx-auto"></div></td></tr>
            ) : error ? (
              <tr><td colSpan="6" className="text-center p-8 text-red-500">{error}</td></tr>
            ) : filteredCasos.length > 0 ? (
              filteredCasos.map((caso) => (
                <tr 
                  key={caso.id_oficio} 
                  className="bg-white border-b dark:bg-dark-surface dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg-secondary cursor-pointer transition-colors"
                  onClick={() => handleRowClick(caso.id_oficio)}
                >
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{caso.numero_oficio}</td>
                  <td className="px-6 py-4 max-w-xs truncate" title={caso.asunto}>{caso.asunto}</td>
                  <td className="px-6 py-4">{caso.administrado}</td>
                  <td className="px-6 py-4">{caso.perito_asignado}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(caso.fecha_creacion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td className="px-6 py-4"><EstadoBadge estado={caso.estado_actual} /></td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" className="text-center p-8 text-gray-500">No se encontraron casos que coincidan con los filtros.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Vista de Tarjetas para Móvil */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pnp-green mx-auto"></div></div>
        ) : error ? (
          <div className="text-center p-8 text-red-500">{error}</div>
        ) : filteredCasos.length > 0 ? (
          filteredCasos.map((caso) => (
            <div 
              key={caso.id_oficio}
              onClick={() => handleRowClick(caso.id_oficio)}
              className="bg-white dark:bg-dark-bg-secondary p-4 rounded-lg shadow border dark:border-dark-border active:bg-gray-100 dark:active:bg-dark-bg-tertiary cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-gray-800 dark:text-white">{caso.numero_oficio}</span>
                <EstadoBadge estado={caso.estado_actual} />
              </div>
              <p className="text-sm text-gray-700 dark:text-dark-text-primary truncate mb-2" title={caso.asunto}>{caso.asunto}</p>
              <div className="text-xs text-gray-500 dark:text-dark-text-secondary space-y-1">
                <p><span className="font-medium">Administrado:</span> {caso.administrado}</p>
                <p><span className="font-medium">Perito:</span> {caso.perito_asignado}</p>
                <p><span className="font-medium">Fecha:</span> {new Date(caso.fecha_creacion).toLocaleDateString('es-ES')}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-8 text-gray-500">No se encontraron casos.</div>
        )}
      </div>
    </div>
  );
};

export default SeguimientoCasos;