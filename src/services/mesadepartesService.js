const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

class MesaDePartes {
  // Obtener headers con token de autenticación
  static getHeaders() {
    const adminToken = localStorage.getItem('adminToken');
    const mesadepartesToken = localStorage.getItem('mesadepartesToken');
    const token = adminToken || mesadepartesToken;

    if (!token) {
      console.warn('No se encontró token de autenticación');
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Crear nuevo perito
  static async createUserMesaDePartes(peritoData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/mesadepartes`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(peritoData)
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || data.message || 'Error creando usuario' };
      }

      return data;
    } catch (error) {
      console.error('Error en usuario:', error);
      return { error: error.message || 'Error de red' };
    }
  }

  // Obtener todos los peritos
  static async getAllUserMesaDePartes(page = 1, limit = 10, search = '') {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`${API_BASE_URL}/api/mesadepartes?${params}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || data.message || 'Error obteniendo usuarios' };
      }

      return data;
    } catch (error) {
      console.error('Error en getAllPeritos:', error);
      return { error: error.message || 'Error de red' };
    }
  }

  // Obtener perito por CIP
  static async getUserMesaDePartesByCIP(cip) {
    try {
      const url = `${API_BASE_URL}/api/mesadepartes/${cip}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
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
 static async updateUserMesaDePartes(cip, updateData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/mesadepartes/${cip}`, {
        method: 'PUT',
        headers: this.getHeaders(),
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
  static async deleteUserMesaDePartes(cip) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/mesadepartes/${cip}`, {
        method: 'DELETE',
        headers: this.getHeaders()
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

  // Logout mesa de partes
  static async logOutMesaDePartes(){
    try {
      const response = await fetch(`${API_BASE_URL}/api/mesadepartes/logout`, {
        method: 'POST',
        // enviar el token de autenticación de un usuario de mesa de partes
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('mesadepartesToken')}`
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

  // Obtener casos para la vista de seguimiento
  static async getCasos({ estado = 'pendiente', search = '' }) {
    try {
      const params = new URLSearchParams({
        estado,
      });

      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`${API_BASE_URL}/api/seguimiento/casos?${params}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || data.message || 'Error obteniendo los casos' };
      }

      return data;
    } catch (error) {
      console.error('Error en getCasos:', error);
      return { error: error.message || 'Error de red' };
    }
  }

  // Obtener el detalle de un caso específico
  static async getDetalleCaso(id_oficio) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/seguimiento/casos/${id_oficio}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || data.message || 'Error obteniendo el detalle del caso' };
      }

      return data;
    } catch (error) {
      console.error('Error en getDetalleCaso:', error);
      return { error: error.message || 'Error de red' };
    }
  }

  // Obtener estadísticas para el dashboard de Mesa de Partes
  static async getDashboardStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/mesadepartes-dashboard/stats`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      const data = await response.json();
      if (!response.ok) {
        return { error: data.error || data.message || 'Error obteniendo estadísticas' };
      }
      return data;
    } catch (error) {
      console.error('Error en getDashboardStats:', error);
      return { error: error.message || 'Error de red' };
    }
  }

  // Obtener casos recientes para el dashboard de Mesa de Partes
  static async getRecentCases() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/mesadepartes-dashboard/casos-recientes`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      const data = await response.json();
      if (!response.ok) {
        return { error: data.error || data.message || 'Error obteniendo casos recientes' };
      }
      return data;
    } catch (error) {
      console.error('Error en getRecentCases:', error);
      return { error: error.message || 'Error de red' };
    }
  }

}   

export default MesaDePartes;
