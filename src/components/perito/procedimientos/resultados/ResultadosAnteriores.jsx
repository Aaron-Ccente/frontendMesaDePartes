import React from 'react';

const ResultadosAnteriores = ({ resultados, id_muestra }) => {
  if (!resultados || resultados.length === 0) {
    return null;
  }

  // Filtrar y mapear los resultados que corresponden a esta muestra específica
  const resultadosParaEstaMuestra = resultados
    .map(res => ({
      tipo_resultado: res.tipo_resultado,
      detalles: res.resultados[id_muestra],
    }))
    .filter(res => res.detalles); // Solo incluir si hay detalles para esta muestra

  if (resultadosParaEstaMuestra.length === 0) {
    return null;
  }

  const renderValue = (value) => {
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    if (value === null || value === undefined) return 'N/A';
    return String(value);
  };

  return (
    <div className="mb-4 p-3 border rounded-md bg-gray-100/60 dark:bg-dark-bg-secondary">
      <h5 className="text-sm font-bold text-gray-600 dark:text-dark-text-primary mb-2">Resultados Anteriores</h5>
      <div className="space-y-2">
        {resultadosParaEstaMuestra.map((res, index) => (
          <div key={index} className="text-xs">
            <p className="font-semibold text-gray-800 dark:text-dark-text-primary">{res.tipo_resultado}:</p>
            <div className="pl-2 mt-1 space-y-1">
              {Object.entries(res.detalles).map(([key, value]) => {
                // No mostrar campos que no aportan valor
                if (key === 'no_aplicable' && !value) return null;
                if (key === 'descripcion_detallada' && !value) return null;

                return (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-600 dark:text-dark-text-secondary capitalize">{key.replace(/_/g, ' ')}:</span>
                    <span className="font-medium text-gray-900 dark:text-dark-text-primary">{renderValue(value)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultadosAnteriores;
