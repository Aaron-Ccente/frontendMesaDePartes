import PlaceholderProcedimiento from './PlaceholderProcedimiento';
import { ProcedimientoService } from '../../../services/procedimientoService';

const ProcedimientoAnalisisINST = () => {
  const handleSave = (idOficio) => {
    return ProcedimientoService.registrarAnalisisPlaceholder(idOficio, 'INST');
  };

  return (
    <PlaceholderProcedimiento
      pageTitle="Análisis de Dosaje Etílico (Instrumentalización)"
      onSave={handleSave}
      saveButtonText="Guardar Análisis"
    />
  );
};

export default ProcedimientoAnalisisINST;
