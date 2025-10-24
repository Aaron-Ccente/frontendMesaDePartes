import { useEffect, useState } from 'react'
import ShowToast from '../../ui/ShowToast'
import GradosForm from './Forms/GradosForm'
import gradoService from '../../../services/gradoService'

function GradosManagement() {
  const [grados, setGrados] = useState([])
  const [loading, setLoading] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGrado, setEditingGrado] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadGrados()
  }, [])

  const loadGrados = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await gradoService.getAllGrados()
      if (res && res.success) {
        setGrados(res.data || [])
      } else {
        setError(res?.message || 'Error al cargar los grados')
      }
    } catch (err) {
      setError(err.message || 'Error al cargar los grados')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingGrado(null)
    setIsModalOpen(true)
    setError('')
    setSuccess('')
  }

  const handleEdit = (id) => {
    const g = grados.find((x) => Number(x.id_grado) === Number(id))
    if (g) {
      setEditingGrado(g)
      setIsModalOpen(true)
      setError('')
      setSuccess('')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Seguro que desea eliminar este grado?')) return
    setDeleteLoading(id)
    setError('')
    try {
      // servicio usa nombres de método con 'Prioridad' en el archivo actual: deletePrioridad
      const res = await gradoService.deletePrioridad(id)
      if (res && res.success) {
        setSuccess('Grado eliminado correctamente')
        await loadGrados()
      } else {
        setError(res?.message || 'Error al eliminar grado')
      }
    } catch (err) {
      setError(err.message || 'Error al eliminar grado')
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleSubmitForm = async (payload) => {
    setFormLoading(true)
    setError('')
    try {
      let res
      if (editingGrado && editingGrado.id_grado) {
        res = await gradoService.updatePrioridad(editingGrado.id_grado, payload)
      } else {
        res = await gradoService.createPrioridad(payload)
      }

      if (res && res.success) {
        setSuccess(editingGrado ? 'Grado actualizado' : 'Grado creado')
        setIsModalOpen(false)
        setEditingGrado(null)
        await loadGrados()
      } else {
        setError(res?.message || 'Error en la operación')
      }
    } catch (err) {
      setError(err.message || 'Error en la operación')
    } finally {
      setFormLoading(false)
    }
  }

  const filtered = grados.filter((g) =>
    (g.nombre || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a4d2e] dark:text-green-400">
            Gestión de Grados
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Crear, editar y eliminar grados del sistema
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar grado..."
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-gray-200"
          />
          <button
            onClick={() => loadGrados()}
            disabled={loading}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Cargando...' : 'Actualizar'}
          </button>
          <button
            onClick={handleCreate}
            className="bg-[#1a4d2e] hover:bg-[#2d7d4a] text-white px-4 py-2 rounded-lg"
          >
            Crear Grado
          </button>
        </div>
      </div>

      {error && <ShowToast type="error" message={error} />}
      {success && <ShowToast type="success" message={success} />}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td
                    colSpan="3"
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    <div className="animate-spin inline-block h-8 w-8 border-b-2 border-[#1a4d2e] rounded-full"></div>
                    <p className="mt-3">Cargando grados...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    <p>No hay grados registrados</p>
                  </td>
                </tr>
              ) : (
                filtered.map((g) => (
                  <tr
                    key={g.id_grado}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {g.id_grado}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {g.nombre}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEdit(g.id_grado)}
                          className="text-[#1a4d2e] dark:text-green-400 hover:underline"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(g.id_grado)}
                          disabled={deleteLoading === g.id_grado}
                          className="text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
                        >
                          {deleteLoading === g.id_grado ? '...' : 'Eliminar'}
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

      <GradosForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingGrado(null)
          setError('')
        }}
        onSubmit={handleSubmitForm}
        initialData={editingGrado}
        isEditing={!!editingGrado}
        loading={formLoading}
      />
    </div>
  )
}

export default GradosManagement