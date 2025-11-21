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
    } else if (tipo === 'analisis-inst') {
      // TODO: Implementar vista de análisis INST
      console.log('Navegar a Análisis INST');
    } else if (tipo === 'analisis-lab') {
      navigate(`/perito/dashboard/procedimiento/analisis-lab/${caso.id_oficio}`);
    } else if (tipo === 'consolidar') {
      navigate(`/perito/dashboard/procedimiento/consolidar/${caso.id_oficio}`);
    } else if (tipo === 'reporte') {
      // TODO: Implementar vista de generación de reporte final (si es diferente a consolidar)
      console.log('Navegar a Generación de Reporte');
    }
  };

  // Normaliza un string: quita acentos, espacios y convierte a mayúsculas.
  const normalizeString = (str) => {
    if (!str) return '';
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toUpperCase();
  };

  const renderButtons = () => {
    const actionButtons = [];
    const seccionPerito = normalizeString(user?.seccion_nombre);
    const estadoCaso = caso.ultimo_estado?.toUpperCase() || 'CREACION DEL OFICIO';

    let primaryButton = null;
    const secondaryClasses = "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-gray-700 bg-gray-100 border border-gray-300 hover:bg-gray-200 dark:text-dark-text-secondary dark:bg-dark-bg-tertiary dark:border-dark-border dark:hover:bg-dark-border transition-colors duration-200";
    const editButtonClasses = "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-amber-700 bg-amber-100 border border-amber-300 hover:bg-amber-200 dark:text-amber-400 dark:bg-amber-900/20 dark:border-amber-500/30 dark:hover:bg-amber-900/40 transition-colors duration-200";

    switch (seccionPerito) {
      case 'TOMA DE MUESTRA':
        if (estadoCaso === 'CREACION DEL OFICIO') {
          if (caso.tipo_de_muestra === 'TOMA DE MUESTRAS') {
            primaryButton = (
              <button key="iniciar-extraccion" onClick={() => handleIniciarProcedimiento('extraccion')} className="btn-primary">
                <IniciarProcedimientoIcon />
                <span>Registrar Muestra</span>
              </button>
            );
          } else { // Asumimos MUESTRAS REMITIDAS
            primaryButton = (
              <button key="iniciar-analisis" onClick={() => handleIniciarProcedimiento('analisis-tm')} className="btn-primary">
                <IniciarProcedimientoIcon />
                <span>Iniciar Análisis</span>
              </button>
            );
          }
        } else if (estadoCaso === 'PENDIENTE_ANALISIS_TM') {
          primaryButton = (
            <button key="continuar-analisis" onClick={() => handleIniciarProcedimiento('analisis-tm')} className="btn-primary">
              <IniciarProcedimientoIcon />
              <span>Continuar con Análisis</span>
            </button>
          );
        } else if (estadoCaso === 'ANALISIS_TM_FINALIZADO' || estadoCaso === 'EXTRACCION_FINALIZADA') {
          primaryButton = (
            <button key="derivar" onClick={() => onDerivarClick(caso.id_oficio)} className="btn-primary" disabled={isDeriving}>
              <DerivarIcon />
              <span>{isDeriving ? 'Derivando...' : 'Derivar'}</span>
            </button>
          );
          
          let editType = estadoCaso === 'ANALISIS_TM_FINALIZADO' ? 'analisis-tm' : 'extraccion';
          actionButtons.push(
            <button key="editar" onClick={() => handleIniciarProcedimiento(editType)} className={editButtonClasses}>
              <IniciarProcedimientoIcon />
              <span>Editar</span>
            </button>
          );
        }
        break;

      case 'INSTRUMENTALIZACION':
        if (estadoCaso.startsWith('DERIVADO A')) {
          primaryButton = (
            <button key="iniciar-analisis-inst" onClick={() => handleIniciarProcedimiento('analisis-inst')} className="btn-primary">
              <IniciarProcedimientoIcon />
              <span>Realizar Análisis</span>
            </button>
          );
        } else if (estadoCaso === 'ANALISIS_INST_FINALIZADO') {
          primaryButton = (
            <button key="derivar-inst" onClick={() => onDerivarClick(caso.id_oficio)} className="btn-primary" disabled={isDeriving}>
              <DerivarIcon />
              <span>{isDeriving ? 'Derivando...' : 'Derivar a LAB'}</span>
            </button>
          );
          actionButtons.push(
            <button key="editar-inst" onClick={() => handleIniciarProcedimiento('analisis-inst')} className={editButtonClasses}>
              <IniciarProcedimientoIcon />
              <span>Editar</span>
            </button>
          );
        }
        break;

      case 'LABORATORIO':
        if (estadoCaso.startsWith('DERIVADO A: LABORATORIO')) {
          primaryButton = (
            <button key="consolidar" onClick={() => handleIniciarProcedimiento('consolidar')} className="btn-primary">
              <ConsolidarIcon />
              <span>Consolidar Resultados</span>
            </button>
          );
        } else if (estadoCaso === 'CREACION DEL OFICIO' || estadoCaso.startsWith('DERIVADO A')) {
           primaryButton = (
            <button key="iniciar-analisis-lab" onClick={() => handleIniciarProcedimiento('analisis-lab')} className="btn-primary">
              <IniciarProcedimientoIcon />
              <span>Iniciar Análisis</span>
            </button>
          );
        } else if (estadoCaso === 'ANALISIS_LAB_FINALIZADO') {
           primaryButton = (
            <button key="derivar-lab" onClick={() => onDerivarClick(caso.id_oficio)} className="btn-primary" disabled={isDeriving}>
              <DerivarIcon />
              <span>{isDeriving ? 'Derivando...' : 'Asignar Consolidación'}</span>
            </button>
          );
           actionButtons.push(
            <button key="editar-lab" onClick={() => handleIniciarProcedimiento('analisis-lab')} className={editButtonClasses}>
              <IniciarProcedimientoIcon />
              <span>Editar</span>
            </button>
          );
        } else {
           primaryButton = (
            <button key="reporte" onClick={() => handleIniciarProcedimiento('reporte')} className="btn-primary">
              <GenerarReporteIcon />
              <span>Generar Reporte Final</span>
            </button>
          );
        }
        break;

      default:
        break;
    }

    if (primaryButton) actionButtons.unshift(primaryButton);

    actionButtons.push(
      <button key="detalles" onClick={handleVerDetalles} className={secondaryClasses}>
        <VerDetalleIcon />
        <span>Ver Detalles</span>
      </button>
    );

    return actionButtons;
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
