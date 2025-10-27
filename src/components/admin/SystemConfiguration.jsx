import Configuracion from "../../assets/icons/Configuracion";

const SystemConfiguration = () => {
  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-[#14532d] dark:text-green-400 mb-2">
          Configuración del Sistema
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Ajustes y parámetros del sistema
        </p>
      </div>

      {/* Contenido principal */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center flex flex-col justify-center items-center">
        <Configuracion size={12} className="text-gray-700 dark:text-gray-300" />
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
          Funcionalidad en Desarrollo
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          La configuración del sistema estará disponible próximamente
        </p>
      </div>
    </div>
  );
};

export default SystemConfiguration;
