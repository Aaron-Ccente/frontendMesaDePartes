import PlaceholderProcedimiento from './PlaceholderProcedimiento';
import { ProcedimientoService } from '../../../services/procedimientoService';

const ProcedimientoConsolidacionLAB = () => {
  const handleSave = (idOficio) => {
    return ProcedimientoService.registrarConsolidacionPlaceholder(idOficio);
  };

  return (
    <PlaceholderProcedimiento
      pageTitle="Consolidación de Resultados (Laboratorio)"
      onSave={handleSave}
      saveButtonText="Guardar Consolidación"
    />
  );
};

export default ProcedimientoConsolidacionLAB;
