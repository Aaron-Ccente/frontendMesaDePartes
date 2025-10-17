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

class TurnoService{
    // Obtener todas las prioridades
    static async getAllTurnos() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/turnos`, {
                method: 'GET',
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error('Error al obtener los turnos');
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    // Obtener prioridad por ID
    static async getTurnoById(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/turnos/${id}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error('Error al obtener el turno');
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    // Crear nueva prioridad
    static async createTurno(turnoData) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/turnos`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(turnoData)
            });
            if (!response.ok) throw new Error('Error al crear el turno');
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    // Actualizar turno
    static async updateTurno(id, turnoData) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/turnos/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(turnoData)
            });
            if (!response.ok) throw new Error('Error al actualizar el turno');
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    // Eliminar turno
    static async deleteTurno(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/turnos/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error('Error al eliminar el turno');
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

export const turnoService = new TurnoService();