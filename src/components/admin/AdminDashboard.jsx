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
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg-primary transition-colors duration-300">
      <Politics/>
      <header className="bg-gradient-to-r from-[#1a4d2e] to-[#2d7d4a] dark:from-dark-pnp-green-dark dark:to-dark-pnp-green text-white shadow-lg dark:shadow-gray-900/50">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Panel de Administración</h1>
          <div className="flex items-center space-x-4">
            {/* Botón de cambio de tema */}
            <ThemeToggle size="md" />
            
            <div className="text-right">
              <p className="text-sm text-gray-200 dark:text-dark-text-secondary">Bienvenido,</p>
              <p className="font-semibold">{user?.Nombre || 'Administrador'}</p>
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
            <nav className="bg-white dark:bg-dark-surface rounded-xl shadow-lg dark:shadow-gray-900/20 p-6 border border-gray-200 dark:border-dark-border">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-text-primary mb-6">Navegación</h2>
              <div className="space-y-3">
                <button onClick={() => handleNavigation('')} className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${isActiveRoute('/admin/dashboard') && !isActiveRoute('/usuarios') && !isActiveRoute('/documentos') && !isActiveRoute('/configuracion') ? 'bg-[#1a4d2e] dark:bg-dark-pnp-green text-white shadow-md' : 'text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary'}`}>
                  <div className="flex items-center space-x-3"><span><Estadistica/></span><span>Estadísticas</span></div>
                </button>
                <button onClick={() => handleNavigation('/usuarios')} className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${isActiveRoute('/usuarios') ? 'bg-[#1a4d2e] dark:bg-dark-pnp-green text-white shadow-md' : 'text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary'}`}>
                  <div className="flex items-center space-x-3"><span><Usuarios/></span><span>Usuarios</span></div>
                </button>
                <button onClick={() => handleNavigation('/documentos')} className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${isActiveRoute('/documentos') ? 'bg-[#1a4d2e] dark:bg-dark-pnp-green text-white shadow-md' : 'text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary'}`}>
                  <div className="flex items-center space-x-3"><span><Documentos size={6}/></span><span>Documentos</span></div>
                </button>
                <button onClick={() => handleNavigation('/configuracion')} className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${isActiveRoute('/configuracion') ? 'bg-[#1a4d2e] dark:bg-dark-pnp-green text-white shadow-md' : 'text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary'}`}>
                  <div className="flex items-center space-x-3"><span><Configuracion size={6}/></span><span>Configuración</span></div>
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

export default AdminDashboard;
