import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import Usuarios from '../../assets/icons/Usuarios';
import Error from '../../assets/icons/Error';

const MesaDePartes = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);

  const service = authService;

  const isMountedRef = useRef(false);
  const searchTimeoutRef = useRef(null);

  const loadUsuarios = useCallback(
    async (page = 1, search = '') => {
      try {
        if (isMountedRef.current) setLoading(true);
        setError('');

        const response = service.getAllAdmins
          ? await service.getAllAdmins(page, 10, search)
          : { data: [], pagination: { pages: 1, total: 0, page } };

        if (!isMountedRef.current) return;

        const data = response.data ?? response;
        const pagination = response.pagination ?? { pages: 1, total: (Array.isArray(data) ? data.length : 0), page };

        setUsuarios(Array.isArray(data) ? data : (data || []));
        setTotalPages(pagination.pages || 1);
        setTotalUsuarios(pagination.total ?? (Array.isArray(data) ? data.length : 0));
        setCurrentPage(pagination.page || page);
      } catch (err) {
        if (!isMountedRef.current) return;
        console.error('Error cargando usuarios:', err);
        setError(err?.message || 'Error cargando usuarios');
      } finally {
        if (!isMountedRef.current);
        setLoading(false);
      }
    },
    [service]
  );

  useEffect(() => {
    isMountedRef.current = true;
    loadUsuarios();

    return () => {
      isMountedRef.current = false;
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [loadUsuarios]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
      loadUsuarios(1, value);
    }, 500);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    loadUsuarios(page, searchTerm);
  };

  const handleCreate = () => navigate('/admin/dashboard/mesadepartes/crear');
  const handleEdit = (cip) => navigate(`/admin/dashboard/mesadepartes/editar/${cip}`);

  const handleDelete = async (cip) => {
    if (!window.confirm(`¿Eliminar al usuario con CIP ${cip}?`)) return;

    try {
      setDeleteLoading(cip);
      if (!service.deleteAdmin) throw new Error('deleteAdmin no implementado en authService');
      await service.deleteAdmin(cip);

      if (!isMountedRef.current) return;
      await loadUsuarios(currentPage, searchTerm);
      alert('Usuario eliminado correctamente');
    } catch (err) {
      console.error('Error eliminando usuario:', err);
      alert(`Error eliminando usuario: ${err?.message || err}`);
    } finally {
      if (isMountedRef.current) setDeleteLoading(null);
    }
  };

  const handleRefresh = () => loadUsuarios(currentPage, searchTerm);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d2e] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Cargando usuarios de mesa de partes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1a4d2e] dark:text-green-400 mb-2">
              Gestión de usuarios de Mesa de Partes
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Administrar cuentas ({totalUsuarios} total)
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
              onClick={handleCreate}
              className="bg-[#1a4d2e] hover:bg-[#2d7d4a] text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
            >
              <span className="text-xl">➕</span>
              <span>Crear usuario</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-300 px-4 py-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <Error size={6} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buscar usuario
            </label>
            <input
              type="text"
              id="search"
              placeholder="Buscar por CIP o nombre de usuario..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent dark:bg-gray-900 dark:text-gray-200"
            />
          </div>
          <div className="flex items-end">
            <button className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg transition-colors duration-200">
              Filtrar
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">CIP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nombre Completo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <span className="w-full flex justify-center"><Usuarios size={12} /></span>
                    <p className="text-lg font-medium">No se encontraron usuarios</p>
                    <p className="text-sm">{searchTerm ? 'Ajusta los filtros de búsqueda' : 'No hay usuarios registrados'}</p>
                  </td>
                </tr>
              ) : (
                usuarios.map((u) => (
                  <tr key={u.CIP || u.nombre_usuario} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#1a4d2e] text-white">
                        {u.CIP || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">{u.nombre_usuario || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">{u.nombre_completo || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">{u.rol || 'MesaDePartes'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(u.CIP || u.nombre_usuario)}
                          className="text-[#1a4d2e] dark:text-green-400 hover:text-[#2d7d4a] dark:hover:text-green-300 transition-colors duration-200"
                          disabled={deleteLoading === (u.CIP || u.nombre_usuario)}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(u.CIP || u.nombre_usuario)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 transition-colors duration-200 disabled:opacity-50"
                          disabled={deleteLoading === (u.CIP || u.nombre_usuario)}
                        >
                          {deleteLoading === (u.CIP || u.nombre_usuario) ? <span className="animate-spin">⏳</span> : 'Eliminar'}
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Mostrando <span className="font-medium">{usuarios.length}</span> de <span className="font-medium">{totalUsuarios}</span> usuarios
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>

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
                      currentPage === pageNum ? 'text-white bg-[#1a4d2e] border border-[#1a4d2e]' : 'text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default MesaDePartes;