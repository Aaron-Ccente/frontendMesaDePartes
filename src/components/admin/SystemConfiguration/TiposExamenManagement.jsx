import { useEffect, useState } from "react";
import TiposDeExamenService from "../../../services/tiposDeExamenService";
import tipoDeDepartamentoService from "../../../services/tipoDeDepartamentoService";
import TipoDeExamenForm from "./Forms/TipoDeExamenForm";
import ShowToast from "../../ui/ShowToast";

function TiposExamenManagement() {
  const [data, setData] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [initialDepartmentsSelection, setInitialDepartmentsSelection] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadAll();
    loadDepartamentos();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await TiposDeExamenService.getAllTiposDeExamen();
      if (res.success) {
        setData(res.data || []);
      } else {
        setError(res.message || "Error al cargar tipos de examen");
      }
    } catch (err) {
      setError(err.message || "Error al cargar tipos de examen");
    } finally {
      setLoading(false);
    }
  };

  const loadDepartamentos = async () => {
    try {
      const res = await tipoDeDepartamentoService.getAllDepartamentos();
      if (res.success) {
        setDepartamentos(res.data || []);
      } else {
        setDepartamentos([]);
      }
    } catch (err) {
      console.log(err);
      setDepartamentos([]);
    }
  };

  const handleCreateForDepartment = (id_tipo_departamento) => {
    setEditingExam(null);
    setInitialDepartmentsSelection(id_tipo_departamento ? [Number(id_tipo_departamento)] : []);
    setIsModalOpen(true);
  };

  const handleEditExam = (exam, parentDepartamentoId = null) => {
    setEditingExam({
      ...exam,
      tipo_departamento_ids: parentDepartamentoId ? [Number(parentDepartamentoId)] : exam.tipo_departamento_ids || []
    });
    setInitialDepartmentsSelection(parentDepartamentoId ? [Number(parentDepartamentoId)] : (exam.tipo_departamento_ids || []));
    setIsModalOpen(true);
  };

  const handleDeleteExam = async (id) => {
    if (!confirm("¿Seguro de eliminar este tipo de examen?")) return;
    setDeleteLoading(id);
    setError("");
    try {
      const res = await TiposDeExamenService.deleteTipoDeExamen(id);
      if (res.success) {
        setSuccess("Tipo de examen eliminado correctamente");
        await loadAll();
      } else {
        setError(res.message || "Error al eliminar tipo de examen");
      }
    } catch (err) {
      setError(err.message || "Error al eliminar tipo de examen");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSubmitForm = async (formPayload) => {
    setFormLoading(true);
    setError("");
    try {
      let res;
      if (editingExam && editingExam.id_tipo_de_examen) {
        res = await TiposDeExamenService.updateTipoDeExamen(editingExam.id_tipo_de_examen, formPayload);
      } else {
        res = await TiposDeExamenService.createTipoDeExamen(formPayload);
      }

      if (res.success) {
        setSuccess(editingExam ? "Tipo de examen actualizado" : "Tipo de examen creado");
        setIsModalOpen(false);
        setEditingExam(null);
        await loadAll();
      } else {
        setError(res.message || "Error en la operación");
      }
    } catch (err) {
      setError(err.message || "Error en la operación");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1a4d2e] dark:text-green-400 mb-2">
              Gestión de Tipos de Examen
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Administrar los tipos de examen y su relación con los departamentos
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => loadAll()}
              disabled={loading}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? "Cargando..." : "Actualizar"}</span>
            </button>
            <button
              onClick={() => handleCreateForDepartment(null)}
              disabled={loading}
              className="bg-[#1a4d2e] hover:bg-[#2d7d4a] text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
            >
              <span>Crear Tipo de Examen</span>
            </button>
          </div>
        </div>
      </div>

      {error && <ShowToast type="error" message={error} />}
      {success && <ShowToast type="success" message={success} />}

      {/* List por departamentos */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin inline-block h-8 w-8 border-b-2 border-[#1a4d2e] rounded-full"></div>
            <p className="mt-3 text-gray-600 dark:text-gray-300">Cargando tipos de examen...</p>
          </div>
        ) : data.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">No hay tipos de examen registrados</p>
        ) : (
          data.map((dept) => (
            <div key={dept.id_tipo_departamento} className="border rounded-lg p-4 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-[#1a4d2e] dark:text-green-300">{dept.nombre_departamento}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total: {dept.total_examenes}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCreateForDepartment(dept.id_tipo_departamento)}
                    className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-md"
                  >
                    Crear en este departamento
                  </button>
                </div>
              </div>

              {dept.examenes && dept.examenes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Nombre</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Descripción</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {dept.examenes.map((exam) => (
                        <tr key={exam.id_tipo_de_examen} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300"><div className="rounded-full bg-[#1a4d2e] max-w-fit px-2.5 py-0.5 text-white">{exam.id_tipo_de_examen}</div></td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{exam.nombre}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{exam.descripcion || "-"}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleEditExam(exam, dept.id_tipo_departamento)}
                                className="text-[#1a4d2e] hover:underline dark:text-green-400"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteExam(exam.id_tipo_de_examen)}
                                className="text-red-600 hover:underline disabled:opacity-50"
                                disabled={deleteLoading === exam.id_tipo_de_examen}
                              >
                                {deleteLoading === exam.id_tipo_de_examen ? "..." : "Eliminar"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No hay exámenes en este departamento</p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal Form */}
      <TipoDeExamenForm
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingExam(null); setError(""); }}
        onSubmit={handleSubmitForm}
        initialData={editingExam}
        isEditing={!!editingExam}
        loading={formLoading}
        departamentos={departamentos}
        initialDepartmentsSelection={initialDepartmentsSelection}
      />
    </div>
  );
}

export default TiposExamenManagement;