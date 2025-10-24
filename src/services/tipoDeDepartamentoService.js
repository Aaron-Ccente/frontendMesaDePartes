const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

const tokenKeyAdmin = 'adminToken';
 // Para obtener el token de usuario
const getAuthHeaders = (includeJson = true) => {
  const token = localStorage.getItem(tokenKeyAdmin);
  const headers = {};
  if (includeJson) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

class TipoDeDepartamentoService{
    // Obtener todas las especialidades
    static async getAllDepartamentos() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/tipodepartamentos`, {
                method: 'GET',
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error('Error al obtener las especialidades');
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    
    // Obtener especialidad por ID
    static async getDepartamentosById(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/tipodepartamentos/${id}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error('Error al obtener la especialidad');
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    
    }

    // Crear nueva especialidad
    static async createDepartamento(prioridadData) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/tipodepartamentos`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(prioridadData)
            });
            if (!response.ok) throw new Error('Error al crear la especialidad');
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    // Actualizar especialidad
    static async updateDepartamento(id, prioridadData) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/tipodepartamentos/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(prioridadData)
            });
            if (!response.ok) throw new Error('Error al actualizar la especialidad');
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    
    // Eliminar especialidad
    static async deleteDepartamento(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/tipodepartamentos/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error('Error al eliminar la especialidad');
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

export default TipoDeDepartamentoService;