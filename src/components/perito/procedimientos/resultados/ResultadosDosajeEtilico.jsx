import React, { useEffect, useState } from 'react';
import InputField from '../../../ui/forms/InputField';
import SelectField from '../../../ui/forms/SelectField';

const getEstadoEtilico = (valor) => {
  const v = parseFloat(valor);
  if (isNaN(v) || v < 0) return '';
  if (v === 0) return 'ESTADO NORMAL';
  if (v > 0 && v < 0.5) return 'PRESENCIA DE ALCOHOL (INFERIOR AL LÍMITE LEGAL)';
  if (v >= 0.5) return 'EBRIEDAD (SUPERIOR AL LÍMITE LEGAL)';
  return '';
};

const ResultadosDosajeEtilico = ({ muestra, onChange, no_aplicable }) => {
  const { resultados = {} } = muestra;
  const { valor = '', unidades = 'g/L', estado = '' } = resultados;
  const [estadoCalculado, setEstadoCalculado] = useState('');

  useEffect(() => {
    const newEstado = getEstadoEtilico(valor);
    setEstadoCalculado(newEstado);
    // Sincronizar el estado calculado con el padre si es diferente
    if (newEstado !== estado) {
      onChange({ estado: newEstado });
    }
  }, [valor, estado, onChange]);

  const handleCheckboxChange = (e) => {
    onChange({ no_aplicable: e.target.checked });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <SelectField
          label="Unidades"
          name="unidades"
          value={unidades}
          onChange={handleInputChange}
          disabled={no_aplicable}
          options={[
            { value: 'g/L', label: 'g/L' }
          ]}
        />
        <InputField
          label="Estado Cualitativo"
          name="estado"
          value={estadoCalculado}
          readOnly
          className="bg-gray-100 dark:bg-dark-bg-secondary"
        />
      </div>
    </div>
  );
};

export default ResultadosDosajeEtilico;


