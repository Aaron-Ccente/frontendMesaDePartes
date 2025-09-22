const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

const tokenKey = 'adminToken';
const userDataKey = 'adminData';

const getAuthHeaders = (includeJson = true) => {
  const token = localStorage.getItem(tokenKey) || '';
  const headers = {};
  if (includeJson) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const authService = {
  // Login de administrador
  async loginAdmin(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/admin/login`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error en el login');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Error en el login: ' + error.message);
    }
  },

  // Registro de administrador (ruta pública en tu backend)
  async registerAdmin(adminData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/admin/register`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(adminData),
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
  },

  // Obtener lista de administradores (paginado) - protegido
  async getAllAdmins(page = 1, limit = 10, search = '') {
    try {
      const params = new URLSearchParams();
      params.set('page', page);
      params.set('limit', limit);
      if (search) params.set('search', search);

      const resp = await fetch(`${API_BASE_URL}/api/auth/admins?${params.toString()}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || 'Error obteniendo administradores');
      }

      const data = await resp.json();
      return data;
    } catch (error) {
      throw new Error('Error en getAllAdmins: ' + error.message);
    }
  },

  // Obtener admin por CIP - protegido
  async getAdminByCIP(cip) {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/auth/admins/${encodeURIComponent(cip)}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || 'Error obteniendo administrador');
      }

      const data = await resp.json();
      return data;
    } catch (error) {
      throw new Error('Error en getAdminByCIP: ' + error.message);
    }
  },

  // Actualizar admin - protegido
  async updateAdmin(cip, adminData) {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/auth/admins/${encodeURIComponent(cip)}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(adminData),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || 'Error actualizando administrador');
      }

      const data = await resp.json();
      return data;
    } catch (error) {
      throw new Error('Error en updateAdmin: ' + error.message);
    }
  },

  // Eliminar admin - protegido
  async deleteAdmin(cip) {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/auth/admins/${encodeURIComponent(cip)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(false),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || 'Error eliminando administrador');
      }

      const data = await resp.json();
      return data;
    } catch (error) {
      throw new Error('Error en deleteAdmin: ' + error.message);
    }
  },

  // Verificar token - protegido
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
        signal: controller.signal,
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

  // Obtener información del administrador - protegido
  async getAdminInfo() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/admin/info`, {
        method: 'GET',
        headers: getAuthHeaders(),
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

  // Resto de utilidades...
  isAuthenticated() {
    const token = localStorage.getItem(tokenKey);
    return !!token;
  },

  getToken() {
    return localStorage.getItem(tokenKey);
  },

  setToken(token) {
    localStorage.setItem(tokenKey, token);
  },

  logout() {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userDataKey);
  },

  setAdminData(adminData) {
    localStorage.setItem(userDataKey, JSON.stringify(adminData));
  },

  getAdminData() {
    const data = localStorage.getItem(userDataKey);
    try {
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async validateAndRefreshToken() {
    try {
      const token = this.getToken();
      if (!token) return false;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const result = await this.verifyToken(token);
        clearTimeout(timeoutId);

        if (result.success) {
          this.setAdminData(result.admin);
          return true;
        }
        return false;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') return true;
        return true;
      }
    } catch (error) {
      console.error('Error general validando token:', error);
      this.logout();
      return false;
    }
  }
};
