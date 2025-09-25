import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = ({ 
  children, 
  requireAdmin = false, 
  requirePerito = false, 
  requireUserMesaDePartes = false 
}) => {
  const { loading, isAuthenticated, isAdmin, isPerito, isMesaDePartes, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1a4d2e]" />
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar permisos específicos según el rol requerido
  if (requireAdmin && !isAdmin()) {
    // Redirigir según el rol actual del usuario
    if (isPerito()) return <Navigate to="/perito/dashboard" replace />;
    if (isMesaDePartes()) return <Navigate to="/mesadepartes/dashboard" replace />;
    return <Navigate to="/unauthorized" replace />;
  }

  if (requirePerito && !isPerito()) {
    if (isAdmin()) return <Navigate to="/admin/dashboard" replace />;
    if (isMesaDePartes()) return <Navigate to="/mesadepartes/dashboard" replace />;
    return <Navigate to="/unauthorized" replace />;
  }

  if (requireUserMesaDePartes && !isMesaDePartes()) {
    if (isAdmin()) return <Navigate to="/admin/dashboard" replace />;
    if (isPerito()) return <Navigate to="/perito/dashboard" replace />;
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
