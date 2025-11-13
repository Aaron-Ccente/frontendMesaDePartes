import { useNavigate } from 'react-router-dom';
import CreateOfficeIcon from '../../assets/icons/CreateOfficeIcon';

const MesaDePartesResumen = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Header del Panel Principal */}
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-6 border border-gray-200 dark:border-dark-border">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text-primary mb-2">
          Panel Principal
        </h1>
        <p className="text-gray-600 dark:text-dark-text-secondary">
          Bienvenido al panel de control de Mesa de Partes. Aquí tienes un resumen de la actividad y accesos directos.
        </p>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-6 border border-gray-200 dark:border-dark-border">
          <p className="text-sm text-gray-600 dark:text-dark-text-secondary">Casos Creados Hoy</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-dark-text-primary mt-2">0</p>
        </div>
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-6 border border-gray-200 dark:border-dark-border">
          <p className="text-sm text-gray-600 dark:text-dark-text-secondary">Casos Pendientes</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-dark-text-primary mt-2">0</p>
        </div>
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg p-6 border border-gray-200 dark:border-dark-border">
          <p className="text-sm text-gray-600 dark:text-dark-text-secondary">Casos Finalizados</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-dark-text-primary mt-2">0</p>
        </div>
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
            <h2 className="text-xl font-bold text-gray-800 dark:text-dark-text-primary mb-4">Casos Recientes</h2>
            <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Aquí se mostrará una lista de los últimos 5 casos registrados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MesaDePartesResumen;
