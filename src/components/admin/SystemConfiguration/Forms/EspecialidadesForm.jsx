import { useState, useEffect } from 'react';

function EspecialidadesForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null, 
  isEditing = false,
  loading = false 
}) {
  const [formData, setFormData] = useState({
    nombre_departamento: '',
    descripcion: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        nombre_departamento: initialData.nombre_departamento || '',
        descripcion: initialData.descripcion || ''
      });
    } else if (isOpen && !initialData) {
      setFormData({
        nombre_departamento: '',
        descripcion: ''
      });
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.nombre_departamento.trim()) {
      newErrors.nombre_departamento = 'El nombre del departamento es requerido';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit(formData);
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-[#1a4d2e] dark:text-green-400">
            {isEditing ? 'Editar Departamento' : 'Crear Departamento'}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nombre del Departamento */}
          <div>
            <label 
              htmlFor="nombre_departamento" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Nombre del Departamento *
            </label>
            <input
              type="text"
              id="nombre_departamento"
              name="nombre_departamento"
              value={formData.nombre_departamento}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent dark:bg-gray-900 dark:text-gray-200 ${
                errors.nombre_departamento 
                  ? 'border-red-500 dark:border-red-400' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Ingrese el nombre del departamento"
            />
            {errors.nombre_departamento && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.nombre_departamento}
              </p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label 
              htmlFor="descripcion" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent dark:bg-gray-900 dark:text-gray-200"
              placeholder="Ingrese una descripción (opcional)"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#1a4d2e] text-white rounded-lg hover:bg-[#2d7d4a] transition-colors duration-200 disabled:opacity-50 flex items-center space-x-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>
                {loading 
                  ? (isEditing ? 'Actualizando...' : 'Creando...') 
                  : (isEditing ? 'Actualizar' : 'Crear')
                }
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EspecialidadesForm;