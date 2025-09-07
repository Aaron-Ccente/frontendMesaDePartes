const PeritoResumen = () => {
  return (
    <div className="space-y-6">
      {/* Header del Resumen */}
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg dark:shadow-gray-900/20 p-6 border border-gray-200 dark:border-dark-border">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-dark-text-primary mb-2">
          Resumen del Perito
        </h1>
        <p className="text-gray-600 dark:text-dark-text-secondary">
          Bienvenido al panel de control de peritos
        </p>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg dark:shadow-gray-900/20 p-6 border border-gray-200 dark:border-dark-border">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 dark:bg-dark-accent/20 rounded-lg">
              <span className="text-2xl text-blue-600 dark:text-dark-accent">📝</span>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-dark-text-secondary">Documentos</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-dark-text-primary">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg dark:shadow-gray-900/20 p-6 border border-gray-200 dark:border-dark-border">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 dark:bg-dark-pnp-green-dark/20 rounded-lg">
              <span className="text-2xl text-green-600 dark:text-dark-pnp-green">🔍</span>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-dark-text-secondary">Casos Activos</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-dark-text-primary">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg dark:shadow-gray-900/20 p-6 border border-gray-200 dark:border-dark-border">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <span className="text-2xl text-purple-600 dark:text-purple-400"></span>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-dark-text-secondary">Completados</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-dark-text-primary">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje de Bienvenida */}
      <div className="bg-gradient-to-r from-[#1a4d2e] to-[#2d7d4a] rounded-xl shadow-lg dark:shadow-gray-900/50 p-6 text-white">
        <h3 className="text-lg font-semibold mb-2">¡Bienvenido al Sistema!</h3>
        <p className="text-white/90 dark:text-white/80">
          Como perito, tienes acceso a la gestión de documentos, seguimiento de casos y actualización de tu perfil. 
          Utiliza la navegación lateral para acceder a las diferentes funcionalidades.
        </p>
      </div>
    </div>
  );
};

export default PeritoResumen;
