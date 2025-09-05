import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { peritoService } from '../../services/peritoService';
import Usuarios from '../../assets/icons/Usuarios';
import Documentos from '../../assets/icons/Documentos';
import Configuracion from '../../assets/icons/Configuracion';

const DashboardStats = () => {
  const navigate = useNavigate();
  const { loading } = useAuth();
  const [stats, setStats] = useState({
    totalPeritos: 0,
    peritosPorSeccion: [],
    peritosPorGrado: []
  });
  const [error, setError] = useState('');


  useEffect(() => {
    const loadStats = async () => {
      try {
        setError('');
        const response = await peritoService.getPeritosStats();
        setStats(response.data);
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
        setError('Error cargando estadísticas: ' + error.message);
      }
    };

    loadStats();
  }, []);

  const handleNavigation = (path) => {
    navigate(`/admin/dashboard${path}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d2e] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
    
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-[#1a4d2e] mb-2">
          Panel de Administración
        </h1>
        <p className="text-gray-600 text-lg">
          Gestión del sistema Mesa de Partes PNP
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-xl">⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-[#1a4d2e] hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Peritos</p>
              <p className="text-2xl font-bold text-[#1a4d2e]">{stats.totalPeritos}</p>
            </div>
            <Usuarios size={8}/>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-[#2d7d4a] hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Secciones Activas</p>
              <p className="text-2xl font-bold text-[#2d7d4a]">{stats.peritosPorSeccion.length}</p>
            </div>
            <div className="text-3xl">a</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-[#FFD700] hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Grados</p>
              <p className="text-2xl font-bold text-[#FFD700]">{stats.peritosPorGrado.length}</p>
            </div>
            <div className="text-3xl">a</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-[#4a9c6b] hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">algo</p>
              <p className="text-2xl font-bold text-[#4a9c6b]">algo</p>
            </div>
            <div className="text-3xl">a</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-[#1a4d2e] mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => handleNavigation('/usuarios')}
            className="bg-[#1a4d2e] hover:bg-[#2d7d4a] text-white p-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Usuarios size={6}/>
            <span>Gestionar Usuarios</span>
          </button>
          <button 
            onClick={() => handleNavigation('/documentos')}
            className="bg-[#2d7d4a] hover:bg-[#4a9c6b] text-white p-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Documentos size={6}/>
            <span>Administrar Documentos</span>
          </button>
          <button 
            onClick={() => handleNavigation('/configuracion')}
            className="bg-[#FFD700] hover:bg-[#e6c547] text-[#1a4d2e] p-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Configuracion size={6}/>
            <span>Configuración</span>
          </button>
        </div>
      </div>

      {/* Statistics Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peritos por Sección */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-[#1a4d2e] mb-4">Peritos por Sección</h2>
          {stats.peritosPorSeccion.length > 0 ? (
            <div className="space-y-3">
              {stats.peritosPorSeccion.map((seccion, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">{seccion.Seccion}</span>
                  <span className="text-lg font-bold text-[#1a4d2e]">{seccion.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No hay datos de secciones disponibles</p>
          )}
        </div>

        {/* Peritos por Grado */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-[#1a4d2e] mb-4">Peritos por Grado</h2>
          {stats.peritosPorGrado.length > 0 ? (
            <div className="space-y-3">
              {stats.peritosPorGrado.map((grado, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">{grado.Grado}</span>
                  <span className="text-lg font-bold text-[#1a4d2e]">{grado.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No hay datos de grados disponibles</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-[#1a4d2e] mb-4">Actividad Reciente</h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="text-[#1a4d2e]">📊</div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">
                {stats.totalPeritos > 0 
                  ? `Sistema funcionando con ${stats.totalPeritos} peritos registrados`
                  : 'No hay peritos registrados en el sistema'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
