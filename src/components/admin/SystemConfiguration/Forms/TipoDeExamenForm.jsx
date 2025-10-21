import { useEffect, useState } from "react";

function TipoDeExamenForm({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isEditing = false,
  loading = false,
  departamentos = [],
  initialDepartmentsSelection = []
}) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [selectedDeps, setSelectedDeps] = useState([]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setNombre(initialData.nombre || "");
        setDescripcion(initialData.descripcion || "");
        setSelectedDeps(initialData.tipo_departamento_ids && initialData.tipo_departamento_ids.length
          ? initialData.tipo_departamento_ids.map(Number)
          : initialDepartmentsSelection.map(Number));
      } else {
        setNombre("");
        setDescripcion("");
        setSelectedDeps(initialDepartmentsSelection.map(Number));
      }
    }
  }, [isOpen, initialData, initialDepartmentsSelection]);

  const toggleDep = (id) => {
    const num = Number(id);
    setSelectedDeps((prev) => (prev.includes(num) ? prev.filter((p) => p !== num) : [...prev, num]));
  };

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    if (!nombre || nombre.trim() === "") {
      alert("El nombre es requerido");
      return;
    }

    const payload = {
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || "",
      tipo_departamento_ids: Array.from(new Set(selectedDeps)).map(Number)
    };
    await onSubmit(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#1a4d2e] dark:text-green-300">
            {isEditing ? "Editar Tipo de Examen" : "Crear Tipo de Examen"}
          </h3>
          <button
            onClick={() => onClose && onClose()}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300"
          >
            Cerrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:text-white border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] dark:focus:ring-green-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:text-white border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] dark:focus:ring-green-400"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Asociar a departamento(s)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-auto p-2 border rounded bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700">
              {departamentos.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No hay departamentos disponibles</p>
              ) : (
                departamentos.map((dep) => (
                  <label
                    key={dep.id_tipo_departamento}
                    className="inline-flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 w-full"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDeps.includes(Number(dep.id_tipo_departamento))}
                      onChange={() => toggleDep(dep.id_tipo_departamento)}
                      className="h-4 w-4 text-[#1a4d2e] dark:text-green-400 focus:ring-[#1a4d2e] dark:focus:ring-green-400"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-200">{dep.nombre_departamento}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => onClose && onClose()}
              className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded bg-[#1a4d2e] text-white disabled:opacity-60"
            >
              {loading ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TipoDeExamenForm;