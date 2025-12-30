const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

export class ProcedimientoService {
  /**
   * Método privado para obtener los headers de autenticación para JSON.
   * @returns {HeadersInit}
   */
  static #getJsonHeaders() {
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
   * Método privado para obtener los headers de autenticación para FormData.
   * @returns {HeadersInit}
   */
  static #getAuthHeaders() {
    const token = localStorage.getItem('peritoToken');
    if (!token) {
      console.error("No se encontró token de autenticación (peritoToken).");
      throw new Error("Token de autenticación no encontrado. Inicie sesión de nuevo.");
    }
    return {
      'Authorization': `Bearer ${token}`
      // No se establece 'Content-Type', el navegador lo hará por nosotros con el boundary correcto.
    };
  }

  static async getSiguientePaso(idOficio) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/procedimientos/${idOficio}/siguiente-paso`, {
        method: 'GET',
        headers: this.#getJsonHeaders(),
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

  static async derivar(idOficio, idNuevoPerito) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/procedimientos/${idOficio}/derivar`, {
        method: 'POST',
        headers: this.#getJsonHeaders(),
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

  static async getDatosExtraccion(idOficio) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/procedimientos/${idOficio}/extraccion`, {
        method: 'GET',
        headers: this.#getJsonHeaders(),
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

  static async registrarExtraccion(idOficio, data) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/procedimientos/${idOficio}/extraccion`, {
        method: 'POST',
        headers: this.#getJsonHeaders(),
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error('Error en registrarExtraccion:', error);
      throw error;
    }
  }

  static async finalizarExtraccionInterna(idOficio, data) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/procedimientos/${idOficio}/finalizar-extraccion-interna`, {
        method: 'POST',
        headers: this.#getJsonHeaders(),
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error('Error en finalizarExtraccionInterna:', error);
      throw error;
    }
  }

  static async getDatosAnalisis(idOficio) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/procedimientos/${idOficio}/analisis`, {
        method: 'GET',
        headers: this.#getJsonHeaders(),
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

  static async registrarAnalisis(idOficio, data) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/procedimientos/${idOficio}/analisis`, {
        method: 'POST',
        headers: this.#getJsonHeaders(),
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error('Error en registrarAnalisis:', error);
      throw error;
    }
  }

  static async getDatosConsolidacion(idOficio) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/procedimientos/${idOficio}/datos-consolidacion`, {
        method: 'GET',
        headers: this.#getJsonHeaders(),
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

  static async registrarConsolidacion(idOficio, data) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/procedimientos/${idOficio}/consolidacion`, {
        method: 'POST',
        headers: this.#getJsonHeaders(),
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error('Error en registrarConsolidacion:', error);
      throw error;
    }
  }

  static async getPreviewConsolidacion(idOficio, data) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/procedimientos/${idOficio}/preview-consolidacion`, {
        method: 'POST',
        headers: this.#getJsonHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Error al generar la vista previa.');
      }
      return await response.text();
    } catch (error) {
      console.error('Error en getPreviewConsolidacion:', error);
      throw error;
    }
  }

  static async generarCaratula(idOficio, data) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/procedimientos/${idOficio}/generar-caratula`, {
        method: 'POST',
        headers: this.#getJsonHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al generar la carátula.');
      }
      return await response.blob();
    } catch (error) {
      console.error('Error en generarCaratula:', error);
      throw error;
    }
  }

  static async uploadInformeFirmado(idOficio, formData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/procedimientos/${idOficio}/upload-informe-firmado`, {
        method: 'POST',
        headers: this.#getAuthHeaders(),
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al subir el informe firmado.');
      }
      return data;
    } catch (error) {
      console.error('Error en uploadInformeFirmado:', error);
      throw error;
    }
  }

  static async uploadDocumentosFinales(idOficio, formData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/procedimientos/${idOficio}/upload-documentos-finales`, {
        method: 'POST',
        headers: this.#getAuthHeaders(),
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al subir los documentos finales.');
      }
      return data;
    } catch (error) {
      console.error('Error en uploadDocumentosFinales:', error);
      throw error;
    }
  }

  // --- Métodos para flujos con formularios placeholder ---

  static async registrarAnalisisPlaceholder(idOficio, tipo_analisis) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/procedimientos/${idOficio}/placeholder-analisis`, {
        method: 'POST',
        headers: this.#getJsonHeaders(),
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
        headers: this.#getJsonHeaders(),
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
        headers: this.#getJsonHeaders(),
        body: JSON.stringify({}),
      });
      return await response.json();
    } catch (error) {
      console.error('Error en finalizarParaMP:', error);
      throw error;
    }
  }
}