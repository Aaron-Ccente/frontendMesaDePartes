const PeritoCasos = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-[#1a4d2e] mb-2">
          Mis Casos
        </h1>
        <p className="text-gray-600 text-lg">
          Revisa y gestiona los casos asignados a ti
        </p>
      </div>

      {/* Placeholder Content */}
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <div className="text-6xl mb-4"></div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Gestión de Casos
        </h2>
        <p className="text-gray-600 mb-6">
          Aquí podrás ver todos los casos que te han sido asignados y su estado actual.
        </p>
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg inline-block">
          <p className="text-sm">Funcionalidad en desarrollo</p>
        </div>
      </div>
    </div>
  );
};

export default PeritoCasos;
