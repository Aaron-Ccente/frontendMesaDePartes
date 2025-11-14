import { useState, useEffect, useCallback } from 'react';
import MesaDePartesService from '../../services/mesadepartesService';
import { useNavigate } from 'react-router-dom';

// Componente para el badge de estado
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
  const [showClosed, setShowClosed] = useState(false);
  const navigate = useNavigate();

  const fetchCasos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        estado: showClosed ? 'todos' : 'pendiente',
        search: searchTerm,
      };
      const response = await MesaDePartesService.getCasos(params);
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
  }, [showClosed, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCasos();
    }, 500); // Debounce para no llamar a la API en cada tecleo

    return () => clearTimeout(timer);
  }, [fetchCasos]);

  const handleRowClick = (id_oficio) => {
    navigate(`/mesadepartes/dashboard/seguimiento/casos/${id_oficio}`);
  };

  return (
    <div className="bg-white dark:bg-dark-surface p-6 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Seguimiento de Casos</h1>
      
      {/* Filtros y Búsqueda */}
      <div className="flex justify-between items-center mb-4 gap-4">
        <input
          type="text"
          placeholder="Buscar por N° de Oficio o Administrado..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg dark:bg-dark-bg-secondary dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-pnp-green"
        />
        <div className="flex items-center">
          <input
            type="checkbox"
            id="showClosed"
            checked={showClosed}
            onChange={(e) => setShowClosed(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-pnp-green focus:ring-pnp-green"
          />
          <label htmlFor="showClosed" className="ml-2 text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
            Mostrar casos cerrados
          </label>
        </div>
      </div>

      {/* Tabla de Casos */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-dark-bg-tertiary dark:text-gray-300">
            <tr>
              <th scope="col" className="px-6 py-3">N° Oficio</th>
              <th scope="col" className="px-6 py-3">Fecha Creación</th>
              <th scope="col" className="px-6 py-3">Administrado</th>
              <th scope="col" className="px-6 py-3">Perito Asignado</th>
              <th scope="col" className="px-6 py-3">Estado Actual</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center p-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pnp-green mx-auto"></div>
                  <p className="mt-2">Cargando casos...</p>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="5" className="text-center p-6 text-red-500">{error}</td>
              </tr>
            ) : casos.length > 0 ? (
              casos.map((caso) => (
                <tr 
                  key={caso.id_oficio} 
                  className="bg-white border-b dark:bg-dark-surface dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg-secondary cursor-pointer"
                  onClick={() => handleRowClick(caso.id_oficio)}
                >
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{caso.numero_oficio}</td>
                  <td className="px-6 py-4">{new Date(caso.fecha_creacion).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{caso.administrado}</td>
                  <td className="px-6 py-4">{caso.perito_asignado}</td>
                  <td className="px-6 py-4">
                    <EstadoBadge estado={caso.estado_actual} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center p-6">No se encontraron casos.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Aquí se podría añadir la paginación en el futuro */}
    </div>
  );
};

export default SeguimientoCasos;