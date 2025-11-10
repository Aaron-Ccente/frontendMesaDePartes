import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import ThemeToggle from "../ui/ThemeToggle";
import Estadistica from "../../assets/icons/Estadistica";
import Usuarios from "../../assets/icons/Usuarios";
import Documentos from "../../assets/icons/Documentos";
import Configuracion from "../../assets/icons/Configuracion";
import Politics from "../ui/Politics";
import { useEffect, useState } from "react";
import FlechaAbajo from "../../assets/icons/FlechaAbajo";
import { authService } from "../../services/authService";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, logout, isAuthenticated } = useAuth();
  const [config, setConfig] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/admin/login");
    }
  }, [loading, isAuthenticated, navigate]);

  const viewModal = () => {
    setConfig(!config);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d2e] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-dark-text-primary">
            Cargando...
          </p>
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

const logOutAdminHandler = () => authService.logOutAdmin();

const handleLogout = async () => {
  try {
    await logOutAdminHandler();
    localStorage.removeItem("adminData");
    localStorage.removeItem("adminToken");
    logout();
    navigate("/admin/login", { replace: true });
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg-primary transition-colors duration-300 flex flex-col">
      {/* Policias de uso del sistema */}
      <Politics nombre_usuario={user.nombre_completo}/>

      {/* Header */}
      <header className="bg-gradient-to-r from-[#1a4d2e] to-[#1a4d2e] text-white shadow-lg dark:shadow-gray-900/50 sticky top-0 z-30">
        <div className="max-w-full mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold flex justify-center items-center gap-4">
            <img
              width={64}
              height={64}
              alt="Escudo de OFICRI"
              src="/fondo_oficri.webp"
            />
            Panel de Administración
          </h1>
          <div className="flex items-center space-x-4">
            {/* Botón de cambio de tema */}
            <ThemeToggle size="md" />

            <div className="text-right">
              <p className="text-sm text-gray-200">Bienvenido,</p>
              <p className="font-semibold">
                {user?.nombre_completo || "Administrador"}
              </p>
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
        <div className="md:fixed md:left-0 md:top-[76px] md:w-80 md:h-[calc(100vh-76px)] md:overflow-y-auto md:z-20 w-full bg-white dark:bg-dark-surface shadow-lg dark:shadow-gray-900/20 border-r border-gray-200 dark:border-dark-border">
          <nav className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-text-primary mb-6">
              Navegación
            </h2>
            <div className="space-y-3">
              {/* Estadísticas */}
              <button
                onClick={() => handleNavigation("")}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActiveRoute("/admin/dashboard") &&
                  !isActiveRoute("/usuarios") &&
                  !isActiveRoute("/documentos") &&
                  !isActiveRoute("/configuracion") &&
                  !isActiveRoute("/administradores") &&
                  !isActiveRoute("/mesadepartes")
                    ? "bg-[#1a4d2e] text-white shadow-md"
                    : "text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span>
                    <Estadistica />
                  </span>
                  <span>Estadísticas</span>
                </div>
              </button>

              {/* Peritos */}
              <button
                onClick={() => handleNavigation("/usuarios")}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActiveRoute("/usuarios")
                    ? "bg-[#1a4d2e] text-white shadow-md"
                    : "text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span>
                    <Usuarios />
                  </span>
                  <span>Peritos</span>
                </div>
              </button>

              {/* Administradores */}
              <button
                onClick={() => handleNavigation("/administradores")}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActiveRoute("/administradores")
                    ? "bg-[#1a4d2e] text-white shadow-md"
                    : "text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span>
                    <Usuarios />
                  </span>
                  <span>Administradores</span>
                </div>
              </button>

              {/* Mesa de Partes */}
              <button
                onClick={() => handleNavigation("/mesadepartes")}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActiveRoute("/mesadepartes")
                    ? "bg-[#1a4d2e] text-white shadow-md"
                    : "text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span>
                    <Usuarios />
                  </span>
                  <span>Mesa de Partes</span>
                </div>
              </button>

              {/* Documentos */}
              <button
                onClick={() => handleNavigation("/documentos")}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActiveRoute("/documentos")
                    ? "bg-[#1a4d2e] text-white shadow-md"
                    : "text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary"
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
              <div className="relative">
                <button
                  onClick={() => {
                    handleNavigation("/configuracion");
                    viewModal();
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActiveRoute("/configuracion")
                      ? "bg-[#1a4d2e] text-white shadow-md"
                      : "text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Configuracion size={6} />
                      <span>Configuración</span>
                    </div>
                    <FlechaAbajo size={6} rotate={config} />
                  </div>
                </button>

                {config && (
                  <div className="ml-6 mt-2 space-y-2 border-l-2 border-gray-200 dark:border-dark-border pl-4">
                    <button
                      onClick={() =>
                        handleNavigation("/configuracion/especialidades")
                      }
                      className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-200 ${
                        isActiveRoute("/configuracion/especialidades")
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                          : "text-gray-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary"
                      }`}
                    >
                      Especialidades
                    </button>
                    <button
                      onClick={() =>
                        handleNavigation("/configuracion/tipos-examen")
                      }
                      className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-200 ${
                        isActiveRoute("/configuracion/tipos-examen")
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                          : "text-gray-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary"
                      }`}
                    >
                      Tipos de examen
                    </button>
                    <button
                      onClick={() => handleNavigation("/configuracion/grados")}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-200 ${
                        isActiveRoute("/configuracion/grados")
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                          : "text-gray-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary"
                      }`}
                    >
                      Grados
                    </button>
                    <button
                      onClick={() => handleNavigation("/configuracion/turnos")}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-200 ${
                        isActiveRoute("/configuracion/turnos")
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                          : "text-gray-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary"
                      }`}
                    >
                      Turnos
                    </button>
                    <button
                      onClick={() =>
                        handleNavigation("/configuracion/prioridades")
                      }
                      className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-200 ${
                        isActiveRoute("/configuracion/prioridades")
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                          : "text-gray-600 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary"
                      }`}
                    >
                      Prioridades
                    </button>
                  </div>
                )}
              </div>
            </div>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto md:ml-80">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
