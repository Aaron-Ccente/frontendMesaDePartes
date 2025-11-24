

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
   * Registra los datos de extracción para el flujo 'Extracción y Análisis', actualizando el estado
   * del caso a PENDIENTE_ANALISIS_TM sin derivarlo.
   */
  static async finalizarExtraccionInterna(idOficio, data) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/procedimientos/${idOficio}/finalizar-extraccion-interna`, {
        method: 'POST',
        headers: this.#getHeaders(),
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error('Error en finalizarExtraccionInterna:', error);
      throw error;
    }
  }

  /**
   * Obtiene los datos previamente guardados de un procedimiento de análisis (genérico).
   */
  static async getDatosAnalisis(idOficio) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/procedimientos/${idOficio}/analisis`, {
        method: 'GET',
        headers: this.#getHeaders(),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error al obtener los datos del análisis.');
      }
      return data;
    } catch (error) {
      console.error('Error en getDatosAnalisis:', error);
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
   * Obtiene todos los datos necesarios para la vista de consolidación.
   */
  static async getDatosConsolidacion(idOficio) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/procedimientos/${idOficio}/datos-consolidacion`, {
        method: 'GET',
        headers: this.#getHeaders(),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error al obtener los datos para la consolidación.');
      }
      return data;
    } catch (error) {
      console.error('Error en getDatosConsolidacion:', error);
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
    
      // --- Métodos para flujos con formularios placeholder ---
    
      static async registrarAnalisisPlaceholder(idOficio, tipo_analisis) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/procedimientos/${idOficio}/placeholder-analisis`, {
            method: 'POST',
            headers: this.#getHeaders(),
            body: JSON.stringify({ tipo_analisis }), // 'INST' o 'LAB'
          });
          return await response.json();
        } catch (error) {
          console.error('Error en registrarAnalisisPlaceholder:', error);
          throw error;
        }
      }
    
      static async registrarConsolidacionPlaceholder(idOficio) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/procedimientos/${idOficio}/placeholder-consolidacion`, {
            method: 'POST',
            headers: this.#getHeaders(),
            body: JSON.stringify({}),
          });
          return await response.json();
        } catch (error) {
          console.error('Error en registrarConsolidacionPlaceholder:', error);
          throw error;
        }
      }
    
      static async finalizarParaMP(idOficio) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/procedimientos/${idOficio}/finalizar-para-mp`, {
            method: 'POST',
            headers: this.#getHeaders(),
            body: JSON.stringify({}),
          });
          return await response.json();
        } catch (error) {
          console.error('Error en finalizarParaMP:', error);
          throw error;
        }
      }
    }
    