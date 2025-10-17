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

class TiposDeExamenService{
    // Obtener todos los tipos de examen
    static async getAllTiposDeExamen() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/tiposdeexamen`, {
                method: 'GET',
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error('Error al obtener los tipos de examen');
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    // Obtener tipos de examen por id de tipo de departamento
    static async getTiposByDepartamento(id_departamento) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/tiposdeexamen/departamento/${id_departamento}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error('Error al obtener los tipos de examen por departamento');
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    // Editar tipo de examen
    static async updateTipoDeExamen(id, tipoDeExamenData) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/tiposdeexamen/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(tipoDeExamenData)
            });
            if (!response.ok) throw new Error('Error al actualizar el tipo de examen');
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    // Crear nuevo tipo de examen
    static async createTipoDeExamen(tipoDeExamenData) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/tiposdeexamen`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(tipoDeExamenData)
            });
            if (!response.ok) throw new Error('Error al crear el tipo de examen');
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    // Eliminar tipo de examen
    static async deleteTipoDeExamen(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/tiposdeexamen/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error('Error al eliminar el tipo de examen');
            return await response.json();
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

export default TiposDeExamenService;