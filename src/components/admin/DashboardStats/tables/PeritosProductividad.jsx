function PeritosProductividad({ productividadPorPerito, close, filtro = "dia" }) {
  // Función para formatear según el tipo de filtro
  const formatearFila = (item) => {
    const rawAcc = (item.acciones_realizadas 
    ?? item.accionesRealizadas 
    ?? item.acciones) || null;
    const acciones = (rawAcc === null || rawAcc === '' || typeof rawAcc === 'undefined')
      ? null
      : Number(rawAcc);

    switch (filtro) {
      case "mes":
        return {
          nombre: item.nombre_completo,
          periodo: item.mes && item.anio ? `${item.mes}/${item.anio}` : "-",
          acciones
        };
      case "año":
        return {
          nombre: item.nombre_completo,
          periodo: item.anio ? `${item.anio}` : "-",
          acciones
        };
      case "dia":
      default: {
        const fechaRaw = item.fecha_seguimiento ?? item.dia ?? item.fecha ?? null;
        const periodo = fechaRaw ? new Date(fechaRaw).toLocaleDateString('es-PE') : "-";
        return {
          nombre: item.nombre_completo,
          periodo,
          acciones
        };
      }
    }
  };

  const getPeriodoLabel = () => {
    switch (filtro) {
      case "mes":
        return "Mes";
      case "año":
        return "Año";
      case "dia":
      default:
        return "Día";
    }
  };

  return (
    <div className="bg-black/30 fixed top-0 left-0 w-full h-full z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-300 w-8/12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-green-800 dark:text-green-400">
            Productividad por Perito
          </h2>
          <button 
            type="button" 
            onClick={close} 
            className="px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            Cerrar
          </button>
        </div>

        {productividadPorPerito && productividadPorPerito.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Perito
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {getPeriodoLabel()}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acciones Realizadas
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {productividadPorPerito.map((item, index) => {
                  const fila = formatearFila(item);
                  const acciones = fila.acciones;
                  const isActive = acciones !== null && acciones > 0;
                  
                  return (
                    <tr key={`${item.id_usuario ?? item.id}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {fila.nombre || "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {fila.periodo}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {acciones === null ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            -
                          </span>
                        ) : (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            acciones === 0
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : acciones <= 2
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : acciones <= 4
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          }`}>
                            {acciones}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {isActive ? 'Activo' : 'Inactivo'}
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

export default PeritosProductividad;