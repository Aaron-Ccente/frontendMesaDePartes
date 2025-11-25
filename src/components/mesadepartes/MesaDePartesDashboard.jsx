import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from '../ui/ThemeToggle';
import CreateOfficeIcon from '../../assets/icons/CreateOfficeIcon';
import ReceiveOfficeIcon from '../../assets/icons/ReceiveOfficeIcon';
import Estadistica from '../../assets/icons/Estadistica';
import { BoxIcon } from '../../assets/icons/Actions'; // Asumiendo que existe un ícono adecuado
import Politics from '../ui/Politics';
import MesaDePartes from '../../services/mesadepartesService';

const MesaDePartesDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loginMesaDePartes } = useAuth();

  const handleNavigation = (path) => {
    navigate(`/mesadepartes/dashboard${path}`);
  };

  const isActiveRoute = (path) => {
    // Para la ruta raíz del dashboard, necesitamos una coincidencia exacta
    if (path === '') {
      return location.pathname === '/mesadepartes/dashboard' || location.pathname === '/mesadepartes/dashboard/';
    }
    return location.pathname.includes(path);
  };

  const handleLogout = () => MesaDePartes.logOutMesaDePartes();

  const handleLogoutMesaDePartes = async () => {
    try {
      await handleLogout();
      localStorage.removeItem("formDataCodigodeBarras");
      loginMesaDePartes();
      navigate('/mesadepartes/login');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

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
      {/* Policias de uso del sistema */}
      <Politics nombre_usuario={user.nombre_completo}/>

      {/* Header */}
      <header className="bg-gradient-to-r from-[#1a4d2e] to-[#1a4d2e] text-white shadow-lg dark:shadow-gray-900/50 sticky top-0 z-30">
        <div className="max-w-full mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className='flex justify-center items-center gap-4'>
              <img width={64} height={64} alt='Escudo de OFICRI' src='/fondo_oficri.webp'/>
              <div>
                <h1 className="text-2xl font-bold">Mesa de Partes OFICRI</h1>
                <p className="text-sm text-gray-200 dark:text-dark-text-secondary">Panel de Mesa De Partes</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Botón de cambio de tema */}
            <ThemeToggle size="md" />
            
            <div className="text-right">
              <p className="text-sm text-gray-200 dark:text-dark-text-secondary">Bienvenido,</p>
              <p className="font-semibold">{user.nombre_completo}</p>
              <p className="text-xs text-gray-200 dark:text-dark-text-secondary">CIP: {user.CIP}</p>
            </div>
            <button
              onClick={handleLogoutMesaDePartes}
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
        <div className="md:fixed md:left-0 md:top-[96px] md:w-80 md:h-[calc(100vh-76px)] md:overflow-y-auto md:z-20 w-full bg-white dark:bg-dark-surface shadow-lg dark:shadow-gray-900/20 border-r border-gray-200 dark:border-dark-border">
            
          {/* Información del Perito */}
          <div className="p-6 border-b border-gray-200 dark:border-dark-border">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-text-primary mb-4">Mi Información</h2>
            {/* ... (user info remains the same) ... */}
          </div>

          {/* Navegación */}
          <nav className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-text-primary mb-6">Navegación</h2>
            <div className="space-y-3">
              <button 
                onClick={() => handleNavigation('')} 
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActiveRoute('') 
                    ? 'bg-[#1a4d2e] to-[#2d7d4a] text-white shadow-md' 
                    : 'text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Estadistica />
                  <span>Panel Principal</span>
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
                  <CreateOfficeIcon/>
                  <span>Crear oficios</span>
                </div>
              </button>

              <button 
                onClick={() => handleNavigation('/seguimiento/casos')} 
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActiveRoute('/seguimiento/casos') 
                    ? 'bg-[#1a4d2e] dark:bg-dark-pnp-green text-white shadow-md' 
                    : 'text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <ReceiveOfficeIcon/>
                  <span>Seguimiento de Casos</span>
                </div>
              </button>

              <button 
                onClick={() => handleNavigation('/casos-para-recojo')} 
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActiveRoute('/casos-para-recojo') 
                    ? 'bg-[#1a4d2e] dark:bg-dark-pnp-green text-white shadow-md' 
                    : 'text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <BoxIcon />
                  <span>Casos para Recojo</span>
                </div>
              </button>
            </div>
          </nav>
        </div>

        {/* Content Area - Takes remaining space */}
        <div className="flex-1 p-6 overflow-auto md:ml-80">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MesaDePartesDashboard;