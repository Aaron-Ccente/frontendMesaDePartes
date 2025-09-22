import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import Usuarios from '../../assets/icons/Usuarios';
import Error from '../../assets/icons/Error';

const Administradores = () => {
  const navigate = useNavigate();
  const [administradores, setAdministradores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);

  const adminService = authService;

  const isMountedRef = useRef(false);
  const searchTimeoutRef = useRef(null);

  const loadAdministradores = useCallback(
    async (page = 1, search = '') => {
      try {
        if (isMountedRef.current) setLoading(true);
        setError('');

        const response = adminService.getAllAdmins
          ? await adminService.getAllAdmins(page, 10, search)
          : { data: [], pagination: { pages: 1, total: 0, page } };

        if (!isMountedRef.current) return;

        const data = response.data ?? response;
        const pagination = response.pagination ?? { pages: 1, total: (Array.isArray(data) ? data.length : 0), page };

        setAdministradores(Array.isArray(data) ? data : (data || []));
        setTotalPages(pagination.pages || 1);
        setTotalAdmins(pagination.total ?? (Array.isArray(data) ? data.length : 0));
        setCurrentPage(pagination.page || page);
      } catch (err) {
        if (!isMountedRef.current) return;
        console.error('Error cargando administradores:', err);
        setError(err?.message || 'Error cargando administradores');
      } finally {
        if (!isMountedRef.current);
        setLoading(false);
      }
    },
    [adminService]
  );

  useEffect(() => {
    isMountedRef.current = true;
    loadAdministradores();

    return () => {
      isMountedRef.current = false;
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [loadAdministradores]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
      loadAdministradores(1, value);
    }, 500);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    loadAdministradores(page, searchTerm);
  };

  const handleCreateAdmin = () => navigate('/admin/dashboard/administradores/crear');
  const handleEditAdmin = (cip) => navigate(`/admin/dashboard/administradores/editar/${cip}`);

  const handleDeleteAdmin = async (cip) => {
    if (!window.confirm(`¿Eliminar al administrador con CIP ${cip}?`)) return;

    try {
      setDeleteLoading(cip);
      if (!adminService.deleteAdmin) throw new Error('deleteAdmin no implementado en authService');
      await adminService.deleteAdmin(cip);

      if (!isMountedRef.current) return;
      await loadAdministradores(currentPage, searchTerm);
      alert('Administrador eliminado correctamente');
    } catch (err) {
      console.error('Error eliminando administrador:', err);
      alert(`Error eliminando administrador: ${err?.message || err}`);
    } finally {
      if (isMountedRef.current) setDeleteLoading(null);
    }
  };

  const handleRefresh = () => loadAdministradores(currentPage, searchTerm);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d2e] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando administradores...</p>
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
              Gestión de Administradores
            </h1>
            <p className="text-gray-600">
              Administrar cuentas administrativas ({totalAdmins} total)
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
              onClick={handleCreateAdmin}
              className="bg-[#1a4d2e] hover:bg-[#2d7d4a] text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
            >
              <span className="text-xl">➕</span>
              <span>Crear Administrador</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <Error size={6} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Buscar Administrador
            </label>
            <input
              type="text"
              id="search"
              placeholder="Buscar por CIP o nombre de usuario..."
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CIP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Completo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {administradores.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <span className="w-full flex justify-center"><Usuarios size={12} /></span>
                    <p className="text-lg font-medium">No se encontraron administradores</p>
                    <p className="text-sm">{searchTerm ? 'Ajusta los filtros de búsqueda' : 'No hay administradores registrados'}</p>
                  </td>
                </tr>
              ) : (
                administradores.map((admin) => (
                  <tr key={admin.CIP || admin.nombre_usuario} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#1a4d2e] text-white">
                        {admin.CIP || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{admin.nombre_usuario || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{admin.nombre_completo || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{admin.rol || 'Administrador'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditAdmin(admin.CIP || admin.nombre_usuario)}
                          className="text-[#1a4d2e] hover:text-[#2d7d4a] transition-colors duration-200"
                          disabled={deleteLoading === (admin.CIP || admin.nombre_usuario)}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteAdmin(admin.CIP || admin.nombre_usuario)}
                          className="text-red-600 hover:text-red-800 transition-colors duration-200 disabled:opacity-50"
                          disabled={deleteLoading === (admin.CIP || admin.nombre_usuario)}
                        >
                          {deleteLoading === (admin.CIP || admin.nombre_usuario) ? <span className="animate-spin">⏳</span> : 'Eliminar'}
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
              Mostrando <span className="font-medium">{administradores.length}</span> de <span className="font-medium">{totalAdmins}</span> administradores
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      currentPage === pageNum ? 'text-white bg-[#1a4d2e] border border-[#1a4d2e]' : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
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

export default Administradores;