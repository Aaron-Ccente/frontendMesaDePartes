import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { OficioAssignedPeritoService } from "../../services/oficioAssignedPerito";
import ShowToast from "../ui/ShowToast";
import DerivacionModal from "./DerivacionModal"; // Importar el nuevo modal
import { useAuth } from "../../hooks/useAuth"; // <-- IMPORTAR useAuth

const PeritoCasos = () => {
  const { user } = useAuth(); // <-- LLAMAR AL HOOK
  const [casos, setCasos] = useState([]);
  const [filteredCasos, setFilteredCasos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [searchTerm, setSearchTerm] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [scanning, setScanning] = useState(false);
  
  // State para el modal de derivación
  const [isDerivarModalOpen, setIsDerivarModalOpen] = useState(false);
  const [selectedCasoId, setSelectedCasoId] = useState(null);

  const navigate = useNavigate();

  const loadCasos = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadCasos();
  }, [loadCasos]);

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

  const handleViewDetails = (id_oficio) => {
    navigate(`/perito/dashboard/casos/${id_oficio}`);
  };

  const handleUpdateStatus = async (id_oficio, nuevo_estado) => {
    try {
      await OficioAssignedPeritoService.actualizarEstadoCaso(id_oficio, nuevo_estado);
      setToast({ show: true, message: `Caso actualizado a: ${nuevo_estado}`, type: 'success' });
      loadCasos(); // Recargar los casos para ver el estado actualizado
    } catch (err) {
      setToast({ show: true, message: err.message || 'Error al actualizar estado', type: 'error' });
    }
  };

  const handleOpenDerivarModal = (id_oficio) => {
    setSelectedCasoId(id_oficio);
    setIsDerivarModalOpen(true);
  };

  const handleCloseDerivarModal = () => {
    setIsDerivarModalOpen(false);
    setSelectedCasoId(null);
  };

  const handlePeritoDerivado = (perito) => {
    // Lógica para reasignar el perito (requiere un nuevo endpoint o usar el existente)
    console.log(`Derivar caso ${selectedCasoId} al perito ${perito.nombre_completo}`);
    // Aquí se llamaría al servicio de reasignación
    handleCloseDerivarModal();
    setToast({ show: true, message: `Caso derivado a ${perito.nombre_completo}`, type: 'success' });
    loadCasos();
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

  // ... (resto de funciones de scanner sin cambios)

  return (
    <div className="space-y-6">
      {/* ... (código del header y scanner sin cambios) ... */}
      <h1 className="text-3xl font-bold text-[#1a4d2e] dark:text-green-400 mb-2">
            Mis Casos
          </h1>

      {toast.show && <ShowToast type={toast.type} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        {loading ? (
          <div className="flex justify-center items-center h-40"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d2e]"></div></div>
        ) : filteredCasos.length === 0 ? (
          <div className="text-center py-12"><p className="text-gray-500 dark:text-gray-400">No tienes casos asignados actualmente.</p></div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCasos.map((caso) => (
              <CaseCard 
                key={caso.id_oficio} 
                caso={caso} 
                user={user}
                onUpdateStatus={handleUpdateStatus}
                onViewDetails={handleViewDetails}
                onDerivar={handleOpenDerivarModal}
              />
            ))}
          </div>
        )}
      </div>

      {isDerivarModalOpen && (
        <DerivacionModal
          casoId={selectedCasoId}
          onPeritoSelect={handlePeritoDerivado}
          onClose={handleCloseDerivarModal}
        />
      )}
    </div>
  );
};

// Sub-componente para la tarjeta de caso
const CaseCard = ({ caso, user, onUpdateStatus, onViewDetails, onDerivar }) => {
  
  // Lógica para determinar qué botones mostrar
  const renderActions = () => {
    // Guard Clause para evitar crash si el usuario no está cargado
    if (!user) {
      return (
        <button disabled className="w-full px-4 py-2 rounded-lg text-sm font-medium bg-gray-400 text-white">
          Cargando...
        </button>
      );
    }

    const { id_seccion } = user;
    const { id_oficio, tipos_de_examen } = caso;

    const SECCIONES = { TOMA_MUESTRA: 1, LABORATORIO: 2, INSTRUMENTALIZACION: 3 };
    
    // Botones base
    const commonButtons = (
      <button onClick={() => onViewDetails(id_oficio)} className="w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-600 text-white hover:bg-gray-700">
        Detalles
      </button>
    );

    switch (id_seccion) {
      case SECCIONES.TOMA_MUESTRA:
        // Si el perito es de Toma de Muestra
        if (tipos_de_examen?.includes('SARRO UNGUEAL')) {
          return (
            <div className="flex space-x-2">
              {commonButtons}
              <button onClick={() => onDerivar(id_oficio)} className="w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-pnp-green text-white hover:bg-pnp-green-light">
                Registrar y Derivar
              </button>
            </div>
          );
        } else {
          return (
            <div className="flex space-x-2">
              {commonButtons}
              <button onClick={() => onDerivar(id_oficio)} className="w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-pnp-green text-white hover:bg-pnp-green-light">
                Confirmar y Derivar
              </button>
            </div>
          );
        }

      case SECCIONES.INSTRUMENTALIZACION:
        // Si el perito es de Instrumentalización
        return (
          <div className="flex flex-col space-y-2">
            <button onClick={() => onUpdateStatus(id_oficio, 'OFICIO EN PROCESO')} className="w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-purple-500 text-white hover:bg-purple-600">
              Iniciar Análisis
            </button>
            <div className="flex space-x-2">
              {commonButtons}
              <button onClick={() => onDerivar(id_oficio)} className="w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-pnp-green text-white hover:bg-pnp-green-light">
                Derivar a Consolidador
              </button>
            </div>
          </div>
        );

      case SECCIONES.LABORATORIO:
        // Si el perito es de Laboratorio (el consolidador)
        return (
          <div className="flex flex-col space-y-2">
            <button onClick={() => onUpdateStatus(id_oficio, 'OFICIO EN PROCESO')} className="w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-purple-500 text-white hover:bg-purple-600">
              Iniciar Análisis
            </button>
            <div className="flex space-x-2">
              {commonButtons}
              <button onClick={() => onUpdateStatus(id_oficio, 'COMPLETADO')} className="w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-green-600 text-white hover:bg-green-700">
                Consolidar y Finalizar
              </button>
            </div>
          </div>
        );

      default:
        return commonButtons; // Por defecto, solo mostrar detalles
    }
  };

  return (
    <div className="border dark:border-gray-700 rounded-lg p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">Oficio N° {caso.numero_oficio}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(caso.fecha_creacion).toLocaleDateString()}</p>
          </div>
          {/* Aquí podrías agregar un badge de estado si lo necesitas */}
        </div>
        <div className="space-y-2 mb-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tipos de Examen</p>
            <p className="font-medium dark:text-gray-200 text-sm">{caso.tipos_de_examen || 'No especificado'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Prioridad</p>
            <p className="font-medium dark:text-gray-200">{caso.nombre_prioridad}</p>
          </div>
        </div>
      </div>
      <div className="mt-4">
        {renderActions()}
      </div>
    </div>
  );
};

export default PeritoCasos;
