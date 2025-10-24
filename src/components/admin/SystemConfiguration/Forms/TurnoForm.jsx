import { useEffect, useState } from "react";

function TurnoForm({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isEditing = false,
  loading = false
}) {
  const [nombre, setNombre] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setNombre(initialData.nombre || "");
      } else {
        setNombre("");
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    setNombre(e.target.value);
    if (errors.nombre) setErrors((p) => ({ ...p, nombre: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = String(nombre || "").trim();
    const newErrors = {};
    if (!trimmed) newErrors.nombre = "El nombre del turno es requerido";
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    onSubmit({ nombre: trimmed });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#1a4d2e] dark:text-green-300">
            {isEditing ? "Editar Turno" : "Crear Turno"}
          </h3>
          <button
            onClick={() => onClose && onClose()}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300"
          >
            Cerrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre del turno *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent dark:bg-gray-900 dark:text-gray-200 ${
                errors.nombre ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder="Ej. Mañana / Tarde / Noche"
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nombre}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => onClose && onClose()}
              disabled={loading}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#1a4d2e] text-white rounded-lg hover:bg-[#2d7d4a] disabled:opacity-60"
            >
              {loading ? (isEditing ? "Actualizando..." : "Creando...") : (isEditing ? "Actualizar" : "Crear")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TurnoForm;