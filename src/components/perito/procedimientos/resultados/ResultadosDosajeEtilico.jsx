import React, { useEffect } from 'react';
import InputField from '../../../ui/forms/InputField';
import SelectField from '../../../ui/forms/SelectField';

const getEstadoEtilico = (valor, unidades) => {
  let v = parseFloat(valor);
  if (isNaN(v) || v < 0) return '';

  // Conversión a g/L para la lógica de negocio estándar
  if (unidades === 'mg/dL' || unidades === 'cg/L') {
    v = v / 100;
  }

  if (v === 0) return 'ESTADO NORMAL';
  if (v > 0 && v < 0.5) return 'PRESENCIA DE ALCOHOL (INFERIOR AL LÍMITE LEGAL)';
  if (v >= 0.5) return 'EBRIEDAD (SUPERIOR AL LÍMITE LEGAL)';
  return '';
};

const ResultadosDosajeEtilico = ({ muestra, onChange, no_aplicable }) => {
  const { resultados = {} } = muestra;
  
  // Valores por defecto
  const { 
    valor = '', 
    unidades = 'g/L', 
    estado = '', 
    tipo_medicion = 'ESTANDAR' // Nuevo campo: ESTANDAR | OTRO
  } = resultados;

  useEffect(() => {
    // Lógica automática SOLO para medición ESTÁNDAR
    if (tipo_medicion === 'ESTANDAR') {
      const newEstado = getEstadoEtilico(valor, unidades);
      
      if (newEstado !== estado) {
         onChange({ 
           ...resultados,
           estado: newEstado
         });
      }
    }
  }, [valor, unidades, tipo_medicion, estado, onChange, resultados]);

  const handleCheckboxChange = (e) => {
    onChange({ no_aplicable: e.target.checked });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  const handleTipoMedicionChange = (e) => {
    const newTipo = e.target.value;
    const updates = { tipo_medicion: newTipo };

    // Resetear valores al cambiar de tipo para evitar inconsistencias
    if (newTipo === 'ESTANDAR') {
        updates.unidades = 'g/L'; // Default a estándar
        updates.estado = getEstadoEtilico(valor, 'g/L');
    } else {
        updates.unidades = ''; // Limpiar para que escriban la medición manual
        updates.estado = '';
    }
    
    onChange({ ...resultados, ...updates });
  };

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
      <h4 className="text-md font-semibold text-gray-700 dark:text-dark-text-primary mb-3">Resultado del Análisis de Dosaje Etílico</h4>
      
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          id={`no_aplicable_${muestra.id}`}
          checked={no_aplicable}
          onChange={handleCheckboxChange}
          className="h-4 w-4 rounded border-gray-300 text-pnp-green-dark focus:ring-pnp-green-dark"
        />
        <label htmlFor={`no_aplicable_${muestra.id}`} className="ml-2 block text-sm text-gray-900 dark:text-dark-text-secondary">
          No aplicable para esta muestra
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Selector de Tipo de Medición */}
        <SelectField
          label="Tipo de Medición"
          name="tipo_medicion"
          value={tipo_medicion}
          onChange={handleTipoMedicionChange}
          disabled={no_aplicable}
          options={[
            { value: 'ESTANDAR', label: 'Medición Estándar' },
            { value: 'OTRO', label: 'Otro' }
          ]}
        />

        <InputField
          label="Valor Cuantitativo"
          name="valor"
          type="number"
          step="0.01"
          value={valor}
          onChange={handleInputChange}
          disabled={no_aplicable}
          placeholder="Ej: 1.50"
        />
        
        {tipo_medicion === 'ESTANDAR' ? (
            <SelectField
              label="Unidad de Medida"
              name="unidades"
              value={unidades}
              onChange={handleInputChange}
              disabled={no_aplicable}
              options={[
                { value: 'g/L', label: 'g/L (Gramos por Litro)' },
                { value: 'mg/dL', label: 'mg/dL (Miligramos por Decilitro)' },
                { value: 'cg/L', label: 'cg/L (Centigramos por Litro)' }
              ]}
            />
        ) : (
            <InputField
              label="Medición (Unidad/Contexto)"
              name="unidades" // Mantenemos el nombre 'unidades' para persistencia consistente
              value={unidades}
              onChange={handleInputChange}
              disabled={no_aplicable}
              placeholder="Ej: g/L (Transporte Público)"
            />
        )}

        <InputField
          label="Estado Cualitativo (Interpretación)"
          name="estado"
          value={estado}
          onChange={handleInputChange}
          readOnly={tipo_medicion === 'ESTANDAR'}
          disabled={no_aplicable}
          className={tipo_medicion === 'ESTANDAR' ? "bg-gray-100 dark:bg-dark-bg-secondary" : ""}
          placeholder={tipo_medicion === 'OTRO' ? "Ingrese interpretación manual" : ""}
        />
      </div>
    </div>
  );
};

export default ResultadosDosajeEtilico;