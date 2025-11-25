function OficiosEspecialidad({ oficiosPorEspecialidad, close }) {
  // Procesar datos
  const getProcessedData = () => {
    if (!oficiosPorEspecialidad || oficiosPorEspecialidad.length === 0) {
      return [];
    }
    const conCantidad = Array.isArray(oficiosPorEspecialidad[0]) 
      ? oficiosPorEspecialidad[0] 
      : [];

    const todas = Array.isArray(oficiosPorEspecialidad[1]) 
      ? oficiosPorEspecialidad[1] 
      : [];

    const result = [];

    // Agregar cantidades
    conCantidad.forEach(item => {
      result.push({
        ...item,
        cantidad_oficios: Number(item.cantidad_oficios) || 0,
        tieneOficios: true
      });
    });

    // Agregar las que no están en la primera lista
    todas.forEach(item => {
      const existe = conCantidad.some(e => e.especialidad === item.especialidad);
      if (!existe) {
        result.push({
          especialidad: item.especialidad,
          cantidad_oficios: 0,
          tieneOficios: false
        });
      }
    });

    return result;
  };

  const processedData = getProcessedData();
  const totalOficios = processedData.reduce((sum, item) => sum + item.cantidad_oficios, 0);

  return (
    <div className="bg-black/30 fixed top-0 left-0 w-full h-full z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-300 w-8/12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-green-800 dark:text-green-400">
            Oficios por Especialidad
          </h2>
          <button 
            type="button" 
            onClick={close} 
            className="px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            Cerrar
          </button>
        </div>

        {processedData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Especialidad
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cantidad de Oficios
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Porcentaje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {processedData.map((item, index) => {
                  const porcentaje = totalOficios > 0 ? ((item.cantidad_oficios / totalOficios) * 100).toFixed(1) : 0;
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {item.especialidad}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    {item.cantidad_oficios}
                    </span>
                  </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                item.cantidad_oficios === 0
                                  ? 'bg-gray-400'
                                  : 'bg-green-600'
                              }`}
                              style={{ width: `${porcentaje}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-300 min-w-max">{porcentaje}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800 dark:text-gray-200">Total</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-500 text-white">
                      {totalOficios}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300">100%</td>
                </tr>
              </tfoot>
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

export default OficiosEspecialidad;