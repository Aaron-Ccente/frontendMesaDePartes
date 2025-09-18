import Configuracion from '../../assets/icons/Configuracion';

const SystemConfiguration = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-[#1a4d2e] mb-2">
          Configuración del Sistema
        </h1>
        <p className="text-gray-600">
          Ajustes y parámetros del sistema
        </p>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg p-12 text-center flex flex-col justify-center items-center">
        <Configuracion size={12}/>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          Funcionalidad en Desarrollo
        </h2>
        <p className="text-gray-500">
          La configuración del sistema estará disponible próximamente
        </p>
      </div>
    </div>
  );
};

export default SystemConfiguration;
