import { useEffect, useState } from 'react'
import ShowToast from '../../ui/ShowToast'
import PrioridadesForm from './Forms/PrioridadesForm'
import prioridadService from '../../../services/prioridadService'

function TiposDePrioridadManagement() {
  const [prioridades, setPrioridades] = useState([])
  const [loading, setLoading] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPrioridad, setEditingPrioridad] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadPrioridades()
  }, [])

  const loadPrioridades = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await prioridadService.getAllPrioridades()
      if (res && res.success) {
        setPrioridades(res.data || [])
      } else {
        setError(res?.message || 'Error al cargar prioridades')
      }
    } catch (err) {
      setError(err.message || 'Error al cargar prioridades')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingPrioridad(null)
    setIsModalOpen(true)
    setError('')
    setSuccess('')
  }

  const handleEdit = (id) => {
    const p = prioridades.find((x) => Number(x.id_prioridad) === Number(id))
    if (p) {
      setEditingPrioridad(p)
      setIsModalOpen(true)
      setError('')
      setSuccess('')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Seguro que desea eliminar esta prioridad?')) return
    setDeleteLoading(id)
    setError('')
    try {
      const res = await prioridadService.deletePrioridad(id)
      if (res && res.success) {
        setSuccess('Prioridad eliminada correctamente')
        await loadPrioridades()
      } else {
        setError(res?.message || 'Error al eliminar prioridad')
      }
    } catch (err) {
      setError(err.message || 'Error al eliminar prioridad')
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleSubmitForm = async (payload) => {
    setFormLoading(true)
    setError('')
    try {
      let res
      if (editingPrioridad && editingPrioridad.id_prioridad) {
        res = await prioridadService.updatePrioridad(editingPrioridad.id_prioridad, payload)
      } else {
        res = await prioridadService.createPrioridad(payload)
      }

      if (res && res.success) {
        setSuccess(editingPrioridad ? 'Prioridad actualizada' : 'Prioridad creada')
        setIsModalOpen(false)
        setEditingPrioridad(null)
        await loadPrioridades()
      } else {
        setError(res?.message || 'Error en la operación')
      }
    } catch (err) {
      setError(err.message || 'Error en la operación')
    } finally {
      setFormLoading(false)
    }
  }

  const filtered = prioridades.filter((p) =>
    (p.nombre_prioridad || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a4d2e] dark:text-green-400">Gestión de Tipos de Prioridad</h1>
          <p className="text-gray-600 dark:text-gray-300">Crear, editar y eliminar tipos de prioridad</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar prioridad..."
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-gray-200"
          />
          <button
            onClick={() => loadPrioridades()}
            disabled={loading}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Cargando...' : 'Actualizar'}
          </button>
          <button onClick={handleCreate} className="bg-[#1a4d2e] hover:bg-[#2d7d4a] text-white px-4 py-2 rounded-lg">
            Crear Prioridad
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="animate-spin inline-block h-8 w-8 border-b-2 border-[#1a4d2e] rounded-full"></div>
                    <p className="mt-3">Cargando prioridades...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <p>No hay prioridades registradas</p>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id_prioridad} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{p.id_prioridad}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{p.nombre_prioridad}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-3">
                        <button onClick={() => handleEdit(p.id_prioridad)} className="text-[#1a4d2e] dark:text-green-400 hover:underline">Editar</button>
                        <button onClick={() => handleDelete(p.id_prioridad)} disabled={deleteLoading === p.id_prioridad} className="text-red-600 dark:text-red-400 hover:underline disabled:opacity-50">
                          {deleteLoading === p.id_prioridad ? '...' : 'Eliminar'}
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

      <PrioridadesForm
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingPrioridad(null); setError(''); }}
        onSubmit={handleSubmitForm}
        initialData={editingPrioridad}
        isEditing={!!editingPrioridad}
        loading={formLoading}
      />
    </div>
  )
}

export default TiposDePrioridadManagement