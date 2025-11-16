import EstadoBadge from '../../ui/EstadoBadge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';

// Asumiendo que los iconos están en un solo archivo para simplicidad
import { VerDetalleIcon, IniciarProcedimientoIcon, DerivarIcon, ConsolidarIcon, GenerarReporteIcon } from '../../../assets/icons/Actions';

const CasoCard = ({ caso, onDerivarClick }) => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Obtener el usuario actual para saber su sección

  const handleVerDetalles = () => {
    navigate(`/perito/dashboard/casos/${caso.id_oficio}`);
  };

  const handleIniciarProcedimiento = () => {
    // Futura navegación a la vista de procedimiento específico
    console.log(`Iniciando procedimiento para el caso ${caso.id_oficio}`);
    // navigate(`/perito/dashboard/procedimiento/${caso.id_oficio}`);
  };

  // Normaliza un string: quita acentos, espacios y convierte a mayúsculas.
  const normalizeString = (str) => {
    if (!str) return '';
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toUpperCase();
  };

  const renderButtons = () => {
    const buttons = [];
    const seccionPerito = normalizeString(user?.seccion_nombre);
    const estadoCaso = caso.ultimo_estado?.toUpperCase() || 'CREACION DEL OFICIO';

    // Botón principal de acción (el más importante, con color)
    let primaryButton = null;

    switch (seccionPerito) {
      case 'TOMA DE MUESTRA':
        if (estadoCaso === 'CREACION DEL OFICIO') {
          primaryButton = (
            <button key="iniciar" onClick={handleIniciarProcedimiento} className="btn-primary">
              <IniciarProcedimientoIcon />
              <span>Registrar Muestra</span>
            </button>
          );
        } else {
          primaryButton = (
            <button key="derivar" onClick={() => onDerivarClick(caso.id_oficio)} className="btn-primary">
              <DerivarIcon />
              <span>Derivar</span>
            </button>
          );
        }
        break;

      case 'INSTRUMENTALIZACION':
        if (!estadoCaso.startsWith('DERIVADO')) {
           primaryButton = (
            <button key="iniciar" onClick={handleIniciarProcedimiento} className="btn-primary">
              <IniciarProcedimientoIcon />
              <span>Realizar Análisis</span>
            </button>
          );
        } else {
           primaryButton = (
            <button key="derivar" onClick={() => onDerivarClick(caso.id_oficio)} className="btn-primary">
              <DerivarIcon />
              <span>Derivar a LAB</span>
            </button>
          );
        }
        break;

      case 'LABORATORIO':
        if (estadoCaso.startsWith('DERIVADO A: LABORATORIO')) {
          primaryButton = (
            <button key="consolidar" onClick={handleIniciarProcedimiento} className="btn-primary">
              <ConsolidarIcon />
              <span>Consolidar</span>
            </button>
          );
        } else if (estadoCaso === 'CREACION DEL OFICIO') {
           primaryButton = (
            <button key="iniciar" onClick={handleIniciarProcedimiento} className="btn-primary">
              <IniciarProcedimientoIcon />
              <span>Iniciar Análisis</span>
            </button>
          );
        } else {
          // Asumimos que si no es para consolidar, es para generar el reporte final
           primaryButton = (
            <button key="reporte" onClick={handleIniciarProcedimiento} className="btn-primary">
              <GenerarReporteIcon />
              <span>Generar Reporte</span>
            </button>
          );
        }
        break;

      default:
        break;
    }
    
    if(primaryButton) buttons.push(primaryButton);

    // Botón secundario "Ver Detalles"
    buttons.push(
      <button key="detalles" onClick={handleVerDetalles} className="btn-secondary">
        <VerDetalleIcon />
        <span>Ver Detalles</span>
      </button>
    );

    return buttons;
  };

  return (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-md border border-gray-200 dark:border-dark-border overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-pnp-green-light">
      <div className="p-4 border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg-tertiary">
        <div className="flex justify-between items-center">
          <span className="font-bold text-lg text-pnp-green-dark dark:text-dark-pnp-green">
            {caso.numero_oficio}
          </span>
          <EstadoBadge estado={caso.ultimo_estado} />
        </div>
        <p className="text-sm text-gray-600 dark:text-dark-text-secondary mt-1 truncate" title={caso.asunto}>
          {caso.asunto}
        </p>
      </div>

      <div className="p-4 space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="font-semibold text-gray-500 dark:text-dark-text-secondary">Administrado:</span>
          <span className="text-gray-800 dark:text-dark-text-primary text-right truncate">{caso.examinado_incriminado || 'No especificado'}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold text-gray-500 dark:text-dark-text-secondary">Delito:</span>
          <span className="text-gray-800 dark:text-dark-text-primary text-right truncate">{caso.delito || 'No especificado'}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold text-gray-500 dark:text-dark-text-secondary">Exámenes:</span>
          <span className="text-gray-800 dark:text-dark-text-primary text-right truncate">{caso.tipos_de_examen || 'No especificados'}</span>
        </div>
         <div className="flex justify-between">
          <span className="font-semibold text-gray-500 dark:text-dark-text-secondary">Prioridad:</span>
          <span className="text-gray-800 dark:text-dark-text-primary text-right truncate">{caso.nombre_prioridad || 'No especificada'}</span>
        </div>
      </div>

      <div className="p-4 bg-gray-50 dark:bg-dark-bg-tertiary border-t border-gray-200 dark:border-dark-border">
        <div className="flex justify-end items-center space-x-3">
          {renderButtons()}
        </div>
      </div>
      
      {/* Estilos para los botones (se pueden mover a index.css) */}
      <style jsx>{`
        .btn-primary {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-weight: 500;
          font-size: 0.875rem;
          color: white;
          background-color: #1a4d2e; /* pnp-green-dark */
          transition: background-color 0.2s;
        }
        .btn-primary:hover {
          background-color: #2d7d4a; /* pnp-green-light */
        }
        .btn-secondary {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-weight: 500;
          font-size: 0.875rem;
          color: #374151; /* gray-700 */
          background-color: #f3f4f6; /* gray-100 */
          border: 1px solid #d1d5db; /* gray-300 */
          transition: background-color 0.2s;
        }
        .btn-secondary:hover {
          background-color: #e5e7eb; /* gray-200 */
        }
        .dark .btn-secondary {
          color: #d1d5db; /* dark-text-secondary */
          background-color: #334155; /* dark-bg-tertiary */
          border-color: #475569; /* dark-border */
        }
        .dark .btn-secondary:hover {
          background-color: #475569;
        }
      `}</style>
    </div>
  );
};

export default CasoCard;
