const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

const tokenKey = 'adminToken';
const userDataKey = 'adminData';

export const authService = {
  // Login de administrador
  async loginAdmin(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en el login');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Error en el login: ' + error.message);
    }
  },

  // Registro de administrador
  async registerAdmin(adminData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/admin/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en el registro');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Error en el registro: ' + error.message);
    }
  },

  // Verificar token
  async verifyToken(token) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos de timeout
      
      const response = await fetch(`${API_BASE_URL}/api/auth/admin/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Token inválido');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Timeout al verificar token');
      }
      throw new Error('Error en verificación: ' + error.message);
    }
  },

  // Obtener información del administrador
  async getAdminInfo(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/admin/info`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener información del administrador');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Error al obtener información: ' + error.message);
    }
  },

  // Verificar si el usuario está autenticado
  isAuthenticated() {
    const token = localStorage.getItem(tokenKey);
    return !!token;
  },

  // Obtener token del localStorage
  getToken() {
    return localStorage.getItem(tokenKey);
  },

  // Guardar token en localStorage
  setToken(token) {
    localStorage.setItem(tokenKey, token);
  },

  // Cerrar sesión
  logout() {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userDataKey);
  },

  // Guardar datos del administrador
  setAdminData(adminData) {
    localStorage.setItem(userDataKey, JSON.stringify(adminData));
  },

  // Obtener datos del administrador
  getAdminData() {
    const data = localStorage.getItem(userDataKey);
    try {
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  // Verifica si el token es válido
  async validateAndRefreshToken() {
    try {
      const token = this.getToken();
      if (!token) {
        return false;
      }
      // Intentar verificar el token con timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const result = await this.verifyToken(token);
        clearTimeout(timeoutId);
        
        if (result.success) {
          // Actualizar datos del administrador
          this.setAdminData(result.admin);
          return true;
        }
        return false;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          return true;
        }
        return true;
      }
    } catch (error) {
      console.error('Error general validando token:', error);
      this.logout();
      return false;
    }
  }
};
