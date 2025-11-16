import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from '../ui/ThemeToggle';
import Notification from './Notificaciones/Notificaciones';
import Politics from '../ui/Politics';
import { PeritoService } from '../../services/peritoService';
import { useState } from 'react';

// Import all icons
import Estadistica from '../../assets/icons/Estadistica';
import Documentos from '../../assets/icons/Documentos';
import UserActiveIcon from '../../assets/icons/UserActiveIcon';
import BoxIcon from '../../assets/icons/BoxIcon';
import SampleIcon from '../../assets/icons/SampleIcon';
import FlechaAbajo from '../../assets/icons/FlechaAbajo';

const PeritoDashboard = () => {
  const { user, logoutPerito } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCasosMenuOpen, setCasosMenuOpen] = useState(false);

  const casosRoutes = {
    'TOMA DE MUESTRA': [
      { path: '/mis-casos/extraccion', label: 'Extracción de Muestra', icon: <SampleIcon className="w-5 h-5" /> },
      { path: '/mis-casos/analisis-tm', label: 'Análisis de Muestra', icon: <BoxIcon className="w-5 h-5" /> },
      { path: '/mis-casos/extraccion-y-analisis', label: 'Extracción y Análisis', icon: <div className="flex items-center"><SampleIcon className="w-5 h-5" /><span className="mx-1">+</span><BoxIcon className="w-5 h-5" /></div> },
    ],
    LABORATORIO: [
      { path: '/mis-casos/analisis-lab', label: 'Análisis Pendiente', icon: <BoxIcon className="w-5 h-5" /> },
      { path: '/mis-casos/consolidacion', label: 'Consolidación', icon: <Documentos size={5} /> },
    ],
    INSTRUMENTALIZACION: [
      { path: '/mis-casos/analisis-inst', label: 'Análisis Pendiente', icon: <BoxIcon className="w-5 h-5" /> },
    ],
  };

  // Normaliza un string: quita acentos, espacios y convierte a mayúsculas.
  const normalizeString = (str) => {
    if (!str) return '';
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toUpperCase();
  };

  const seccionKey = normalizeString(user?.seccion_nombre);
  const peritoCasosRoutes = casosRoutes[seccionKey] || [];

  const handleLogout = async () => {
    try {
      await PeritoService.logOutPerito();
      logoutPerito();
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

  const handleNavigation = (path) => {
    navigate(`/perito/dashboard${path}`);
  };

  const isActiveRoute = (path) => {
    return location.pathname.includes(path);
  };

  const toggleCasosMenu = () => {
    setCasosMenuOpen(!isCasosMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg-primary transition-colors duration-300 flex flex-col">
      <Politics nombre_usuario={user.nombre_completo}/>
      
      <header className="bg-gradient-to-r from-[#1a4d2e] to-[#1a4d2e] text-white shadow-lg dark:shadow-gray-900/50 sticky top-0 z-40">
        <div className="max-w-full w-full mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className='flex justify-center items-center gap-4'>
              <img width={64} height={64} alt='Escudo de OFICRI' src='/fondo_oficri.webp'/>
              <div>
                <h1 className="text-2xl font-bold">Mesa de Partes OFICRI</h1>
                <p className="text-sm text-gray-200 dark:text-dark-text-secondary">Panel de Perito</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Notification/>
            <ThemeToggle size="md" />
            <div className="text-right">
              <p className="font-semibold">{user.nombre_completo}</p>
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

      <div className="flex flex-1">
        <aside className="md:fixed md:left-0 md:top-[100px] md:w-80 md:h-[calc(100vh-100px)] md:overflow-y-auto z-30 w-full bg-white dark:bg-dark-surface shadow-lg dark:shadow-gray-900/20 border-r border-gray-200 dark:border-dark-border no-scrollbar">
          <div className="p-6 border-b border-gray-200 dark:border-dark-border">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-text-primary mb-4">Mi Información</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-dark-text-secondary">CIP:</span>
                <span className="font-medium text-gray-800 dark:text-dark-text-primary">{user.CIP}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-dark-text-secondary">Nombre:</span>
                <span className="font-medium text-gray-800 dark:text-dark-text-primary text-right">{user.nombre_completo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-dark-text-secondary">Referencia:</span>
                <span className="font-medium text-gray-800 dark:text-dark-text-primary">{user.nombre_usuario}</span>
              </div>
              {user.email && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-dark-text-secondary">Email:</span>
                  <span className="font-medium text-gray-800 dark:text-dark-text-primary">{user.email}</span>
                </div>
              )}
               {user.nombre_departamento && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-dark-text-secondary">Departamento:</span>
                  <span className="font-medium text-gray-800 dark:text-dark-text-primary">{user.nombre_departamento}</span>
                </div>
              )}
              {user.nombre_grado && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-dark-text-secondary">Grado:</span>
                  <span className="font-medium text-gray-800 dark:text-dark-text-primary">{user.nombre_grado}</span>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-border">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-dark-text-muted">Estado:</span>
                <span className="px-2 py-1 bg-green-100 dark:bg-dark-pnp-green-dark/20 text-green-800 dark:text-dark-pnp-green rounded-full">
                  Activo
                </span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-gray-500 dark:text-dark-text-muted">Sección:</span>
                <span className="px-2 py-1 bg-blue-100 dark:bg-dark-accent/20 text-blue-800 dark:text-dark-accent rounded-full">
                  {user.seccion_nombre}
                </span>
              </div>
            </div>
          </div>

          <nav className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-text-primary mb-6">Navegación</h2>
            <div className="space-y-3">
              <NavLink 
                to='/perito/dashboard'
                end
                className={({ isActive }) =>
                  `w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${
                    isActive ? 'bg-[#1a4d2e] text-white shadow-md' : 'text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary'
                  }`
                }
              >
                <span className="w-6 h-6 flex items-center justify-center"><Estadistica className="w-5 h-5" /></span>
                <span>Resumen</span>
              </NavLink>

              <div className="relative">
                <button
                  onClick={toggleCasosMenu}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between ${
                    isActiveRoute('/mis-casos') ? 'bg-[#1a4d2e] text-white shadow-md' : 'text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 flex items-center justify-center"><BoxIcon className="w-5 h-5" /></span>
                    <span>Mis Casos</span>
                  </div>
                  <FlechaAbajo size={4} rotate={isCasosMenuOpen} />
                </button>

                {isCasosMenuOpen && (
                  <div className="ml-4 mt-2 space-y-1 border-l-2 border-gray-200 dark:border-dark-border pl-3">
                    {peritoCasosRoutes.map(route => (
                      <button
                        key={route.path}
                        onClick={() => handleNavigation(route.path)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center space-x-3 text-sm ${
                          isActiveRoute(route.path) ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 font-semibold' : 'text-gray-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary'
                        }`}
                      >
                        <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center">{route.icon}</span>
                        <span className="truncate">{route.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <NavLink 
                to='/perito/dashboard/documentos'
                className={({ isActive }) =>
                  `w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${
                    isActive ? 'bg-[#1a4d2e] text-white shadow-md' : 'text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary'
                  }`
                }
              >
                <span className="w-6 h-6 flex items-center justify-center"><Documentos size={5} /></span>
                <span>Documentos</span>
              </NavLink>

              <NavLink 
                to='/perito/dashboard/perfil'
                className={({ isActive }) =>
                  `w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${
                    isActive ? 'bg-[#1a4d2e] text-white shadow-md' : 'text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary'
                  }`
                }
              >
                <span className="w-6 h-6 flex items-center justify-center"><UserActiveIcon className="w-5 h-5" /></span>
                <span>Mi Perfil</span>
              </NavLink>
            </div>
          </nav>
        </aside>

        <main className="flex-1 p-6 overflow-auto md:ml-80">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PeritoDashboard;