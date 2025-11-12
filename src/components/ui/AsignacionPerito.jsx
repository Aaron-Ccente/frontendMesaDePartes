import { useState, useEffect } from 'react';
import { ComplementServices } from '../../services/complementService';

const AsignacionPerito = ({ idEspecialidad, onPeritoSelect, selectedPerito }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [peritos, setPeritos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPeritos = async () => {
      if (!idEspecialidad) {
        setPeritos([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await ComplementServices.getAllPeritoAccordingToSpecialty(idEspecialidad);
        const peritosData = res?.data?.data || res?.data || [];
        setPeritos(Array.isArray(peritosData) ? peritosData : [peritosData]);
      } catch (err) {
        setError('No se pudieron cargar los peritos.');
        console.error(err);
      }
      setLoading(false);
    };

    fetchPeritos();
  }, [idEspecialidad]);

  const handleSelect = (perito) => {
    onPeritoSelect(perito);
    setIsModalOpen(false);
  };

  return (
    <div>
      <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 block">
        Asignar a Perito <span className="text-red-500">*</span>
      </label>
      <div className="flex items-center gap-4">
        <div className="flex-grow p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 min-h-[42px]">
            {selectedPerito ? (
                <span className="text-gray-800 dark:text-gray-200">{selectedPerito.nombre_completo}</span>
            ) : (
                <span className="text-gray-400">No seleccionado</span>
            )}
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          disabled={!idEspecialidad || loading}
          className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Cargando...' : 'Seleccionar'}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}


      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold mb-4">Seleccionar Perito</h3>
            <div className="overflow-y-auto max-h-[60vh]">
              <table className="w-full text-left table-auto">
                <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                  <tr>
                    <th className="p-3">Nombre Completo</th>
                    <th className="p-3">CIP</th>
                    <th className="p-3">Carga de Trabajo</th>
                    <th className="p-3">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {peritos.length > 0 ? (
                    peritos.map((perito) => (
                      <tr key={perito.id_usuario} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="p-3">{perito.nombre_completo}</td>
                        <td className="p-3">{perito.CIP}</td>
                        <td className="p-3 text-center">{perito.casos_asignados ?? 0}</td>
                        <td className="p-3">
                          <button
                            onClick={() => handleSelect(perito)}
                            className="py-1 px-3 bg-green-600 text-white rounded-md hover:bg-green-700"
                          >
                            Seleccionar
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center p-6 text-gray-500">
                        No hay peritos disponibles para esta especialidad.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="text-right mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="py-2 px-5 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AsignacionPerito;
