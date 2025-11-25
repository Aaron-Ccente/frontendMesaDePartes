import { toast } from 'sonner';
import EstadoBadge from '../../ui/EstadoBadge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { ProcedimientoService } from '../../../services/procedimientoService.js';

import { VerDetalleIcon, IniciarProcedimientoIcon, DerivarIcon, GenerarReporteIcon } from '../../../assets/icons/Actions';

const CasoCard = ({ caso, onDerivarClick, onFinalizarClick = null, isDeriving, funcion }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleVerDetalles = () => navigate(`/perito/dashboard/casos/${caso.id_oficio}`);

  const handleIniciarProcedimiento = (tipo) => {
    let path = '';
    const base = '/perito/dashboard/procedimiento';
    
    switch(tipo) {
      case 'extraccion':
        path = `${base}/extraccion/${caso.id_oficio}`;
        break;
      case 'analisis-tm':
      case 'analisis-inst':
      case 'analisis-lab':
        path = `${base}/analisis/${caso.id_oficio}`; // RUTA UNIFICADA
        break;
      case 'consolidacion-lab':
      case 'consolidacion':
        path = `${base}/consolidar/${caso.id_oficio}`; // RUTA UNIFICADA
        break;
      default:
        toast.error(`Tipo de procedimiento '${tipo}' no reconocido.`);
        return;
    }
    navigate(path, { state: { funcion } });
  };
  
  const handleFinalizar = async () => {
    if (!window.confirm('¿Está seguro de que desea finalizar este caso y enviarlo a Mesa de Partes? Esta acción no se puede deshacer.')) {
      return;
    }
    toast.info('Finalizando el caso...');
    try {
      const res = await ProcedimientoService.finalizarParaMP(caso.id_oficio);
      if (res.success) {
        toast.success('Caso finalizado y notificado a Mesa de Partes.');
        // Aquí podrías forzar una recarga de la lista de casos si fuera necesario
        window.location.reload(); 
      } else {
        throw new Error(res.message);
      }
    } catch (error) {
       toast.error(`Error al finalizar el caso: ${error.message}`);
    }
  }

  const normalizeString = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toUpperCase() : '';

  const renderButtons = () => {
    const actionButtons = [];
    const seccionPerito = normalizeString(user?.seccion_nombre);
    const estadoCaso = caso.ultimo_estado?.toUpperCase() || 'CREACION DEL OFICIO';

    let primaryButton = null;
    const secondaryClasses = "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-gray-700 bg-gray-100 border border-gray-300 hover:bg-gray-200 dark:text-dark-text-secondary dark:bg-dark-bg-tertiary dark:border-dark-border dark:hover:bg-dark-border transition-colors duration-200";
    const editButtonClasses = "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-amber-700 bg-amber-100 border border-amber-300 hover:bg-amber-200 dark:text-amber-400 dark:bg-amber-900/20 dark:border-amber-500/30 dark:hover:bg-amber-900/40 transition-colors duration-200";

    switch (seccionPerito) {
      case 'TOMA DE MUESTRA':
        if (funcion === 'extraccion' || funcion === 'extraccion_y_analisis') {
          if (estadoCaso === 'CREACION DEL OFICIO' || estadoCaso === 'ASIGNADO') {
            primaryButton = <button key="iniciar-extraccion" onClick={() => handleIniciarProcedimiento('extraccion')} className="btn-primary"><IniciarProcedimientoIcon /><span>Iniciar Extracción</span></button>;
          } else if (estadoCaso === 'PENDIENTE_ANALISIS_TM') {
            primaryButton = <button key="continuar-analisis" onClick={() => handleIniciarProcedimiento('analisis-tm')} className="btn-primary"><IniciarProcedimientoIcon /><span>Iniciar Análisis</span></button>;
            actionButtons.push(<button key="editar-extraccion" onClick={() => handleIniciarProcedimiento('extraccion')} className={editButtonClasses}><IniciarProcedimientoIcon /><span>Editar Extracción</span></button>);
          }
        }
        if (funcion === 'analisis_tm') {
          if (['CREACION DEL OFICIO', 'ASIGNADO'].includes(estadoCaso) || estadoCaso.startsWith('DERIVADO A')) {
            primaryButton = <button key="iniciar-analisis-puro" onClick={() => handleIniciarProcedimiento('analisis-tm')} className="btn-primary"><IniciarProcedimientoIcon /><span>Iniciar Análisis</span></button>;
          }
        }
        if (['ANALISIS_TM_FINALIZADO', 'EXTRACCION_FINALIZADA'].includes(estadoCaso)) {
          primaryButton = <button key="derivar" onClick={() => onDerivarClick(caso.id_oficio)} className="btn-primary" disabled={isDeriving}><DerivarIcon /><span>{isDeriving ? 'Derivando...' : 'Derivar'}</span></button>;
          const editType = estadoCaso === 'ANALISIS_TM_FINALIZADO' ? 'analisis-tm' : 'extraccion';
          actionButtons.push(<button key="editar" onClick={() => handleIniciarProcedimiento(editType)} className={editButtonClasses}><IniciarProcedimientoIcon /><span>Editar Procedimiento</span></button>);
        }
        break;

      case 'INSTRUMENTALIZACION':
        if (estadoCaso.startsWith('DERIVADO A') || estadoCaso === 'CREACION DEL OFICIO') {
          primaryButton = <button key="iniciar-analisis-inst" onClick={() => handleIniciarProcedimiento('analisis-inst')} className="btn-primary"><IniciarProcedimientoIcon /><span>Iniciar Análisis</span></button>;
        } else if (estadoCaso === 'ANALISIS_INST_FINALIZADO') {
          primaryButton = <button key="derivar-inst" onClick={() => onDerivarClick(caso.id_oficio)} className="btn-primary" disabled={isDeriving}><DerivarIcon /><span>{isDeriving ? 'Derivando...' : 'Derivar a LAB'}</span></button>;
          actionButtons.push(<button key="editar-inst" onClick={() => handleIniciarProcedimiento('analisis-inst')} className={editButtonClasses}><IniciarProcedimientoIcon /><span>Editar Análisis</span></button>);
        }
        break;

      case 'LABORATORIO':
        if (funcion === 'analisis_lab') {
          if (estadoCaso === 'CREACION DEL OFICIO' || estadoCaso.startsWith('DERIVADO A')) {
            primaryButton = <button key="iniciar-analisis-lab" onClick={() => handleIniciarProcedimiento('analisis-lab')} className="btn-primary"><IniciarProcedimientoIcon /><span>Iniciar Análisis</span></button>;
          } else if (estadoCaso === 'ANALISIS_LAB_FINALIZADO') {
            primaryButton = <button key="derivar-lab" onClick={() => onDerivarClick(caso.id_oficio)} className="btn-primary" disabled={isDeriving}><DerivarIcon /><span>{isDeriving ? 'Derivando...' : 'Asignar Consolidación'}</span></button>;
            actionButtons.push(<button key="editar-lab" onClick={() => handleIniciarProcedimiento('analisis-lab')} className={editButtonClasses}><IniciarProcedimientoIcon /><span>Editar Análisis</span></button>);
          }
        } else if (funcion === 'consolidacion_lab') {
          if (estadoCaso === 'PENDIENTE_CONSOLIDACION') {
             primaryButton = <button key="iniciar-consolidacion" onClick={() => handleIniciarProcedimiento('consolidacion-lab')} className="btn-primary"><IniciarProcedimientoIcon /><span>Iniciar Consolidación</span></button>;
          } else if (estadoCaso === 'CONSOLIDACION_FINALIZADA') {
            primaryButton = <button key="finalizar-caso" onClick={handleFinalizar} className="btn-success"><GenerarReporteIcon /><span>Finalizar Caso</span></button>;
            actionButtons.push(<button key="editar-consolidacion" onClick={() => handleIniciarProcedimiento('consolidacion-lab')} className={editButtonClasses}><IniciarProcedimientoIcon /><span>Editar Consolidación</span></button>);
          }
        }
        break;

      default:
        // No se renderizan botones de acción si la sección no coincide
        break;
    }

    if (primaryButton) actionButtons.unshift(primaryButton);
    if (onDerivarClick) { // Solo muestra detalles si es una vista de acción
        actionButtons.push(<button key="detalles" onClick={handleVerDetalles} className={secondaryClasses}><VerDetalleIcon /><span>Ver Detalles</span></button>);
    }

    return actionButtons;
  };

  return (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-md border border-gray-200 dark:border-dark-border overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-pnp-green-light">
      <div className="p-4 border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg-tertiary">
        <div className="flex justify-between items-center">
          <span className="font-bold text-lg text-pnp-green-dark dark:text-dark-pnp-green">{caso.numero_oficio}</span>
          <EstadoBadge estado={caso.ultimo_estado} />
        </div>
        <p className="text-sm text-gray-600 dark:text-dark-text-secondary mt-1 truncate" title={caso.asunto}>{caso.asunto}</p>
      </div>
      <div className="p-4 space-y-3 text-sm">
        <div className="flex justify-between"><span className="font-semibold text-gray-500 dark:text-dark-text-secondary">Administrado:</span><span className="text-gray-800 dark:text-dark-text-primary text-right truncate">{caso.examinado_incriminado || 'No especificado'}</span></div>
        <div className="flex justify-between"><span className="font-semibold text-gray-500 dark:text-dark-text-secondary">Delito:</span><span className="text-gray-800 dark:text-dark-text-primary text-right truncate">{caso.delito || 'No especificado'}</span></div>
        <div className="flex justify-between"><span className="font-semibold text-gray-500 dark:text-dark-text-secondary">Exámenes:</span><span className="text-gray-800 dark:text-dark-text-primary text-right truncate">{caso.tipos_de_examen || 'No especificados'}</span></div>
        <div className="flex justify-between"><span className="font-semibold text-gray-500 dark:text-dark-text-secondary">Prioridad:</span><span className="text-gray-800 dark:text-dark-text-primary text-right truncate">{caso.nombre_prioridad || 'No especificada'}</span></div>
      </div>
      {(onDerivarClick) && (
        <div className="p-4 bg-gray-50 dark:bg-dark-bg-tertiary border-t border-gray-200 dark:border-dark-border">
          <div className="flex justify-end items-center space-x-3">
            {renderButtons()}
          </div>
        </div>
      )}
    </div>
  );
};

export default CasoCard;