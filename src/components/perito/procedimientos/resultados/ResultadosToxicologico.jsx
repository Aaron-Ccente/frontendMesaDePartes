import React from 'react';
import { TIPOS_DROGA } from '../../../../utils/constants';

const ResultadosToxicologico = ({ muestra, onChange, no_aplicable }) => {
  const { resultados = {} } = muestra;

  const handleCheckboxChange = (e) => {
    onChange({ no_aplicable: e.target.checked });
  };

  const handleResultChange = (drogaKey, value) => {
    onChange({ [drogaKey]: value });
  };

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
      <h4 className="text-md font-semibold text-gray-700 dark:text-dark-text-primary mb-3">Resultado del Análisis Toxicológico</h4>
      
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 p-3 border rounded-md bg-gray-100 dark:bg-dark-surface">
        {TIPOS_DROGA.map(droga => (
          <div key={droga.key} className="flex items-center justify-between">
              <label htmlFor={`${muestra.id}-${droga.key}`} className="text-sm text-gray-700 dark:text-dark-text-secondary">{droga.label}:</label>
              <select 
                id={`${muestra.id}-${droga.key}`} 
                value={resultados[droga.key] || 'NEGATIVO'} 
                onChange={(e) => handleResultChange(droga.key, e.target.value)}
                disabled={no_aplicable}
                className="form-select-sm"
              >
                  <option value="NEGATIVO">NEGATIVO</option>
                  <option value="POSITIVO">POSITIVO</option>
              </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultadosToxicologico;



