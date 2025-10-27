import Documentos from "../../assets/icons/Documentos";

const DocumentManagement = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-[#1a4d2e] dark:text-green-400 mb-2">
          Gestión de Documentos
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Administrar documentación del sistema
        </p>
      </div>

      {/* Placeholder de funcionalidad */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center flex justify-center flex-col items-center border-l-4 border-green-700">
        <Documentos
          size={12}
          className="text-green-700 dark:text-green-400 mb-4"
        />
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
          Funcionalidad en Desarrollo
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          La gestión de documentos estará disponible próximamente
        </p>
      </div>
    </div>
  );
};

export default DocumentManagement;
