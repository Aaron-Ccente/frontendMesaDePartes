import { authService } from './authService.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

  const getHeaders = () => {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }
export class PeritoService {
  // Obtener headers con token de autenticación

  // Crear nuevo perito
  static async createPerito(peritoData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/peritos`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(peritoData)
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || data.message || 'Error creando perito' };
      }

      return data;
    } catch (error) {
      console.error('Error en createPerito:', error);
      return { error: error.message || 'Error de red' };
    }
  }

  // Obtener todos los peritos
  static async getAllPeritos(page = 1, limit = 50, search = '') {
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
        headers: getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || data.message || 'Error obteniendo peritos' };
      }

      return data;
    } catch (error) {
      console.error('Error en getAllPeritos:', error);
      return { error: error.message || 'Error de red' };
    }
  }

  // Obtener perito por CIP
  static async getPeritoByCIP(cip) {
    try {
      const url = `${API_BASE_URL}/api/peritos/${cip}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders()
      });
      const data = await response.json();
      if (!response.ok) {
        return { error: data.error || data.message || 'Error obteniendo perito' };
      }

      return data;
    } catch (error) {
      console.error('Error en getPeritoByCIP:', error);
      return { error: error.message || 'Error de red' };
    }
  }

  // Actualizar perito
 static async updatePerito(cip, updateData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/peritos/${cip}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || data.message || 'Error actualizando perito' };
      }

      return data;
    } catch (error) {
      console.error('Error en updatePerito:', error);
      return { error: error.message || 'Error de red' };
    }
  }

  // Eliminar perito
  static async deletePerito(cip) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/peritos/${cip}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || data.message || 'Error eliminando perito' };
      }

      return data;
    } catch (error) {
      console.error('Error en deletePerito:', error);
      return { error: error.message || 'Error de red' };
    }
  }

  // Cambiar contraseña de perito
  static async changePeritoPassword(cip, newPassword) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/peritos/${cip}/password`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || data.message || 'Error cambiando contraseña' };
      }

      return data;
    } catch (error) {
      console.error('Error en changePeritoPassword:', error);
      return { error: error.message || 'Error de red' };
    }
  }

  // Obtener estadísticas de peritos
  static async getPeritosStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/peritos/stats/overview`, {
        method: 'GET',

        headers: getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || data.message || 'Error obteniendo estadísticas' };
      }

      return data;
    } catch (error) {
      console.error('Error en getPeritosStats:', error);
      return { error: error.message || 'Error de red' };
    }
  }

  // Obtener estadísticas de un perito por CIP
  static async getPeritoStatsByCIP(cip) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/peritos/stats/${cip}`, {
        method: 'GET',
        headers: getHeaders()
      });
      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || data.message || 'Error obteniendo estadísticas del perito' };
      }
      return data;
    } catch (error) {
      console.error('Error en getPeritoStatsByCIP:', error);
      return { error: error.message || 'Error de red' };
    }
  }

  // Login de perito (para futuras implementaciones)
  static async loginPerito(username, password) {
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
        return { error: data.error || data.message || 'Error en login de perito' };
      }

      return data;
    } catch (error) {
      console.error('Error en loginPerito:', error);
      return { error: error.message || 'Error de red' };
    }
  }

  // Para obtener todas las relaciones con sus especialidades, grados, secciones y departamento
  static async getEspecialidades(){
    try {
      const response = await fetch(`${API_BASE_URL}/api/peritos/especialidades`, {
        method: 'GET',
        headers: getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || data.message || 'Error al obtener especialidades' };
      }

      return data;
    } catch (error) {
      console.error('Error al obtener especialidades:', error);
      return { error: error.message || 'Error de red' };
    }
  }

  // Logout mesa de partes
  static async logOutPerito(){
    try {
      const response = await fetch(`${API_BASE_URL}/api/peritos/logout`, {
        method: 'POST',
        // enviar el token de autenticación de un usuario perito
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('peritoToken')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error en el registro');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Error en el registro: ' + error.message);
    }
  }

}   