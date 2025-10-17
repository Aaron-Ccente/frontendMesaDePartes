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

class PrioridadService{
    // Obtener todas las prioridades
    static async getAllPrioridades() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/prioridades`, {
                method: 'GET',
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error('Error al obtener las prioridades');
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    
    // Obtener prioridad por ID
    static async getPrioridadById(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/prioridades/${id}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error('Error al obtener la prioridad');
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    
    }

    // Crear nueva prioridad
    static async createPrioridad(prioridadData) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/prioridades`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(prioridadData)
            });
            if (!response.ok) throw new Error('Error al crear la prioridad');
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    // Actualizar prioridad
    static async updatePrioridad(id, prioridadData) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/prioridades/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(prioridadData)
            });
            if (!response.ok) throw new Error('Error al actualizar la prioridad');
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    
    // Eliminar prioridad
    static async deletePrioridad(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/prioridades/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error('Error al eliminar la prioridad');
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

export const prioridadService = new PrioridadService();