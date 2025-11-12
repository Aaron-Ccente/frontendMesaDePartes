import { fetchWithAuth } from './api';

export class OficiosService {
  static async createOficio(oficioData) {
    try {
      const response = await fetchWithAuth(`/api/oficios`, {
        method: 'POST',
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
      if (!error.message.includes('Sesión expirada')) {
        return { success: false, message: error.message || 'Error en la petición' };
      }
    }
  }

  static async getAllOficios() {
    try {
      const response = await fetchWithAuth(`/api/oficios`);
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.message || 'Error al obtener oficios' };
      }
      return data;
    } catch (error) {
      console.error('Error en getAllOficios:', error);
      if (!error.message.includes('Sesión expirada')) {
        return { success: false, message: error.message || 'Error en la petición' };
      }
    }
  }

  static async getOficioById(id) {
    try {
      const response = await fetchWithAuth(`/api/oficios/${id}`);
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.message || 'Error al obtener el oficio' };
      }
      return data;
    } catch (error) {
      console.error('Error en getOficioById:', error);
      if (!error.message.includes('Sesión expirada')) {
        return { success: false, message: error.message || 'Error en la petición' };
      }
    }
  }

   static async checkNumero(numero) {
    try {
      const response = await fetchWithAuth(`/api/oficios/check/${encodeURIComponent(numero)}`);
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        return data;
      }
      const text = await response.text();
      return { success: response.ok, message: text };
    } catch (error) {
      console.error('Error en checkNumero:', error);
      if (!error.message.includes('Sesión expirada')) {
        return { success: false, message: error.message || 'Error en la petición' };
      }
    }
  }

  static async getSeguimientoOficio(id) {
    try {
      const response = await fetchWithAuth(`/api/oficios/${id}/seguimiento`);
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.message || 'Error al obtener el seguimiento' };
      }
      return data;
    } catch (error) {
      console.error('Error en getSeguimientoOficio:', error);
      if (!error.message.includes('Sesión expirada')) {
        return { success: false, message: error.message || 'Error en la petición' };
      }
    }
  }
}