import { fetchWithAuth } from './api';
import { toast } from 'sonner';

export const DocumentService = {
  /**
   * Obtiene la URL de una vista previa de un documento generado en el backend.
   * @param {number} id_oficio - El ID del oficio.
   * @param {string} templateName - El nombre de la plantilla a usar (ej. 'tm/acta_apertura').
   * @param {object} extraData - Datos adicionales del formulario para enviar al backend.
   * @returns {Promise<string|null>} La URL del Blob del PDF o null si hay un error.
   */
  async getPreviewUrl(id_oficio, templateName, extraData = {}) {
    try {
      const response = await fetchWithAuth(
        `/api/documentos/preview/${id_oficio}?template=${templateName}`, 
        {
          method: 'POST',
          body: JSON.stringify(extraData),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.message || `Error del servidor: ${response.statusText}`);
      }

      const blob = await response.blob();
      const fileUrl = URL.createObjectURL(blob);
      return fileUrl;

    } catch (error) {
      console.error('Error al obtener la vista previa del documento:', error);
      toast.error(`No se pudo generar la vista previa: ${error.message}`);
      return null;
    }
  }
};
