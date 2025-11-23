import PlaceholderProcedimiento from './PlaceholderProcedimiento';
import { ProcedimientoService } from '../../../services/procedimientoService';

const ProcedimientoAnalisisLAB = () => {
  const handleSave = (idOficio) => {
    return ProcedimientoService.registrarAnalisisPlaceholder(idOficio, 'LAB');
  };

  return (
    <PlaceholderProcedimiento
      pageTitle="Análisis Toxicológico (Laboratorio)"
      onSave={handleSave}
      saveButtonText="Guardar Análisis"
    />
  );
};

export default ProcedimientoAnalisisLAB;