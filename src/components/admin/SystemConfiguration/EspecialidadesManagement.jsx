import { useEffect } from "react";
import { useState } from "react";
import tipoDeDepartamentoService from "../../../services/tipoDeDepartamentoService";
import EspecialidadesForm from "./Forms/EspecialidadesForm";
import ShowToast from "../../ui/ShowToast";

function EspecialidadesManagement() {
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartamento, setEditingDepartamento] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Cargar los tipos de departamento
  useEffect(() => {
    loadDepartamentos();
  }, []);

  const loadDepartamentos = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await tipoDeDepartamentoService.getAllDepartamentos();
      if (result.success) {
        setDepartamentos(result.data || []);
      } else {
        setError(result.message || 'Error al cargar los departamentos');
      }
    } catch (err) {
      setError(err.message || 'Error al cargar los departamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadDepartamentos();
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Funciones para el modal
  const handleCreateDepartamento = () => {
    setEditingDepartamento(null);
    setIsModalOpen(true);
  };

  const handleEditDepartamento = (id) => {
    const departamento = departamentos.find(dep => dep.id_tipo_departamento === id);
    if (departamento) {
      setEditingDepartamento(departamento);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDepartamento(null);
    setError('');
  };

  const handleSubmitForm = async (formData) => {
    setFormLoading(true);
    setError('');

    try {
      let result;
      if (editingDepartamento) {
        result = await tipoDeDepartamentoService.updateDepartamento(
          editingDepartamento.id_tipo_departamento, 
          formData
        );
      } else {
        result = await tipoDeDepartamentoService.createDepartamento(formData);
      }

      if (result.success) {
        await loadDepartamentos();
        handleCloseModal();
        setSuccess('Especialidad actualizado con éxito.');
      } else {
        setError(result.message || `Error al ${editingDepartamento ? 'actualizar' : 'crear'} el departamento`);
      }
    } catch (err) {
      setError(err.message || `Error al ${editingDepartamento ? 'actualizar' : 'crear'} el departamento`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteDepartamento = async (id) => {
    if (!confirm('¿Está seguro de que desea eliminar este departamento?')) {
      return;
    }

    setDeleteLoading(id);
    setError('');
    try {
      const result = await tipoDeDepartamentoService.deleteDepartamento(id);
      if (result.success) {
        await loadDepartamentos();
        setSuccess('Departamento eliminado exitosamente');
      } else {
        setError(result.message || 'Error al eliminar el departamento');
      }
    } catch (err) {
      setError(err.message || 'Error al eliminar el departamento');
    } finally {
      setDeleteLoading(null);
    }
  };

  // Filtrar departamentos basado en el término de búsqueda
  const filteredDepartamentos = departamentos.filter(departamento =>
    departamento.nombre_departamento?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1a4d2e] dark:text-green-400 mb-2">
              Gestión de Departamentos
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Administrar tipos de departamento ({departamentos.length} total)
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Cargando...' : 'Actualizar'}</span>
            </button>
            <button
              onClick={handleCreateDepartamento}
              disabled={loading}
              className="bg-[#1a4d2e] hover:bg-[#2d7d4a] text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
            >
              <span>Crear Departamento</span>
            </button>
          </div>
        </div>
      </div>

      {error && <ShowToast type="error" message={error} />}
      {success && <ShowToast type="success" message={success} />}

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-300 px-4 py-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buscar Departamento
            </label>
            <input
              type="text"
              id="search"
              placeholder="Buscar por nombre de departamento..."
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a4d2e]"></div>
                    </div>
                    <p className="text-lg font-medium mt-2">Cargando departamentos...</p>
                  </td>
                </tr>
              ) : filteredDepartamentos.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <p className="text-lg font-medium">No se encontraron departamentos</p>
                    <p className="text-sm">
                      {searchTerm ? 'Ajusta los filtros de búsqueda' : 'No hay departamentos registrados'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredDepartamentos.map((departamento) => (
                  <tr
                    key={departamento.id_tipo_departamento}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#1a4d2e] text-white">
                        {departamento.id_tipo_departamento}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                      {departamento.nombre_departamento}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-200">
                      {departamento.descripcion || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditDepartamento(departamento.id_tipo_departamento)}
                          className="text-[#1a4d2e] dark:text-green-400 hover:text-[#2d7d4a] dark:hover:text-green-300 transition-colors duration-200"
                          disabled={deleteLoading === departamento.id_tipo_departamento}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteDepartamento(departamento.id_tipo_departamento)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 transition-colors duration-200 disabled:opacity-50"
                          disabled={deleteLoading === departamento.id_tipo_departamento}
                        >
                          {deleteLoading === departamento.id_tipo_departamento ? (
                            <span className="animate-spin">⏳</span>
                          ) : (
                            'Eliminar'
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

      {/* Modal Form */}
      <EspecialidadesForm
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitForm}
        initialData={editingDepartamento}
        isEditing={!!editingDepartamento}
        loading={formLoading}
      />
    </div>
  )
}

export default EspecialidadesManagement;