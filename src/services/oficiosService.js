const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

const tokenKeyMesaDePartes = 'mesadepartesToken';

const getAuthHeaders = (includeJson = true) => {
  const token = localStorage.getItem(tokenKeyMesaDePartes);
  const headers = {};
  if (includeJson) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export class OficiosService {
  static async createOficio(oficioData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/oficios`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(oficioData)
      });

      const contentType = response.headers.get('content-type') || '';
      let data = { success: false, message: 'Respuesta no válida del servidor' };

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { success: response.ok, message: text || data.message };
      }
      return data;
    } catch (error) {
      console.error('Error en createOficio:', error);
      return { success: false, message: error.message || 'Error en la petición' };
    }
  }

  static async getAllOficios() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/oficios`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.message || 'Error al obtener oficios' };
      }
      return data;
    } catch (error) {
      console.error('Error en getAllOficios:', error);
      return { success: false, message: error.message || 'Error en la petición' };
    }
  }

  static async getOficioById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/oficios/${id}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.message || 'Error al obtener el oficio' };
      }
      return data;
    } catch (error) {
      console.error('Error en getOficioById:', error);
      return { success: false, message: error.message || 'Error en la petición' };
    }
  }

   static async checkNumero(numero) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/oficios/check/${encodeURIComponent(numero)}`, {
        headers: getAuthHeaders(false)
      });
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        return data;
      }
      const text = await response.text();
      return { success: response.ok, message: text };
    } catch (error) {
      console.error('Error en checkNumero:', error);
      return { success: false, message: error.message || 'Error en la petición' };
    }
  }

  static async getSeguimientoOficio(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/oficios/${id}/seguimiento`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.message || 'Error al obtener el seguimiento' };
      }
      return data;
    } catch (error) {
      console.error('Error en getSeguimientoOficio:', error);
      return { success: false, message: error.message || 'Error en la petición' };
    }
  }
}