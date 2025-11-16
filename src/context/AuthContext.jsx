import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { AuthContext } from './AuthContext.js';
import { MesaDePartesAuthService } from '../services/mesadepartesAuthService';
import { clearAllSessions } from '../services/api.js'; // Import the function

// Añadir función para normalizar roles
const normalizeRole = (role) => {
  if (!role) return null;
  return String(role).toLowerCase().replace(/[\s_-]/g, '');
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);

        // 1. PRIMERO verificar token de administrador
        if (authService.getToken()) {
          try {
            const isValid = await authService.validateAndRefreshToken();
            if (isValid) {
              const userData = authService.getAdminData();
              if (userData) {
                setUser({...userData, role: 'admin'});
                setIsAuthenticated(true);
                setLoading(false);
                return;
              }
            }
            // Si no es válido, limpiar
            authService.logout();
          } catch (error) {
            console.error('Error validando token admin:', error);
            authService.logout();
          }
        }

        // 2. SEGUNDO verificar sesión de perito
        const peritoData = localStorage.getItem('peritoData');
        const peritoToken = localStorage.getItem('peritoToken');
        
        if (peritoToken && peritoData) {
          try {
            const parsedData = JSON.parse(peritoData);
            if (parsedData.CIP && parsedData.role === 'perito') {
              setUser(parsedData);
              setIsAuthenticated(true);
              setLoading(false);
              return;
            }
          } catch (error) {
            console.error('Error parsing perito data:', error);
            localStorage.removeItem('peritoToken');
            localStorage.removeItem('peritoData');
          }
        }

        // 3. TERCERO verificar sesión de mesa de partes
        const mesaData = localStorage.getItem('mesadepartesData');
        const mesaToken = localStorage.getItem('mesadepartesToken');
        
        if (mesaToken && mesaData) {
          try {
            const parsedMesa = JSON.parse(mesaData);
            // Validar que los datos sean completos
            if (parsedMesa?.CIP) {
              const role = normalizeRole(parsedMesa.role) || 'mesadepartes';
              setUser({ ...parsedMesa, role });
              setIsAuthenticated(true);
              setLoading(false);
              return;
            }
          } catch (err) {
            console.error('Error parsing mesadepartes data:', err);
            localStorage.removeItem('mesadepartesToken');
            localStorage.removeItem('mesadepartesData');
          }
        }

        // 4. Si no hay ninguna sesión válida
        setUser(null);
        setIsAuthenticated(false);

      } catch (error) {
        console.error('Error en initializeAuth:', error);
        // Limpiar todo
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  //  login de mesa de partes
  const loginMesaDePartes = async (mesadepartes) => {
    try {
      setLoading(true);
      clearAllSessions(); // Clean slate before login

      // Si ya viene la respuesta del servicio
      if (mesadepartes && (mesadepartes.token || mesadepartes.CIP) && !mesadepartes.password_hash) {
        const token = mesadepartes.token || mesadepartes.accessToken || null;
        const data = mesadepartes.data || mesadepartes.user || mesadepartes;

        if (token) localStorage.setItem('mesadepartesToken', token);
        if (data) {
          const role = normalizeRole(data.role) || 'mesadepartes';
          const store = { ...data, role };
          localStorage.setItem('mesadepartesData', JSON.stringify(store));
          setUser(store);
          setIsAuthenticated(true);
          return { success: true };
        }
        return { success: false, message: mesadepartes.message || 'Login fallido' };
      }

      // Si se pasan credenciales, llamar al service
      if (mesadepartes && mesadepartes.CIP && mesadepartes.password_hash) {
        const resp = await MesaDePartesAuthService.loginMesaDePartes({
          CIP: mesadepartes.CIP,
          password_hash: mesadepartes.password_hash
        });

        const token = resp?.token || resp?.accessToken || null;
        const data = resp?.data || resp?.user || resp;

        if (token) localStorage.setItem('mesadepartesToken', token);
        if (data) {
          const role = normalizeRole(data.role) || 'mesadepartes';
          const store = { ...data, role };
          localStorage.setItem('mesadepartesData', JSON.stringify(store));
          setUser(store);
          setIsAuthenticated(true);
          return { success: true };
        }

        return { success: false, message: resp?.message || 'Credenciales inválidas' };
      }

      return { success: false, message: 'Datos inválidos para login' };
    } catch (error) {
      console.error('loginMesaDePartes error:', error);
      return { success: false, message: error?.message || 'Error en el login' };
    } finally {
      setLoading(false);
    }
  };

  // login para administradores
  const login = async (credentials) => {
    try {
      setLoading(true);
      clearAllSessions(); // Clean slate before login
      setUser(null);
      setIsAuthenticated(false);
      const response = await authService.loginAdmin(credentials);
      
      if (response.success) {
        const adminData = {
          ...response.admin,
          role: 'admin'
        };
        
        authService.setToken(response.token);
        authService.setAdminData(adminData);
        setUser(adminData);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Login para peritos
  const loginPerito = async (peritoData, token) => {
    try {
      setLoading(true);
      clearAllSessions(); // Clean slate before login
      setUser(null);
      setIsAuthenticated(false);
      const peritoWithRole = {
        ...peritoData,
        role: 'perito'
      };
      localStorage.setItem('peritoToken', token);
      localStorage.setItem('peritoData', JSON.stringify(peritoWithRole));
      
      setUser(peritoWithRole);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logoutMesaDePartes = () => {
    clearAllSessions(); // Use the global clearer
    setUser(null);
    setIsAuthenticated(false);
  };

  const register = async (adminData) => {
    try {
      setLoading(true);
      const response = await authService.registerAdmin(adminData);
      
      if (response.success) {
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Cerrar sesion para administradores
  const logout = () => {
    clearAllSessions(); // Use the global clearer
    setUser(null);
    setIsAuthenticated(false);
  };

  // Cerrar sesion para peritos
  const logoutPerito = () => {
    clearAllSessions(); // Use the global clearer
    setUser(null);
    setIsAuthenticated(false);
  };

  // Actualizar updateUser para normalizar rol al guardar
  const updateUser = (userData) => {
    const role = normalizeRole(userData.role) || normalizeRole(userData?.rol) || user?.role || null;
    const dataToStore = { ...userData, role };
    setUser(dataToStore);

    if (role === 'admin') {
      authService.setAdminData(dataToStore);
    } else if (role === 'perito') {
      localStorage.setItem('peritoData', JSON.stringify(dataToStore));
    } else if (role && role.includes('mesa')) {
      localStorage.setItem('mesadepartesData', JSON.stringify(dataToStore));
    }
  };

  // Funciones helpe
  const isAdmin = () => {
    const role = normalizeRole(user?.role);
    return role === 'admin';
  };

  const isPerito = () => {
    const role = normalizeRole(user?.role);
    return role === 'perito';
  };

  const isMesaDePartes = () => {
    const role = normalizeRole(user?.role);
    return role === 'mesadepartes';
  };
  const getUserRole = () => user?.role || null;

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    loginPerito,
    register,
    logout,
    logoutPerito,
    updateUser,
    isAdmin,
    isPerito,
    getUserRole,
    isMesaDePartes,
    loginMesaDePartes,
    logoutMesaDePartes
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};