import React from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from '../ui/ThemeToggle';

const PeritoDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logoutPerito } = useAuth();

  const handleNavigation = (path) => {
    navigate(`/perito/dashboard${path}`);
  };

  const isActiveRoute = (path) => {
    return location.pathname.includes(path);
  };

  const handleLogout = () => {
    logoutPerito();
    navigate('/login');
  };

  // El ProtectedRoute ya verifica la autenticación, así que aquí solo necesitamos el usuario
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg-primary flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d2e] dark:border-dark-pnp-green mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-dark-text-primary">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg-primary transition-colors duration-300">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#1a4d2e] to-[#1a4d2e] text-white shadow-lg dark:shadow-gray-900/50">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="text-3xl">👮</div>
            <div>
              <h1 className="text-2xl font-bold">Mesa de Partes PNP</h1>
              <p className="text-sm text-gray-200 dark:text-dark-text-secondary">Panel de Perito</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Botón de cambio de tema */}
            <ThemeToggle size="md" />
            
            <div className="text-right">
              <p className="text-sm text-gray-200 dark:text-dark-text-secondary">Bienvenido,</p>
              <p className="font-semibold">{user.Nombres} {user.Apellidos}</p>
              <p className="text-xs text-gray-200 dark:text-dark-text-secondary">
                {user.Seccion ? `${user.Seccion}` : 'Sin sección asignada'}
                {user.Especialidad && ` - ${user.Especialidad}`}
              </p>
              <p className="text-xs text-gray-200 dark:text-dark-text-secondary">CIP: {user.CIP}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white dark:bg-dark-surface text-[#1a4d2e] dark:text-dark-pnp-green px-4 py-2 rounded-lg shadow hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors duration-200"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            {/* Información del Perito */}
            <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg dark:shadow-gray-900/20 p-6 mb-6 border border-gray-200 dark:border-dark-border">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-text-primary mb-4">Mi Información</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-dark-text-secondary">CIP:</span>
                  <span className="font-medium text-gray-800 dark:text-dark-text-primary">{user.CIP}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-dark-text-secondary">Nombres:</span>
                  <span className="font-medium text-gray-800 dark:text-dark-text-primary">{user.Nombres}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-dark-text-secondary">Apellidos:</span>
                  <span className="font-medium text-gray-800 dark:text-dark-text-primary">{user.Apellidos}</span>
                </div>
                {user.Email && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-dark-text-secondary">Email:</span>
                    <span className="font-medium text-gray-800 dark:text-dark-text-primary">{user.Email}</span>
                  </div>
                )}
                {user.Seccion && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-dark-text-secondary">Sección:</span>
                    <span className="font-medium text-gray-800 dark:text-dark-text-primary">{user.Seccion}</span>
                  </div>
                )}
                {user.Especialidad && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-dark-text-secondary">Especialidad:</span>
                    <span className="font-medium text-gray-800 dark:text-dark-text-primary">{user.Especialidad}</span>
                  </div>
                )}
                {user.Grado && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-dark-text-secondary">Grado:</span>
                    <span className="font-medium text-gray-800 dark:text-dark-text-primary">{user.Grado}</span>
                  </div>
                )}
              </div>
              
              {/* Estado de Sesión */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-border">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-dark-text-muted">Estado:</span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-dark-pnp-green-dark/20 text-green-800 dark:text-dark-pnp-green rounded-full">
                    Activo
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-gray-500 dark:text-dark-text-muted">Rol:</span>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-dark-accent/20 text-blue-800 dark:text-dark-accent rounded-full">
                    Perito
                  </span>
                </div>
              </div>
            </div>

            <nav className="bg-white dark:bg-dark-surface rounded-xl shadow-lg dark:shadow-gray-900/20 p-6 border border-gray-200 dark:border-dark-border">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-text-primary mb-6">Navegación</h2>
              <div className="space-y-3">
                <button 
                  onClick={() => handleNavigation('')} 
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActiveRoute('/perito/dashboard') && !isActiveRoute('/documentos') && !isActiveRoute('/perfil') && !isActiveRoute('/casos')
                      ? 'bg-[#1a4d2e] to-[#2d7d4a] text-white shadow-md' 
                      : 'text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">📊</span>
                    <span>Resumen</span>
                  </div>
                </button>

                <button 
                  onClick={() => handleNavigation('/documentos')} 
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActiveRoute('/documentos') 
                      ? 'bg-[#1a4d2e] dark:bg-dark-pnp-green text-white shadow-md' 
                      : 'text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">📝</span>
                    <span>Documentos</span>
                  </div>
                </button>

                <button 
                  onClick={() => handleNavigation('/casos')} 
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActiveRoute('/casos') 
                      ? 'bg-[#1a4d2e] dark:bg-dark-pnp-green text-white shadow-md' 
                      : 'text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🔍</span>
                    <span>Mis Casos</span>
                  </div>
                </button>

                <button 
                  onClick={() => handleNavigation('/perfil')} 
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActiveRoute('/perfil') 
                      ? 'bg-[#1a4d2e] dark:bg-dark-pnp-green text-white shadow-md' 
                      : 'text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">👤</span>
                    <span>Mi Perfil</span>
                  </div>
                </button>
              </div>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeritoDashboard;
