import React, { useEffect, useState } from 'react'
import ShowToast from '../../ui/ShowToast'
import TurnoForm from './Forms/TurnoForm'
import { turnoService } from '../../../services/turnoService'

function TurnosManagement() {
  const [turnos, setTurnos] = useState([])
  const [loading, setLoading] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTurno, setEditingTurno] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadTurnos()
  }, [])

  const loadTurnos = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await turnoService.getAllTurnos()
      if (res && res.success) {
        setTurnos(res.data || [])
      } else {
        setError(res?.message || 'Error al cargar los turnos')
      }
    } catch (err) {
      setError(err.message || 'Error al cargar los turnos')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingTurno(null)
    setIsModalOpen(true)
    setError('')
    setSuccess('')
  }

  const handleEdit = (id) => {
    const t = turnos.find((x) => Number(x.id_turno) === Number(id))
    if (t) {
      setEditingTurno(t)
      setIsModalOpen(true)
      setError('')
      setSuccess('')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Seguro que desea eliminar este turno?')) return
    setDeleteLoading(id)
    setError('')
    try {
      const res = await turnoService.deleteTurno(id)
      if (res && res.success) {
        setSuccess('Turno eliminado correctamente')
        await loadTurnos()
      } else {
        setError(res?.message || 'Error al eliminar turno')
      }
    } catch (err) {
      setError(err.message || 'Error al eliminar turno')
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleSubmitForm = async (payload) => {
    setFormLoading(true)
    setError('')
    try {
      let res
      if (editingTurno && editingTurno.id_turno) {
        res = await turnoService.updateTurno(editingTurno.id_turno, payload)
      } else {
        res = await turnoService.createTurno(payload)
      }

      if (res && res.success) {
        setSuccess(editingTurno ? 'Turno actualizado' : 'Turno creado')
        setIsModalOpen(false)
        setEditingTurno(null)
        await loadTurnos()
      } else {
        setError(res?.message || 'Error en la operación')
      }
    } catch (err) {
      setError(err.message || 'Error en la operación')
    } finally {
      setFormLoading(false)
    }
  }

  const filtered = turnos.filter((t) =>
    (t.nombre || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a4d2e] dark:text-green-400">
            Gestión de Turnos
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Crear, editar y eliminar turnos del sistema
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar turno..."
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-gray-200"
          />
          <button
            onClick={() => loadTurnos()}
            disabled={loading}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Cargando...' : 'Actualizar'}
          </button>
          <button
            onClick={handleCreate}
            className="bg-[#1a4d2e] hover:bg-[#2d7d4a] text-white px-4 py-2 rounded-lg"
          >
            Crear Turno
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
                    <p className="mt-3">Cargando turnos...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    <p>No hay turnos registrados</p>
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr
                    key={t.id_turno}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {t.id_turno}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {t.nombre}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEdit(t.id_turno)}
                          className="text-[#1a4d2e] dark:text-green-400 hover:underline"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(t.id_turno)}
                          disabled={deleteLoading === t.id_turno}
                          className="text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
                        >
                          {deleteLoading === t.id_turno ? '...' : 'Eliminar'}
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

      <TurnoForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTurno(null)
          setError('')
        }}
        onSubmit={handleSubmitForm}
        initialData={editingTurno}
        isEditing={!!editingTurno}
        loading={formLoading}
      />
    </div>
  )
}

export default TurnosManagement