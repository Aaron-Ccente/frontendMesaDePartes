import EstadoBadge from '../../ui/EstadoBadge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';

// Asumiendo que los iconos están en un solo archivo para simplicidad
import { VerDetalleIcon, IniciarProcedimientoIcon, DerivarIcon, ConsolidarIcon, GenerarReporteIcon } from '../../../assets/icons/Actions';

const CasoCard = ({ caso, onDerivarClick, isDeriving }) => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Obtener el usuario actual para saber su sección

  const handleVerDetalles = () => {
    navigate(`/perito/dashboard/casos/${caso.id_oficio}`);
  };

  const handleIniciarProcedimiento = (tipo) => {
    if (tipo === 'extraccion') {
      navigate(`/perito/dashboard/procedimiento/extraccion/${caso.id_oficio}`);
    } else if (tipo === 'analisis-tm') {
      navigate(`/perito/dashboard/procedimiento/analisis-tm/${caso.id_oficio}`);
    } else {
      // Fallback o ruta genérica para otros análisis (INST, LAB)
      // Por ahora, podemos apuntar a una vista en desarrollo o simplemente loguear
      console.log(`Iniciando procedimiento de tipo ${tipo} para el caso ${caso.id_oficio}`);
      // navigate(`/perito/dashboard/procedimiento/analisis/${caso.id_oficio}`);
    }
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

    let primaryButton = null;

    const secondaryClasses = "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-gray-700 bg-gray-100 border border-gray-300 hover:bg-gray-200 dark:text-dark-text-secondary dark:bg-dark-bg-tertiary dark:border-dark-border dark:hover:bg-dark-border transition-colors duration-200";


    switch (seccionPerito) {
      case 'TOMA DE MUESTRA':
        // El botón de "iniciar" depende del tipo de caso.
        // Si el tipo de muestra es TOMA DE MUESTRAS, es extracción.
        // Si es MUESTRAS REMITIDAS, es análisis (Sarro Ungueal).
        if (estadoCaso === 'CREACION DEL OFICIO') {
          if (caso.tipo_de_muestra === 'TOMA DE MUESTRAS') {
            primaryButton = (
              <button key="iniciar" onClick={() => handleIniciarProcedimiento('extraccion')} className="btn-primary">
                <IniciarProcedimientoIcon />
                <span>Registrar Muestra</span>
              </button>
            );
          } else { // Asumimos MUESTRAS REMITIDAS
            primaryButton = (
              <button key="iniciar" onClick={() => handleIniciarProcedimiento('analisis-tm')} className="btn-primary">
                <IniciarProcedimientoIcon />
                <span>Iniciar Análisis</span>
              </button>
            );
          }
        } else {
          primaryButton = (
            <button key="derivar" onClick={() => onDerivarClick(caso.id_oficio)} className="btn-primary" disabled={isDeriving}>
              <DerivarIcon />
              <span>{isDeriving ? 'Derivando...' : 'Derivar'}</span>
            </button>
          );
        }
        break;

      case 'INSTRUMENTALIZACION':
        if (!estadoCaso.startsWith('DERIVADO')) {
           primaryButton = (
            <button key="iniciar" onClick={() => handleIniciarProcedimiento('analisis-inst')} className="btn-primary">
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
            <button key="consolidar" onClick={() => handleIniciarProcedimiento('consolidar')} className="btn-primary">
              <ConsolidarIcon />
              <span>Consolidar</span>
            </button>
          );
        } else if (estadoCaso === 'CREACION DEL OFICIO') {
           primaryButton = (
            <button key="iniciar" onClick={() => handleIniciarProcedimiento('analisis-lab')} className="btn-primary">
              <IniciarProcedimientoIcon />
              <span>Iniciar Análisis</span>
            </button>
          );
        } else {
          // Asumimos que si no es para consolidar, es para generar el reporte final
           primaryButton = (
            <button key="reporte" onClick={() => handleIniciarProcedimiento('reporte')} className="btn-primary">
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
      <button key="detalles" onClick={handleVerDetalles} className={secondaryClasses}>
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
      
    </div>
  );
};

export default CasoCard;
