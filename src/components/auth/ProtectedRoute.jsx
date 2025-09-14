import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = ({ children, requireAdmin = false, requirePerito = false }) => {
  const { loading, isAuthenticated, isAdmin, isPerito } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg-primary flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d2e] dark:border-dark-pnp-green mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-dark-text-primary text-lg font-medium">Verificando autenticación...</p>
          <p className="text-gray-500 dark:text-dark-text-secondary text-sm mt-2">Por favor espera un momento</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    console.log('Usuario no autenticado, redirigiendo al login');
    
    // Si la ruta actual es del dashboard de peritos, redirigir al login de peritos
    if (location.pathname.startsWith('/perito')) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    // Si la ruta actual es del dashboard de administradores, redirigir al login de administradores
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    
    // Por defecto, redirigir al login de peritos
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si se requiere rol de administrador, verificar que el usuario sea administrador
  if (requireAdmin && !isAdmin()) {
    console.log('Usuario no tiene rol de administrador, redirigiendo al dashboard de peritos');
    return <Navigate to="/perito/dashboard" replace />;
  }

  // Si se requiere rol de perito, verificar que el usuario sea perito
  if (requirePerito && !isPerito()) {
    console.log('Usuario no tiene rol de perito, redirigiendo al dashboard de administradores');
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
};

export default ProtectedRoute;
