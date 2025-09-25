const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

class MesaDePartesAuthServices {
  // Login de perito
  async loginMesaDePartes(credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/mesadepartes/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          CIP: credentials.CIP,
          password_hash: credentials.password_hash
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error en el login');
      }

      return data;
    } catch (error) {
      console.error('Error en usuario de mesa de partes:', error);
      throw error;
    }
  }

  // Logout del usuario de mesa de partes
  logoutPerito() {
    // Limpiar datos del localStorage
    localStorage.removeItem('mesadepartesToken');
    localStorage.removeItem('mesadepartesData');
  }

  // Verificar si hay sesión activa
  isAuthenticated() {
    const token = localStorage.getItem('mesadepartesToken');
    const mesadepartes = localStorage.getItem('mesadepartesData');
    return !!(token && mesadepartes);
  }

  // Obtener datos del usuario de mesa de partes autenticado
  getPeritoData() {
    const mesadepartesData = localStorage.getItem('mesadepartesData');
    return mesadepartesData ? JSON.parse(mesadepartesData) : null;
  }
}

export const MesaDePartesAuthService = new MesaDePartesAuthServices();
