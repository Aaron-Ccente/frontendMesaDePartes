import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { peritoService } from '../../services/peritoService';
import Usuarios from '../../assets/icons/Usuarios';
import Error from '../../assets/icons/Error';

const UserManagement = () => {
  const navigate = useNavigate();
  const [peritos, setPeritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPeritos, setTotalPeritos] = useState(0);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);

  // Cargar peritos
  const loadPeritos = async (page = 1, search = '') => {
    try {
      setLoading(true);
      setError('');
      
      const response = await peritoService.getAllPeritos(page, 10, search);
      
      setPeritos(response.data);
      setTotalPages(response.pagination.pages);
      setTotalPeritos(response.pagination.total);
      setCurrentPage(response.pagination.page);
    } catch (error) {
      console.error('Error cargando peritos:', error);
      setError(error.message || 'Error cargando peritos');
    } finally {
      setLoading(false);
    }
  };

  // Cargar peritos al montar el componente
  useEffect(() => {
    loadPeritos();
  }, []);

  // Buscar peritos
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Resetear a página 1 al buscar
    setCurrentPage(1);
    
    // Debounce para la búsqueda
    const timeoutId = setTimeout(() => {
      loadPeritos(1, value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  // Cambiar página
  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadPeritos(page, searchTerm);
  };

  // Crear nuevo perito
  const handleCreatePerito = () => {
    navigate('/admin/dashboard/usuarios/crear');
  };

  // Editar perito
  const handleEditPerito = (cip) => {
    navigate(`/admin/dashboard/usuarios/editar/${cip}`);
  };

  // Eliminar perito
  const handleDeletePerito = async (cip) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar al perito con CIP ${cip}?`)) {
      return;
    }

    try {
      setDeleteLoading(cip);
      await peritoService.deletePerito(cip);
      
      // Recargar la lista
      await loadPeritos(currentPage, searchTerm);
      
      // Mostrar mensaje de éxito
      alert('Perito eliminado exitosamente');
    } catch (error) {
      console.error('Error eliminando perito:', error);
      alert(`Error eliminando perito: ${error.message}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  // Refrescar lista
  const handleRefresh = () => {
    loadPeritos(currentPage, searchTerm);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d2e] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando peritos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1a4d2e] mb-2">
              Gestión de Usuarios
            </h1>
            <p className="text-gray-600">
              Administrar peritos del sistema ({totalPeritos} total)
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleRefresh}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
            >
              <span>Actualizar</span>
            </button>
            <button
              onClick={handleCreatePerito}
              className="bg-[#1a4d2e] hover:bg-[#2d7d4a] text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
            >
              <span className="text-xl">➕</span>
              <span>Crear Perito</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <Error size={6}/>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Buscar Perito
            </label>
            <input
              type="text"
              id="search"
              placeholder="Buscar por CIP, nombres, apellidos o DNI..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent"
            />
          </div>
          <div className="flex items-end">
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200">
              Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CIP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombres
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Apellidos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DNI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sección
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Especialidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Censo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {peritos.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    <span className='w-full flex justify-center'><Usuarios size={12}/></span>
                    <p className="text-lg font-medium">No se encontraron peritos</p>
                    <p className="text-sm">
                      {searchTerm ? 'Intenta ajustar los filtros de búsqueda' : 'No hay peritos registrados en el sistema'}
                    </p>
                  </td>
                </tr>
              ) : (
                peritos.map((perito) => (
                  <tr key={perito.CIP} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#1a4d2e] text-white">
                        {perito.CIP}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {perito.Nombres || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {perito.Apellidos || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {perito.DNI || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {perito.Seccion || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {perito.Especialidad || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {perito.UltimoCenso || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditPerito(perito.CIP)}
                          className="text-[#1a4d2e] hover:text-[#2d7d4a] transition-colors duration-200"
                          disabled={deleteLoading === perito.CIP}
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleDeletePerito(perito.CIP)}
                          className="text-red-600 hover:text-red-800 transition-colors duration-200 disabled:opacity-50"
                          disabled={deleteLoading === perito.CIP}
                        >
                          {deleteLoading === perito.CIP ? (
                            <span className="animate-spin">⏳</span>
                          ) : (
                            '🗑️ Eliminar'
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{peritos.length}</span> de{' '}
              <span className="font-medium">{totalPeritos}</span> peritos
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              
              {/* Mostrar páginas */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === pageNum
                        ? 'text-white bg-[#1a4d2e] border border-[#1a4d2e]'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
