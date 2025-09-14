const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

class ComplementService{

  // Obtiene todas las especialidades
  async getEspecialidades() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/especialidades`, {
        method: 'GET'
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
        method: 'GET'
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
        method: 'GET'
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
            method: 'GET'
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
