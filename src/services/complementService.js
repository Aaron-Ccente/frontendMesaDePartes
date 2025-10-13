const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

const tokenKeyMesaDePartes = 'mesadepartesToken';
const tokenKeyPerito = 'peritoToken';
const tokenKeyAdmin = 'adminToken';
 // Para obtener el token de usuario
const getAuthHeaders = (includeJson = true) => {
  const token = localStorage.getItem(tokenKeyMesaDePartes) || localStorage.getItem(tokenKeyAdmin) || localStorage.getItem(tokenKeyPerito);
  const headers = {};
  if (includeJson) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

class ComplementService{

  // Obtener perito por seagun su especialidad
  async getAllPeritoAccordingToSpecialty(id_especialidad) {
    try {
      const url = `${API_BASE_URL}/api/peritos/especialidad?id_especialidad=${id_especialidad}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (!response.ok) {
        return { error: data.error || data.message || 'Error obteniendo peritos.' };
      }

      return data;
    } catch (error) {
      console.error('Error en getAllPeritoAccordingToSpecialty:', error);
      return { error: error.message || 'Error de red' };
    }
  }

  // Obtiene todas las especialidades
  async getEspecialidades() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/especialidades`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener especialidades');
      }

      return data;
    } catch (error) {
      console.error('Error al obtener especialidades:', error);
      throw error;
    }
  }

  // Obtiene todas los grados
  async getGrados() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/grados`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener los grados');
      }

      return data;
    } catch (error) {
      console.error('Error al obtener grados:', error);
      throw error;
    }
  }

 // Obtiene todas los tipos de departamentos
  async getTiposDepartamento() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tipodepartamentos`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener los departamentos');
      }

      return data;
    } catch (error) {
      console.error('Error al obtener los tipos de departamento:', error);
      throw error;
    }
  }
    // Obtiene todas los grados
  async getTurnos() {
        try {
        const response = await fetch(`${API_BASE_URL}/api/turnos`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Error al obtener los turnos');
        }

        return data;
        } catch (error) {
        console.error('Error al obtener los turnos:', error);
        throw error;
        }
    }

    async getSecciones(id){
      try {
        const response = await fetch(`${API_BASE_URL}/api/secciones?id=${id}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Error al obtener los turnos');
        }

        return data;
        } catch (error) {
        console.error('Error al obtener los turnos:', error);
        throw error;
        }
    }
}


export const ComplementServices = new ComplementService();
