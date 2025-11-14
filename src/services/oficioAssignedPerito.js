const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

const tokenKey = 'peritoToken';

const getAuthHeaders = (includeJson = true) => {
  const token = localStorage.getItem(tokenKey);
  const headers = {};
  if (includeJson) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export class OficioAssignedPeritoService {
    // Obtener oficios asignados al perito
    static async getAssignedOficios() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/oficios/assigned`, {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Error al obtener oficios asignados');
            }
            return data;
        } catch (error) {
            console.error('Error en getAssignedOficios:', error);
            throw error;
        }
    }

    static async getCountNewOficios() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/oficios/alerts`, {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Error al obtener oficios asignados');
            }
            return data;
        } catch (error) {
            console.error('Error en getCountNewOficios:', error);
            throw error;
        }
    }

    // Responder a un oficio
    static async respondToOficio(id_oficio, estado_nuevo, estado_anterior = null, comentario = null) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/oficios/${id_oficio}/respond`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    estado_nuevo,
                    estado_anterior,
                    comentario
                })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Error al responder oficio');
            }
            return data;
        } catch (error) {
            console.error('Error en respondToOficio:', error);
            throw error;
        }
    }

    // Actualizar el estado de un caso
    static async actualizarEstadoCaso(id_oficio, nuevo_estado) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/seguimiento/casos/${id_oficio}/estado`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ nuevo_estado })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Error al actualizar el estado del caso');
            }
            return data;
        } catch (error) {
            console.error('Error en actualizarEstadoCaso:', error);
            throw error;
        }
    }

    // Obtener peritos para derivación
    static async getPeritosParaDerivacion(id_oficio) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/seguimiento/peritos-derivacion?casoId=${id_oficio}`, {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Error al obtener peritos para derivación');
            }
            return data;
        } catch (error) {
            console.error('Error en getPeritosParaDerivacion:', error);
            throw error;
        }
    }
}