

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

export class ProcedimientoService {
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
   * Llama al endpoint del backend para obtener la sección de destino y la lista de peritos.
   * @param {number} idOficio - El ID del oficio.
   * @returns {Promise<object>} La respuesta del servidor con los datos para el modal.
   */
  static async getSiguientePaso(idOficio) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/procedimientos/${idOficio}/siguiente-paso`, {
        method: 'GET',
        headers: this.#getHeaders(),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener los datos de derivación.');
      }
      return data;
    } catch (error) {
      console.error('Error en ProcedimientoService.getSiguientePaso:', error);
      throw error;
    }
  }

  /**
   * Llama al endpoint del backend para derivar un caso a un perito específico.
   * @param {number} idOficio - El ID del oficio a derivar.
   * @param {number} idNuevoPerito - El ID del perito seleccionado para la asignación.
   * @returns {Promise<object>} La respuesta del servidor.
   */
  static async derivar(idOficio, idNuevoPerito) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/procedimientos/${idOficio}/derivar`, {
        method: 'POST',
        headers: this.#getHeaders(),
        body: JSON.stringify({ id_nuevo_perito: idNuevoPerito }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al derivar el caso.');
      }

      return data;
    } catch (error) {
      console.error('Error en ProcedimientoService.derivar:', error);
      throw error;
        }
      }
      /**
       * Obtiene los datos previamente guardados de un procedimiento de extracción.
       */
        static async getDatosExtraccion(idOficio) {
          try {
            const response = await fetch(`${API_BASE_URL}/api/procedimientos/${idOficio}/extraccion`, {
              method: 'GET',
              headers: this.#getHeaders(),
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
              throw new Error(data.message || 'Error al obtener los datos de la extracción.');
            }
            return data;
          } catch (error) {
            console.error('Error en getDatosExtraccion:', error);
            throw error;
          }
        }    
      /**
       * Registra los datos de extracción de muestras (Perito TM).
       */
      static async registrarExtraccion(idOficio, data) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/procedimientos/${idOficio}/extraccion`, {
        method: 'POST',
        headers: this.#getHeaders(),
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error('Error en registrarExtraccion:', error);
      throw error;
    }
  }

  /**
   * Registra los datos de análisis (TM, INST, LAB).
   */
  static async registrarAnalisis(idOficio, data) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/procedimientos/${idOficio}/analisis`, {
        method: 'POST',
        headers: this.#getHeaders(),
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error('Error en registrarAnalisis:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los resultados registrados para un oficio (para consolidación).
   */
  static async obtenerResultadosCompletos(idOficio) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/procedimientos/${idOficio}/resultados-completos`, {
        method: 'GET',
        headers: this.#getHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Error en obtenerResultadosCompletos:', error);
      throw error;
    }
  }

  /**
   * Registra la consolidación final y cierra el caso.
   */
  static async registrarConsolidacion(idOficio, data) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/procedimientos/${idOficio}/consolidacion`, {
        method: 'POST',
        headers: this.#getHeaders(),
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error('Error en registrarConsolidacion:', error);
      throw error;
    }
  }
}