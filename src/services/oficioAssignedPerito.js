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
}