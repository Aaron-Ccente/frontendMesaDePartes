import React from 'react';
import SelectField from '../../../ui/forms/SelectField';

const ResultadosSarroUngueal = ({ muestra, onChange, no_aplicable }) => {
  const { resultados = {} } = muestra;
  const { resultado = 'NEGATIVO' } = resultados;

  const handleCheckboxChange = (e) => {
    onChange({ no_aplicable: e.target.checked });
  };

  const handleResultChange = (e) => {
    onChange({ resultado: e.target.value });
  };

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
      <h4 className="text-md font-semibold text-gray-700 dark:text-dark-text-primary mb-3">Resultado del Análisis de Sarro Ungueal</h4>
      
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          label="Resultado General"
          name="resultado"
          value={resultado}
          onChange={handleResultChange}
          disabled={no_aplicable}
          options={[
            { value: 'NEGATIVO', label: 'NEGATIVO' },
            { value: 'POSITIVO', label: 'POSITIVO' },
          ]}
        />
      </div>
    </div>
  );
};

export default ResultadosSarroUngueal;


