function CountOficiosTable({ oficiosDeLaSemana, close }) {
  return (
     <div 
    className="bg-black/30 fixed top-0 left-0 w-full h-full z-50 flex items-center justify-center p-4">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-300 w-8/12">
      <div className="flex justify-between"> 
      <h2 className="text-xl font-semibold text-green-800 dark:text-green-400 mb-4">
        Oficios registrados por día de la semana
      </h2>
      <button type="button" onClick={close} className="mb-4 px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">Cerrar</button>
      </div>
      {oficiosDeLaSemana && oficiosDeLaSemana.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Día de la semana
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Cantidad de oficios
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {oficiosDeLaSemana.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {item.dia_semana_nombre.charAt(0).toUpperCase() + item.dia_semana_nombre.slice(1)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      {item.cantidad_oficios}
                    </span>
                  </td>
                </tr>
              ))}
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

export default CountOficiosTable