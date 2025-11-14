import { useState } from "react";
import { authService } from "../../services/authService";

function EnableAndDesableUser({
  id_estado,
  id_usuario,
  update,
  onClose
}) {
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEnableDisable = async () => {
    try {
      setLoading(true);

      // 1 es habilitado - 2 es deshabilitado
      const nuevoEstado = id_estado === 1 ? 2 : 1;
      await authService.enableDisableUser({
        id_estado: nuevoEstado,
        id_usuario,
        motivo: motivo.trim()
      });
      update(true);
      onClose();
    } catch (error) {
      console.error('Error:', error.message);
      update(false);
    } finally {
      setLoading(false);
    }
  };

  // Textos
  const isHabilitado = id_estado === 1;
  const titulo = isHabilitado
    ? "¿Está seguro de deshabilitar al usuario?"
    : "¿Está seguro de habilitar al usuario?";

  const botonAccionTexto = isHabilitado ? "Deshabilitar" : "Habilitar";
  const botonAccionColor = isHabilitado
    ? "bg-red-600 hover:bg-red-700"
    : "bg-green-600 hover:bg-green-700";

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 relative">

        {/* Título */}
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
          {titulo}
        </h2>


        {/* Campo de Motivo */}
        <div className="mb-6">
          <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Motivo <span className="text-red-500">*</span>
          </label>
          <textarea
            id="motivo"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder={`Ingresa el motivo para ${isHabilitado ? "deshabilitar" : "habilitar"} al usuario`}
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent resize-none"
            rows={4}
            disabled={loading}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {motivo.length}/200
          </p>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>

          <button
            onClick={handleEnableDisable}
            disabled={loading || !motivo.trim()}
            className={`px-4 py-2 rounded-xl text-white font-medium ${botonAccionColor} transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Procesando...
              </>
            ) : (
              botonAccionTexto
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EnableAndDesableUser;