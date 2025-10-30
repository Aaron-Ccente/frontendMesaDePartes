import { useState, useEffect } from "react";
import { OficioAssignedPeritoService } from "../../services/oficioAssignedPerito";
import ShowToast from "../ui/ShowToast";

const PeritoCasos = () => {
  const [casos, setCasos] = useState([]);
  const [filteredCasos, setFilteredCasos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responding, setResponding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    loadCasos();
  }, []);

  useEffect(() => {

    if (searchTerm.trim() === "") {
      setFilteredCasos(casos);
    } else {
      const filtered = casos.filter((caso) =>
        caso.numero_oficio.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCasos(filtered);
    }
  }, [searchTerm, casos]);

  const loadCasos = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await OficioAssignedPeritoService.getAssignedOficios();
      setCasos(result.data || []);
    } catch (err) {
      setError(err.message || "Error al cargar casos");
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (id_oficio, estado_actual) => {
    try {
      setResponding(true);
      setError(null);

      // Determinar estado
      let nuevo_estado = "OFICIO VISTO";
      if (estado_actual === "CREACION DEL OFICIO") {
        nuevo_estado = "OFICIO VISTO";
      } else if (estado_actual === "OFICIO VISTO") {
        nuevo_estado = "OFICIO EN PROCESO";
      } else if (estado_actual === "OFICIO EN PROCESO") {
        nuevo_estado = "COMPLETADO";
      }

      await OficioAssignedPeritoService.respondToOficio(
        id_oficio,
        nuevo_estado,
        estado_actual
      );

      await loadCasos();
      setError({ type: "success", message: "Estado actualizado exitosamente" });
    } catch (err) {
      setError(err.message || "Error al responder");
    } finally {
      setResponding(false);
    }
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case "CREACION DEL OFICIO":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "OFICIO VISTO":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "OFICIO EN PROCESO":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "COMPLETADO":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getNextActionLabel = (estado_actual) => {
    switch (estado_actual) {
      case "CREACION DEL OFICIO":
        return "Marcar como visto";
      case "OFICIO VISTO":
        return "Iniciar proceso";
      case "OFICIO EN PROCESO":
        return "Marcar completado";
      case "COMPLETADO":
        return "Completado";
      default:
        return "Actualizar estado";
    }
  };

  const openScanner = () => {
    setShowScanner(true);
    setScanning(true);
    setSearchTerm("");
  };

  const closeScanner = () => {
    setShowScanner(false);
    setScanning(false);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setFilteredCasos(casos);
  };

  // escaneo del código de barras
  useEffect(() => {
    const handleKeyPress = () => {
      if (showScanner && scanning) {
        setTimeout(() => {
          setShowScanner(false);
          setScanning(false);
        }, 100);
      }
    };

    if (showScanner && scanning) {
      document.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [showScanner, scanning]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1a4d2e] dark:text-green-400 mb-2">
            Mis Casos
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Revisa y gestiona los casos asignados a ti
          </p>
        </div>
        <div className="flex items-center justify-end space-x-4">
          {/* Botón de escanear código de barras */}
          <button
            onClick={openScanner}
            className="flex items-center px-4 py-3 bg-[#1a4d2e] text-white rounded-lg hover:bg-[#2d7d4a] transition-colors cursor-pointer"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
              />
            </svg>
            Escanear Código
          </button>

          {/* Input oculto para capturar el código de barras */}
          {showScanner && (
            <input
              type="text"
              autoFocus
              className="absolute opacity-0 h-0 w-0"
              onBlur={closeScanner}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                closeScanner();
              }}
            />
          )}
        </div>
      </div>

      {/* Modal de escaneo */}
      {showScanner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 min-h-screen">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-auto text-center">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Escanear Código de Barras
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Coloque el código de barras frente al lector
              </p>
            </div>

            <div className="animate-pulse mb-6">
              <div className="w-32 h-2 bg-green-400 dark:bg-green-500 rounded-full mx-auto mb-2"></div>
              <div className="w-24 h-2 bg-green-400 dark:bg-green-500 rounded-full mx-auto"></div>
            </div>

            <button
              onClick={closeScanner}
              className="px-6 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Feedback */}
      {error && (
        <ShowToast
          type={error.type || "error"}
          message={error.message}
          onClose={() => setError(null)}
        />
      )}

      {/* Search Results Info */}
      {searchTerm && (
        <div className="bg-green-100 dark:bg-green-900/20 border border-blue-200 dark:border-green-800 rounded-lg p-4 flex justify-between items-center">
          <p className="text-black dark:text-white text-sm">
            {filteredCasos.length === 0
              ? "No se encontraron oficios."
              : `Mostrando oficio(s) encontrados`}
          </p>
          <button
            onClick={clearSearch}
            className="bg-green-900 px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium text-white cursor-pointer"
          >
            Limpiar búsqueda
          </button>
        </div>
      )}

      {/* Cases List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d2e]"></div>
          </div>
        ) : filteredCasos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm
                ? "No se encontraron oficios que coincidan con tu búsqueda."
                : "No tienes casos asignados actualmente."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredCasos.map((caso) => (
              <div
                key={caso.id_oficio}
                className="border dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                      Oficio N° {caso.numero_oficio}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(caso.fecha_creacion).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(
                      caso.ultimo_estado
                    )}`}
                  >
                    {caso.ultimo_estado}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Unidad Solicitante
                    </p>
                    <p className="font-medium dark:text-gray-200">
                      {caso.unidad_solicitante}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Especialidad
                    </p>
                    <p className="font-medium dark:text-gray-200">
                      {caso.especialidad}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Tipo de Examen
                    </p>
                    <p className="font-medium dark:text-gray-200">
                      {caso.tipo_examen}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Prioridad
                    </p>
                    <p className="font-medium dark:text-gray-200">
                      {caso.nombre_prioridad}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() =>
                      handleRespond(caso.id_oficio, caso.ultimo_estado)
                    }
                    disabled={responding || caso.ultimo_estado === "COMPLETADO"}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${
                        caso.ultimo_estado === "COMPLETADO"
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-[#1a4d2e] text-white hover:bg-[#2d7d4a]"
                      }`}
                  >
                    {responding
                      ? "Actualizando..."
                      : getNextActionLabel(caso.ultimo_estado)}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PeritoCasos;