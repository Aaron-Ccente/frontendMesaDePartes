const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

export class DictamenService {
  /**
   * Método privado para obtener los headers de autenticación.
   * @returns {HeadersInit}
   */
  static #getHeaders() {
    const token = localStorage.getItem('peritoToken');
    if (!token) {
      console.error("No se encontró token de autenticación (peritoToken).");
      throw new Error("Token de autenticación no encontrado. Inicie sesión de nuevo.");
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Llama al endpoint del backend para generar y guardar el dictamen pericial consolidado.
   * @param {number} idOficio - El ID del oficio.
   * @param {object} formData - Los datos del formulario de consolidación.
   * @returns {Promise<object>} La respuesta del servidor.
   */
  static async generarDictamen(idOficio, formData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dictamen/${idOficio}/generar`, {
        method: 'POST',
        headers: this.#getHeaders(),
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al generar el dictamen.');
      }
      return data;
    } catch (error) {
      console.error('Error en DictamenService.generarDictamen:', error);
      throw error;
    }
  }

  /**
   * Obtiene un blob del PDF de vista previa del informe consolidado.
   * @param {number} idOficio - El ID del oficio.
   * @param {object} formData - Los datos del formulario de consolidación.
   * @returns {Promise<Blob>} El PDF como un objeto Blob.
   */
  static async getInformePreview(idOficio, formData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dictamen/${idOficio}/preview`, {
        method: 'POST',
        headers: this.#getHeaders(),
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        // Intenta leer el error como JSON, si falla, usa el texto del estado
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'Error al generar la vista previa.');
      }
      
      // Devuelve la respuesta como un blob
      return await response.blob();
    } catch (error) {
      console.error('Error en DictamenService.getInformePreview:', error);
      throw error;
    }
  }
}
