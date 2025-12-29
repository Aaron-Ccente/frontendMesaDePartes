import { fetchWithAuth } from './api';

export const configService = {
  // Obtener todas las configuraciones
  getAllConfigs: async () => {
    try {
      const response = await fetchWithAuth('/api/admin/config', {
        method: 'GET'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw data || { message: 'Error al obtener configuraciones' };
      }
      
      return data; // { success: true, data: [...] }
    } catch (error) {
      console.error('Error en getAllConfigs:', error);
      throw error;
    }
  },

  // Actualizar configuraciones (Batch)
  updateConfigs: async (configsArray) => {
    try {
      const response = await fetchWithAuth('/api/admin/config', {
        method: 'PUT',
        body: JSON.stringify({ configs: configsArray })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw data || { message: 'Error al actualizar configuraciones' };
      }
      
      return data;
    } catch (error) {
      console.error('Error en updateConfigs:', error);
      throw error;
    }
  }
};