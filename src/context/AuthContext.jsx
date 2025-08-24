import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { AuthContext } from './AuthContext.js';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        // Primero verificar si hay una sesión de perito activa
        const peritoToken = localStorage.getItem('peritoToken');
        const peritoData = localStorage.getItem('peritoData');
        
        if (peritoToken && peritoData) {
          try {
            const parsedPeritoData = JSON.parse(peritoData);
            // Verificar que los datos del perito sean válidos
            if (parsedPeritoData.CIP && parsedPeritoData.role === 'perito') {
              setUser(parsedPeritoData);
              setIsAuthenticated(true);
              setLoading(false);
              return;
            } else {
              localStorage.removeItem('peritoToken');
              localStorage.removeItem('peritoData');
            }
          } catch (error) {
            console.log(error)
            localStorage.removeItem('peritoToken');
            localStorage.removeItem('peritoData');
          }
        }
        
        // Si no hay sesión de perito, verificar autenticación de administrador
        if (authService.isAuthenticated()) {
          //validar el token
          try {
            const isValid = await authService.validateAndRefreshToken();
            if (isValid) {
              const userData = authService.getAdminData();
              if (userData) {
                setUser(userData);
                setIsAuthenticated(true);
              } else {
                // Token válido pero no hay datos de usuario, limpiar
                authService.logout();
                setUser(null);
                setIsAuthenticated(false);
              }
            } else {
              // Token inválido, limpiar estado
              authService.logout();
              setUser(null);
              setIsAuthenticated(false);
            }
          } catch (error) {
            console.log(error)
            // Si hay error en la validación, limpiar todo
            authService.logout();
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          // No hay token ni sesión de perito, usuario no autenticado
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.log(error)
        // En caso de error, limpiar todo
        authService.logout();
        localStorage.removeItem('peritoToken');
        localStorage.removeItem('peritoData');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      setUser(null);
      setIsAuthenticated(false);
      const response = await authService.loginAdmin(credentials);
      
      if (response.success) {
        // Agregar campo role para compatibilidad
        const adminData = {
          ...response.admin,
          role: 'admin' // Agregar role para compatibilidad con el sistema
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

  const loginPerito = async (peritoData) => {
    try {
      setLoading(true);
      setUser(null);
      setIsAuthenticated(false);
      // Agregar campo role para compatibilidad
      const peritoWithRole = {
        ...peritoData,
        role: 'perito' // Agregar role para compatibilidad con el sistema
      };
      
      // Guardar en localStorage (temporal hasta implementar JWT)
      localStorage.setItem('peritoToken', 'temp-token');
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

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const logoutPerito = () => {
    // Limpiar localStorage
    localStorage.removeItem('peritoToken');
    localStorage.removeItem('peritoData');
    
    // Limpiar estado del contexto
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData) => {
    setUser(userData);
    if (userData.role === 'admin') {
      authService.setAdminData(userData);
    } else if (userData.role === 'perito') {
      localStorage.setItem('peritoData', JSON.stringify(userData));
    }
  };

  // Funciones helper para verificar el tipo de usuario
  const isAdmin = () => user && user.role === 'admin';
  const isPerito = () => user && user.role === 'perito';
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
    getUserRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
