import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from '../ui/ThemeToggle';

const MesaDePartesDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loginMesaDePartes } = useAuth();

  const handleNavigation = (path) => {
    navigate(`/mesadepartes/dashboard${path}`);
  };

  const isActiveRoute = (path) => {
    return location.pathname.includes(path);
  };

  const handleLogout = () => {
    loginMesaDePartes();
    navigate('/mesadepartes/login');
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
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg-primary transition-colors duration-300 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#1a4d2e] to-[#1a4d2e] text-white shadow-lg dark:shadow-gray-900/50 sticky top-0 z-10">
        <div className="max-w-full mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold">Mesa de Partes OFICRI</h1>
              <p className="text-sm text-gray-200 dark:text-dark-text-secondary">Panel de Perito</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Botón de cambio de tema */}
            <ThemeToggle size="md" />
            
            <div className="text-right">
              <p className="text-sm text-gray-200 dark:text-dark-text-secondary">Bienvenido,</p>
              <p className="font-semibold">{user.nombre_completo}</p>
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

      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Sidebar Navigation - Fixed to left */}
        <div className="w-80 bg-white dark:bg-dark-surface shadow-lg dark:shadow-gray-900/20 border-r border-gray-200 dark:border-dark-border sticky top-[76px] h-[calc(100vh-76px)] overflow-y-auto">
          
          {/* Información del Perito */}
          <div className="p-6 border-b border-gray-200 dark:border-dark-border">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-text-primary mb-4">Mi Información</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-dark-text-secondary">CIP:</span>
                <span className="font-medium text-gray-800 dark:text-dark-text-primary">{user.CIP}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-dark-text-secondary">Nombres:</span>
                <span className="font-medium text-gray-800 dark:text-dark-text-primary">{user.nombre_completo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-dark-text-secondary">Apellidos:</span>
                <span className="font-medium text-gray-800 dark:text-dark-text-primary">{user.nombre_usuario}</span>
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
                  {user.nombre_rol ==='CENTRAL'? 'MESA DE PARTES' : user.nombre_rol}
                </span>
              </div>
            </div>
          </div>

          {/* Navegación */}
          <nav className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-text-primary mb-6">Navegación</h2>
            <div className="space-y-3">
              <button 
                onClick={() => handleNavigation('')} 
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActiveRoute('/mesadepartes/dashboard') && !isActiveRoute('/crear/oficio') && !isActiveRoute('/respuestas/oficio')
                    ? 'bg-[#1a4d2e] to-[#2d7d4a] text-white shadow-md' 
                    : 'text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary'
                }`}
              >
                <div className="flex items-center space-x-3">
                  
                  <span>Resumen</span>
                </div>
              </button>

              <button 
                onClick={() => handleNavigation('/crear/oficio')} 
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActiveRoute('/crear/oficio') 
                    ? 'bg-[#1a4d2e] dark:bg-dark-pnp-green text-white shadow-md' 
                    : 'text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary'
                }`}
              >
                <div className="flex items-center space-x-3">
                  
                  <span>Crear oficios</span>
                </div>
              </button>

              <button 
                onClick={() => handleNavigation('/respuestas/oficio')} 
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActiveRoute('/respuestas/oficio') 
                    ? 'bg-[#1a4d2e] dark:bg-dark-pnp-green text-white shadow-md' 
                    : 'text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary'
                }`}
              >
                <div className="flex items-center space-x-3">
                 
                  <span>Respuestas de Oficio</span>
                </div>
              </button>
            </div>
          </nav>
        </div>

        {/* Content Area - Takes remaining space */}
        <div className="flex-1 p-6 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MesaDePartesDashboard;