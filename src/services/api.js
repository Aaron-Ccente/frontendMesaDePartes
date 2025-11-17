// src/services/api.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

// Función para obtener el token correcto según el rol o el contexto
const getActiveToken = () => {
  // Se prioriza el token de mesa de partes si existe, ya que es el contexto actual
  const mesaToken = localStorage.getItem('mesadepartesToken');
  if (mesaToken) return mesaToken;

  const adminToken = localStorage.getItem('adminToken');
  if (adminToken) return adminToken;
  
  const peritoToken = localStorage.getItem('peritoToken');
  if (peritoToken) return peritoToken;

  return null;
};

// Función para limpiar todos los datos de sesión
export const clearAllSessions = () => {
    localStorage.removeItem('mesadepartesToken');
    localStorage.removeItem('mesadepartesData');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    localStorage.removeItem('peritoToken');
    localStorage.removeItem('peritoData');
};

export const fetchWithAuth = async (url, options = {}) => {
  const token = getActiveToken();
  
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Asegurar que Content-Type se establezca si hay un cuerpo y no está ya en las cabeceras
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  // Si el token es inválido o la sesión expiró, redirigir al login
  if (response.status === 401 || response.status === 403) {
    clearAllSessions();
    // Redirige a la página de login principal. 
    // Asumimos que /login es la ruta correcta.
    window.location.href = '/login'; 
    
    // Lanza un error para detener la ejecución del código que llamó a fetchWithAuth
    throw new Error('Sesión expirada. Redirigiendo al login.');
  }

  return response;
};
