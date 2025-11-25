function EstadosOficiosTable({ estadosDeOficios, close }) {
  return (
    <div className="bg-black/30 fixed top-0 left-0 w-full h-full z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-300 w-8/12">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-green-800 dark:text-green-400 mb-4">
            Cantidad de oficios por estados
          </h2>
          <button 
            type="button" 
            onClick={close} 
            className="mb-4 px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            Cerrar
          </button>
        </div>

        {estadosDeOficios && estadosDeOficios.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cantidad
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {estadosDeOficios.map((item, index) => {
                  const estadoColors = {
                    'ENTRADA': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                    'PENDIENTE': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                    'COMPLETADO': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                  };

                  const colorClass = estadoColors[item.estado_final] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';

                  return (
                    <tr key={index}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
                          {item.estado_final || 'Desconocido'}
                        </span>
                      </td>
                     <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        {item.cantidad} 
                        </span>
                    </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No hay datos disponibles
          </div>
        )}
      </div>
    </div>
  );
}

export default EstadosOficiosTable;