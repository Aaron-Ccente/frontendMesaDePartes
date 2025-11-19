import { fetchWithAuth } from './api';

class ComplementService {

  // Obtener peritos disponibles (lógica inteligente)
  async getPeritosDisponibles({ idEspecialidad, idTiposExamen }) {
    try {
      const params = new URLSearchParams();
      if (idEspecialidad) {
        params.append('idEspecialidad', idEspecialidad);
      }
      // Aceptar un array de IDs de examen y añadirlos a los parámetros
      if (idTiposExamen && idTiposExamen.length > 0) {
        idTiposExamen.forEach(id => params.append('idTiposExamen', id));
      }

      const url = `/api/peritos/disponibles?${params.toString()}`;
      const response = await fetchWithAuth(url, { method: 'GET' });
      const data = await response.json();
      if (!response.ok) {
        return { error: data.error || data.message || 'Error obteniendo peritos.' };
      }
      return data;
    } catch (error) {
      console.error('Error en getPeritosDisponibles:', error);
      if (!error.message.includes('Sesión expirada')) {
        return { error: error.message || 'Error de red' };
      }
    }
  }

  // Obtener peritos disponibles para la asignación inicial
  async getPeritosParaAsignacion({ idTiposExamen, tipoDeIngreso }) {
    try {
      const params = new URLSearchParams();
      if (Array.isArray(idTiposExamen)) {
        idTiposExamen.forEach(id => params.append('idTiposExamen', id));
      }
      if (tipoDeIngreso) {
        params.append('tipoDeIngreso', tipoDeIngreso);
      }

      const url = `/api/peritos/disponibles-para-asignacion?${params.toString()}`;
      const response = await fetchWithAuth(url, { method: 'GET' });
      const data = await response.json();
      if (!response.ok) {
        return { error: data.error || data.message || 'Error obteniendo peritos para asignación.' };
      }
      return data;
    } catch (error) {
      console.error('Error en getPeritosParaAsignacion:', error);
      if (!error.message.includes('Sesión expirada')) {
        return { error: error.message || 'Error de red' };
      }
    }
  }

  // Obtener peritos por ID de sección
  async getPeritosPorSeccion(idSeccion) {
    try {
      const url = `/api/peritos/carga_por_seccion?seccion=${idSeccion}`;
      const response = await fetchWithAuth(url, { method: 'GET' });
      const data = await response.json();
      if (!response.ok) {
        return { error: data.error || data.message || 'Error obteniendo peritos por sección.' };
      }
      return data;
    } catch (error) {
      console.error('Error en getPeritosPorSeccion:', error);
      if (!error.message.includes('Sesión expirada')) {
        return { error: error.message || 'Error de red' };
      }
    }
  }

  // Obtener perito por seagun su especialidad
  async getAllPeritoAccordingToSpecialty(id_especialidad) {
    try {
      const url = `/api/peritos/especialidad?id_especialidad=${id_especialidad}`;
      const response = await fetchWithAuth(url, {
        method: 'GET',
      });
      const data = await response.json();
      if (!response.ok) {
        return { error: data.error || data.message || 'Error obteniendo peritos.' };
      }

      return data;
    } catch (error) {
      console.error('Error en getAllPeritoAccordingToSpecialty:', error);
      // El error de sesión expirada ya lo maneja fetchWithAuth, solo capturamos otros errores
      if (!error.message.includes('Sesión expirada')) {
        return { error: error.message || 'Error de red' };
      }
    }
  }

  // Obtiene todas los grados
  async getGrados() {
    try {
      const response = await fetchWithAuth(`/api/grados`, {
        method: 'GET',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener los grados');
      }

      return data;
    } catch (error) {
      console.error('Error al obtener grados:', error);
      if (!error.message.includes('Sesión expirada')) {
        throw error;
      }
    }
  }

 // Obtiene todas los tipos de departamentos
  async getTiposDepartamento() {
    try {
      const response = await fetchWithAuth(`/api/tipodepartamentos`, {
        method: 'GET',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener los departamentos');
      }

      return data;
    } catch (error) {
      console.error('Error al obtener los tipos de departamento:', error);
      if (!error.message.includes('Sesión expirada')) {
        throw error;
      }
    }
  }
    // Obtiene todas los grados
  async getTurnos() {
        try {
        const response = await fetchWithAuth(`/api/turnos`, {
            method: 'GET',
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Error al obtener los turnos');
        }

        return data;
        } catch (error) {
        console.error('Error al obtener los turnos:', error);
        if (!error.message.includes('Sesión expirada')) {
          throw error;
        }
        }
    }

    async getSecciones(id){
      try {
        const response = await fetchWithAuth(`/api/secciones?id=${id}`, {
            method: 'GET',
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Error al obtener los turnos');
        }

        return data;
        } catch (error) {
        console.error('Error al obtener los turnos:', error);
        if (!error.message.includes('Sesión expirada')) {
          throw error;
        }
        }
    }

    async getAllPriorities(){
      try {
            const response = await fetchWithAuth(`/api/prioridades`, {
            method: 'GET',
        })
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Error al obtener las prioridades');
        }

        return data;
      } catch (error) {
        console.error('Error al obtener los turnos:', error);
        if (!error.message.includes('Sesión expirada')) {
          throw error;
        }
      }
      }

    // Obtener tipos de examen por id de tipo de departamento
    async getTiposByDepartamento(id_departamento) {
        try {
            const response = await fetchWithAuth(`/api/tiposdeexamen/departamento/${id_departamento}`, {
                method: 'GET',
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Error al obtener los tipos de examen por departamento');
            }
            return data;
        } catch (error) {
            console.error(error);
            if (!error.message.includes('Sesión expirada')) {
              throw error;
            }
        }
    }
}

export const ComplementServices = new ComplementService();

