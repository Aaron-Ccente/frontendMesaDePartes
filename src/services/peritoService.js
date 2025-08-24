import { authService } from './authService.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

class PeritoService {
  // Obtener headers con token de autenticación
  getHeaders() {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Crear nuevo perito
  async createPerito(peritoData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/peritos`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(peritoData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error creando perito');
      }

      return data;
    } catch (error) {
      console.error('Error en createPerito:', error);
      throw error;
    }
  }

  // Obtener todos los peritos
  async getAllPeritos(page = 1, limit = 50, search = '') {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`${API_BASE_URL}/api/peritos?${params}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error obteniendo peritos');
      }

      return data;
    } catch (error) {
      console.error('Error en getAllPeritos:', error);
      throw error;
    }
  }

  // Obtener perito por CIP
  async getPeritoByCIP(cip) {
    try {
      const url = `${API_BASE_URL}/api/peritos/${cip}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error obteniendo perito');
      }

      return data;
    } catch (error) {
      console.error('Error en getPeritoByCIP:', error);
      throw error;
    }
  }

  // Actualizar perito
  async updatePerito(cip, updateData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/peritos/${cip}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error actualizando perito');
      }

      return data;
    } catch (error) {
      console.error('Error en updatePerito:', error);
      throw error;
    }
  }

  // Eliminar perito
  async deletePerito(cip) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/peritos/${cip}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error eliminando perito');
      }

      return data;
    } catch (error) {
      console.error('Error en deletePerito:', error);
      throw error;
    }
  }

  // Cambiar contraseña de perito
  async changePeritoPassword(cip, newPassword) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/peritos/${cip}/password`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error cambiando contraseña');
      }

      return data;
    } catch (error) {
      console.error('Error en changePeritoPassword:', error);
      throw error;
    }
  }

  // Obtener estadísticas de peritos
  async getPeritosStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/peritos/stats/overview`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error obteniendo estadísticas');
      }

      return data;
    } catch (error) {
      console.error('Error en getPeritosStats:', error);
      throw error;
    }
  }

  // Login de perito (para futuras implementaciones)
  async loginPerito(username, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/peritos/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en login de perito');
      }

      return data;
    } catch (error) {
      console.error('Error en loginPerito:', error);
      throw error;
    }
  }
}

export const peritoService = new PeritoService();
