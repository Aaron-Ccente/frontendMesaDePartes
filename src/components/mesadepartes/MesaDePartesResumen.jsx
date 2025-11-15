import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CreateOfficeIcon from '../../assets/icons/CreateOfficeIcon';
import MesaDePartesService from '../../services/mesadepartesService';

// Pequeño badge para el estado del caso en la lista de recientes
const EstadoBadge = ({ estado }) => {
  let colorClasses = 'bg-gray-200 text-gray-700';
  let text = estado || 'Pendiente';

  switch (text.toUpperCase()) {
    case 'CREACION DEL OFICIO': colorClasses = 'bg-blue-100 text-blue-800'; text = 'Creado'; break;
    case 'OFICIO VISTO': colorClasses = 'bg-indigo-100 text-indigo-800'; text = 'Visto'; break;
    case 'OFICIO EN PROCESO': colorClasses = 'bg-yellow-100 text-yellow-800'; text = 'En Proceso'; break;
    case 'COMPLETADO': case 'CERRADO': colorClasses = 'bg-green-100 text-green-800'; text = 'Finalizado'; break;
    default: if (text.startsWith('DERIVADO A:')) { colorClasses = 'bg-purple-100 text-purple-800'; text = 'Derivado'; } break;
  }
  return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${colorClasses}`}>{text}</span>;
};


const MesaDePartesResumen = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ creados_hoy: 0, pendientes: 0, finalizados: 0 });
  const [recentCases, setRecentCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, casesRes] = await Promise.all([
          MesaDePartesService.getDashboardStats(),
          MesaDePartesService.getRecentCases()
        ]);

        if (statsRes.error || casesRes.error) {
          throw new Error(statsRes.error || casesRes.error || 'Error al cargar los datos del dashboard');
        }

        setStats(statsRes.data);
        setRecentCases(casesRes.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const StatCard = ({ title, value, loading }) => (
    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-6 border border-gray-200 dark:border-dark-border">
      <p className="text-sm text-gray-600 dark:text-dark-text-secondary">{title}</p>
      {loading ? (
        <div className="h-9 w-12 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mt-2"></div>
      ) : (
        <p className="text-3xl font-bold text-gray-800 dark:text-dark-text-primary mt-2">{value}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header del Panel Principal */}
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-6 border border-gray-200 dark:border-dark-border">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text-primary mb-2">
          Panel Principal
        </h1>
        <p className="text-gray-600 dark:text-dark-text-secondary">
          Bienvenido al panel de control de Mesa de Partes. Aquí tienes un resumen de tu actividad y accesos directos.
        </p>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">{error}</div>}

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Casos Creados Hoy" value={stats.creados_hoy} loading={loading} />
        <StatCard title="Casos Pendientes" value={stats.pendientes} loading={loading} />
        <StatCard title="Casos Finalizados" value={stats.finalizados} loading={loading} />
      </div>

      {/* Acciones Rápidas y Casos Recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Acciones Rápidas */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-6 border border-gray-200 dark:border-dark-border h-full">
            <h2 className="text-xl font-bold text-gray-800 dark:text-dark-text-primary mb-4">Acciones Rápidas</h2>
            <button
              onClick={() => navigate('/mesadepartes/dashboard/crear/oficio')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-pnp-green hover:bg-pnp-green-light text-white font-semibold transition-colors"
            >
              <CreateOfficeIcon />
              <span>Crear Nuevo Oficio</span>
            </button>
          </div>
        </div>

        {/* Casos Recientes */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-6 border border-gray-200 dark:border-dark-border h-full">
            <h2 className="text-xl font-bold text-gray-800 dark:text-dark-text-primary mb-4">Mis Casos Recientes</h2>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>)}
              </div>
            ) : recentCases.length > 0 ? (
              <ul className="space-y-3">
                {recentCases.map(caso => (
                  <li key={caso.id_oficio}>
                    <div // Changed from Link to div
                      className="block p-3 rounded-lg" // Removed hover styles
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-dark-text-primary truncate" title={caso.asunto}>{caso.asunto}</p>
                          <p className="text-sm text-gray-500 dark:text-dark-text-secondary">Oficio N°: {caso.numero_oficio}</p>
                        </div>
                        <div className="flex-shrink-0 ml-4">
                          <EstadoBadge estado={caso.estado_actual} />
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No has registrado ningún caso recientemente.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MesaDePartesResumen;
