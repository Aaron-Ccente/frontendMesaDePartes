import Portal from '../ui/Portal';

const DerivacionModal = ({ peritos, onPeritoSelect, onClose, isDeriving }) => {

  const handleSelect = (perito) => {
    if (isDeriving) return;
    onPeritoSelect(perito);
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-transparent backdrop-blur-md flex justify-center items-center z-50">
        <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-2xl p-6 w-full max-w-2xl">
          <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Derivar Caso</h3>
          <div className="overflow-y-auto max-h-[60vh]">
            <table className="w-full text-left table-auto">
              <thead className="bg-gray-100 dark:bg-dark-bg-tertiary sticky top-0">
                <tr>
                  <th className="p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Nombre Completo</th>
                  <th className="p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">CIP</th>
                  <th className="p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Carga</th>
                  <th className="p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Acción</th>
                </tr>
              </thead>
              <tbody>
                {peritos.length > 0 ? (
                  peritos.map((perito) => (
                    <tr key={perito.id_usuario} className="border-b border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary">
                      <td className="p-3 text-gray-700 dark:text-gray-200">{perito.nombre_completo}</td>
                      <td className="p-3 text-gray-700 dark:text-gray-200">{perito.CIP}</td>
                      <td className="p-3 text-center text-gray-700 dark:text-gray-200">{perito.casos_activos ?? 0}</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleSelect(perito)}
                          disabled={isDeriving}
                          className="py-1 px-3 bg-pnp-green text-white rounded-md hover:bg-pnp-green-light transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {isDeriving ? 'Asignando...' : 'Seleccionar'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center p-6 text-gray-500 dark:text-gray-400">
                      No hay peritos disponibles para la derivación según el flujo de trabajo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="text-right mt-6">
            <button
              onClick={onClose}
              disabled={isDeriving}
              className="py-2 px-5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-dark-bg-tertiary dark:text-gray-200 dark:hover:bg-gray-600 transition-colors disabled:bg-gray-400"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default DerivacionModal;
