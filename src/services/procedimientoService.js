import { fetchWithAuth } from './api';

export const ProcedimientoService = {
  /**
   * Registra el resultado de una extracción de muestras.
   * @param {number | string} id_oficio - El ID del oficio.
   * @param {object} payload - Los datos del formulario de extracción.
   * @param {boolean} payload.fue_exitosa
   * @param {string} payload.observaciones
   * @param {Array<object>} payload.muestras
   * @returns {Promise<object>}
   */
  registrarExtraccion: async (id_oficio, payload) => {
    try {
      const response = await fetchWithAuth(`/api/procedimientos/${id_oficio}/registrar-extraccion`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar la extracción');
      }
      return data;
    } catch (error) {
      console.error('Error en registrarExtraccion:', error);
      throw error;
    }
  },
};
