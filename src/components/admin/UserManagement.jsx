import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PeritoService } from "../../services/peritoService";
import Usuarios from "../../assets/icons/Usuarios";
import Error from "../../assets/icons/Error";
import EditIcon from "../../assets/icons/EditIcon";
import DeleteIcon from "../../assets/icons/DeleteIcon";
import DisableIcon from "../../assets/icons/DisableIcon";
import EnableIcon from "../../assets/icons/EnableIcon";
import EnableAndDesableUser from "../ui/EnableAndDesableUser";
import BarCharPeritosProductividadIndividual from "./DashboardStats/BarCharPeritosProductividadIndividual";
import Estadistica from "../../assets/icons/Estadistica";

const UserManagement = () => {
  const navigate = useNavigate();
  const [peritos, setPeritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updateComponent, setUpdateComponent] = useState(false);
  const [enableOption, setEnableOption] = useState({ open: false, id_usuario: null, id_estado: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPeritos, setTotalPeritos] = useState(0);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [productivityModal, setProductivityModal] = useState({
    open: false,
    cip: null,
    loading: false,
    data: null,
    filtro: 'dia'
  });

  const isMountedRef = useRef(false);
  const searchTimeoutRef = useRef(null);

  const loadPeritos = useCallback(
    async (page = 1, search = "") => {
      try {
        if (isMountedRef.current) setLoading(true);
        setError("");

        const response = await PeritoService.getAllPeritos(page, 10, search);

        if (!isMountedRef.current) return;

        setPeritos(response.data);
        setTotalPages(response.pagination.pages);
        setTotalPeritos(response.pagination.total);
        setCurrentPage(response.pagination.page);
      } catch (error) {
        if (!isMountedRef.current) return;
        console.error("Error cargando peritos:", error);
        setError(error.message || "Error cargando peritos");
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    isMountedRef.current = true;
    setUpdateComponent(false);
    loadPeritos();

    return () => {
      isMountedRef.current = false;
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [loadPeritos, updateComponent]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
      loadPeritos(1, value);
    }, 500);
  };

  const handleEnableOption = ({ id_usuario, motivo_anterior, fecha_anterior, id_estado }) => {
    setEnableOption({
      open: !enableOption.open,
      id_usuario,
      motivo_anterior,
      fecha_anterior,
      id_estado,
      update: false,
    });
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    loadPeritos(page, searchTerm);
  };

  const handleCreatePerito = () => {
    navigate("/admin/dashboard/usuarios/crear");
  };

  const handleEditPerito = (cip) => {
    navigate(`/admin/dashboard/usuarios/editar/${cip}`);
  };

  const handleDeletePerito = async (cip) => {
    if (!window.confirm(`¿Eliminar al perito con CIP ${cip}?`)) return;

    try {
      setDeleteLoading(cip);
      await PeritoService.deletePerito(cip);
      await loadPeritos(currentPage, searchTerm);
      alert("Perito eliminado exitosamente");
    } catch (error) {
      console.error("Error eliminando perito:", error);
      alert(`Error eliminando perito: ${error.message}`);
    } finally {
      if (isMountedRef.current) setDeleteLoading(null);
    }
  };

  const handleRefresh = () => loadPeritos(currentPage, searchTerm);

  // Abrir modal y cargar datos de productividad por CIP
  const handleOpenProductivity = async (cip) => {
    setProductivityModal({ open: true, cip, loading: true, data: null, filtro: 'dia' });
    try {
      const resp = await PeritoService.getPeritoStatsByCIP(cip);
      const payload = resp?.data ?? resp;
      setProductivityModal(prev => ({ ...prev, loading: false, data: payload || null }));
    } catch (err) {
      console.error('Error obteniendo productividad:', err);
      setProductivityModal(prev => ({ ...prev, loading: false, data: null }));
    }
  };

  const handleCloseProductivity = () => {
    setProductivityModal({ open: false, cip: null, loading: false, data: null, filtro: 'dia' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d2e] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            Cargando peritos...
          </p>
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
              Gestión de Peritos
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
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
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Buscar Perito
            </label>
            <input
              type="text"
              id="search"
              placeholder="Buscar por CIP, nombres, apellidos o DNI..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent dark:bg-gray-900 dark:text-gray-200"
            />
          </div>
          <div className="flex items-end">
            <button className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg transition-colors duration-200">
              Filtros
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
                {[
                  "CIP",
                  "Nombres",
                  "DNI",
                  "Email",
                  "Departamento",
                  "Rol",
                  "Acciones",
                ].map((col) => (
                  <th
                    key={col}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {peritos.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    <span className="w-full flex justify-center">
                      <Usuarios size={12} />
                    </span>
                    <p className="text-lg font-medium">
                      No se encontraron peritos
                    </p>
                    <p className="text-sm">
                      {searchTerm
                        ? "Intenta ajustar los filtros de búsqueda"
                        : "No hay peritos registrados en el sistema"}
                    </p>
                  </td>
                </tr>
              ) : (
                peritos.map((perito) => (
                  <tr
                    key={perito.CIP}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#1a4d2e] text-white">
                        {perito.CIP}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                      {perito.nombre_completo || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                      {perito.dni || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                      {perito.email || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                      {perito.nombre_departamento || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                      Perito
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditPerito(perito.CIP)}
                          className="transition-colors duration-200 dark:text-green-500 dark:hover:text-green-400 flex bg-[#1a4d2e] px-2 py-1 items-center gap-2 rounded-lg text-white cursor-pointer transform hover:scale-105"
                          disabled={deleteLoading === perito.CIP}
                        >
                          <EditIcon size={5} />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeletePerito(perito.CIP)}
                          className="bg-red-600 dark:hover:text-red-300 transition-colors text-white duration-200 disabled:opacity-50 px-2 flex items-center gap-2 py-1 rounded-lg cursor-pointer transform hover:scale-105"
                          disabled={deleteLoading === perito.CIP}
                        >
                          <DeleteIcon size={5} />
                          {deleteLoading === perito.CIP ? (
                            <span className="animate-spin">⏳</span>
                          ) : (
                            "Eliminar"
                          )}
                        </button>
                        <button
                          type="button"
                          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer transform hover:scale-105
                            ${perito.id_estado === 1
                              ? "bg-amber-100 hover:bg-amber-200 text-amber-700"
                              : "bg-blue-100 hover:bg-blue-200 text-blue-700"
                            }`}
                          onClick={() =>
                            handleEnableOption({
                              id_usuario: perito.id_usuario,
                              id_estado: perito.id_estado,
                            })
                          }
                        >
                          {perito.id_estado === 1 ? (
                            <>
                              <DisableIcon size={5} />
                              <span>Deshabilitar</span>
                            </>
                          ) : (
                            <>
                              <EnableIcon size={5} />
                              <span>Habilitar</span>
                            </>
                          )}
                        </button>

                        {/* Nuevo: Ver Productividad */}
                        <button
                          type="button"
                          onClick={() => handleOpenProductivity(perito.CIP)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 bg-[#29ab85] hover:scale-101 cursor-pointer dark:bg-[#29ab80] text-white"
                        >
                          <>
                          <Estadistica/>
                          Ver Productividad
                          </>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Componente para Habilitar y Deshabilitar */}
        {enableOption.open && (
          <EnableAndDesableUser
            id_estado={enableOption.id_estado}
            id_usuario={enableOption.id_usuario}
            update={setUpdateComponent}
            onClose={() =>
              setEnableOption({
                open: false,
                id_usuario: null,
                id_estado: null,
              })
            }
          />
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Mostrando <span className="font-medium">{peritos.length}</span> de{" "}
              <span className="font-medium">{totalPeritos}</span> peritos
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
                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2)
                  pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === pageNum
                        ? "text-white bg-[#1a4d2e] border border-[#1a4d2e]"
                        : "text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
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

      {/* Modal Productividad */}
      {productivityModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseProductivity(); }}
        >
          <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleCloseProductivity}
              aria-label="Cerrar"
              className="absolute top-4 right-4 text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              ×
            </button>

            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
              Productividad del Perito {productivityModal.cip}
            </h3>

            {productivityModal.loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1a4d2e]"></div>
              </div>
            ) : (
              <div>
                <BarCharPeritosProductividadIndividual data={productivityModal.data} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
