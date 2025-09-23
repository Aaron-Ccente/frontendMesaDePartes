import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from '../ui/ThemeToggle';
import Estadistica from '../../assets/icons/Estadistica';
import Usuarios from '../../assets/icons/Usuarios';
import Documentos from '../../assets/icons/Documentos';
import Configuracion from '../../assets/icons/Configuracion';
import Politics from '../ui/Politics';
import { useEffect } from 'react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d2e] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-dark-text-primary">Cargando...</p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated || !user) {
    return null;
  }

  const handleNavigation = (path) => {
    navigate(`/admin/dashboard${path}`);
  };

  const isActiveRoute = (path) => {
    return location.pathname.includes(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (

    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg-primary transition-colors duration-300 flex flex-col">
      <Politics/> 
      {/* Header */}
      <header className="bg-gradient-to-r from-[#1a4d2e] to-[#1a4d2e] text-white shadow-lg dark:shadow-gray-900/50 sticky top-0 z-10">
        <div className="max-w-full mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Panel de Administración</h1>
          <div className="flex items-center space-x-4">
            {/* Botón de cambio de tema */}
            <ThemeToggle size="md" />
            
            <div className="text-right">
              <p className="text-sm text-gray-200">Bienvenido,</p>
              <p className="font-semibold">{user?.nombre_completo || 'Administrador'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white text-[#1a4d2e] px-4 py-2 rounded-lg shadow hover:bg-gray-100 transition-colors duration-200"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>
      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white dark:bg-dark-surface shadow-lg dark:shadow-gray-900/20 border-r border-gray-200 dark:border-dark-border sticky top-[76px] h-[calc(100vh-76px)] overflow-y-auto">
          <nav className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-text-primary mb-6">
              Navegación
            </h2>
            <div className="space-y-3">
              {/* Estadísticas */}
              <button
                onClick={() => handleNavigation('')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActiveRoute('/admin/dashboard') && !isActiveRoute('/usuarios') && !isActiveRoute('/documentos') && !isActiveRoute('/configuracion')  && !isActiveRoute('/administradores') && !isActiveRoute('/mesadepartes')
                    ? 'bg-[#1a4d2e] dark:bg-dark-pnp-green text-white shadow-md' 
                    : 'text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span>
                    <Estadistica />
                  </span>
                  <span>Estadísticas</span>
                </div>
              </button>

              {/* Usuarios */}
              <button
                onClick={() => handleNavigation('/usuarios')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActiveRoute('/usuarios')
                    ? 'bg-[#1a4d2e] text-white shadow-md'
                    : 'text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span>
                    <Usuarios />
                  </span>
                  <span>Usuarios</span>
                </div>
              </button>

              {/* Administradores */}
              <button
                onClick={() => handleNavigation('/administradores')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActiveRoute('/administradores')
                    ? 'bg-[#1a4d2e] text-white shadow-md'
                    : 'text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span>
                    <Usuarios />
                  </span>
                  <span>Administradores</span>
                </div>
              </button>
              <button 
                onClick={() => handleNavigation('/mesadepartes')} 
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActiveRoute('/mesadepartes') 
                    ? 'bg-[#1a4d2e] dark:bg-dark-pnp-green text-white shadow-md' 
                    : 'text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span><Usuarios/></span>
                  <span>Mesa de Partes</span>
                </div>
              </button>

              <button 
                onClick={() => handleNavigation('/documentos')} 
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActiveRoute('/documentos')
                    ? 'bg-[#1a4d2e] text-white shadow-md'
                    : 'text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span>
                    <Documentos size={6} />
                  </span>
                  <span>Documentos</span>
                </div>
              </button>

              {/* Configuración */}
              <button
                onClick={() => handleNavigation('/configuracion')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActiveRoute('/configuracion')
                    ? 'bg-[#1a4d2e] text-white shadow-md'
                    : 'text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span>
                    <Configuracion size={6} />
                  </span>
                  <span>Configuración</span>
                </div>
              </button>
            </div>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
