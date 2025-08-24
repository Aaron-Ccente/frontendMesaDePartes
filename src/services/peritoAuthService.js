const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

class PeritoAuthService {
  // Login de perito
  async loginPerito(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/peritos/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          CIP: credentials.CIP,
          contrasena: credentials.contrasena
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error en el login');
      }

      return data;
    } catch (error) {
      console.error('Error en loginPerito:', error);
      throw error;
    }
  }

  // Logout de perito
  logoutPerito() {
    // Limpiar datos del localStorage
    localStorage.removeItem('peritoToken');
    localStorage.removeItem('peritoData');
  }

  // Verificar si hay sesión activa
  isAuthenticated() {
    const token = localStorage.getItem('peritoToken');
    const peritoData = localStorage.getItem('peritoData');
    return !!(token && peritoData);
  }

  // Obtener datos del perito autenticado
  getPeritoData() {
    const peritoData = localStorage.getItem('peritoData');
    return peritoData ? JSON.parse(peritoData) : null;
  }
}

export const peritoAuthService = new PeritoAuthService();
