import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { PeritoService } from "../../services/peritoService";
import Usuarios from "../../assets/icons/Usuarios";
import Documentos from "../../assets/icons/Documentos";
import Configuracion from "../../assets/icons/Configuracion";
import Error from "../../assets/icons/Error";

const DashboardStats = () => {
  const navigate = useNavigate();
  const { loading } = useAuth();
  const [stats, setStats] = useState({
    totalPeritos: 0,
    peritosPorSeccion: [],
    peritosPorGrado: [],
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      try {
        setError("");
        const response = await PeritoService.getPeritosStats();
        setStats(response.data);
      } catch (err) {
        console.error("Error cargando estadísticas:", err);
        setError("Error cargando estadísticas: " + err.message);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            Cargando dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gray-50 dark:bg-gray-900 p-4 min-h-screen transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-300">
        <h1 className="text-3xl font-bold text-green-800 dark:text-green-400 mb-4">
          Panel de Administración
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Gestión del sistema Mesa de Partes OFICRI
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-300 px-4 py-3 rounded-lg transition-colors duration-300">
          <div className="flex items-center space-x-2">
            <Error size={6} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-green-800 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Total Peritos
              </p>
              <p className="text-2xl font-bold text-green-800 dark:text-green-400">
                {stats.totalPeritos}
              </p>
            </div>
            <Usuarios size={8} className="text-green-800 dark:text-green-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-green-600 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Secciones Activas
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-300">
                {stats.peritosPorSeccion.length}
              </p>
            </div>
            <div className="text-3xl text-green-600 dark:text-green-300">a</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-yellow-400 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Grados</p>
              <p className="text-2xl font-bold text-yellow-400 dark:text-yellow-300">
                {stats.peritosPorGrado.length}
              </p>
            </div>
            <div className="text-3xl text-yellow-400 dark:text-yellow-300">
              a
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">algo</p>
              <p className="text-2xl font-bold text-green-500 dark:text-green-300">
                algo
              </p>
            </div>
            <div className="text-3xl text-green-500 dark:text-green-300">a</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-300">
        <h2 className="text-xl font-semibold text-green-800 dark:text-green-400 mb-4">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleNavigation("/usuarios")}
            className="bg-green-800 hover:bg-green-700 text-white p-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Usuarios size={6} className="text-white" />
            <span>Gestionar Usuarios</span>
          </button>
          <button
            onClick={() => handleNavigation("/documentos")}
            className="bg-green-600 hover:bg-green-500 text-white p-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Documentos size={6} className="text-white" />
            <span>Administrar Documentos</span>
          </button>
          <button
            onClick={() => handleNavigation("/configuracion")}
            className="bg-yellow-400 hover:bg-yellow-300 text-green-800 p-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Configuracion size={6} className="text-green-800" />
            <span>Configuración</span>
          </button>
        </div>
      </div>

      {/* Statistics Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peritos por Sección */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-300">
          <h2 className="text-xl font-semibold text-green-800 dark:text-green-400 mb-4">
            Peritos por Sección
          </h2>
          {stats.peritosPorSeccion.length > 0 ? (
            <div className="space-y-3">
              {stats.peritosPorSeccion.map((seccion, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-300"
                >
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {seccion.Seccion}
                  </span>
                  <span className="text-lg font-bold text-green-800 dark:text-green-400">
                    {seccion.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No hay datos de secciones disponibles
            </p>
          )}
        </div>

        {/* Peritos por Grado */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-300">
          <h2 className="text-xl font-semibold text-green-800 dark:text-green-400 mb-4">
            Peritos por Grado
          </h2>
          {stats.peritosPorGrado.length > 0 ? (
            <div className="space-y-3">
              {stats.peritosPorGrado.map((grado, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-300"
                >
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {grado.Grado}
                  </span>
                  <span className="text-lg font-bold text-green-800 dark:text-green-400">
                    {grado.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No hay datos de grados disponibles
            </p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-300">
        <h2 className="text-xl font-semibold text-green-800 dark:text-green-400 mb-4">
          Actividad Reciente
        </h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-300">
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {stats.totalPeritos > 0
                  ? `Sistema funcionando con ${stats.totalPeritos} peritos registrados`
                  : "No hay peritos registrados en el sistema"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
