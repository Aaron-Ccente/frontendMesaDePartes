// frontend-mesa-de-partes/src/components/admin/ResultadosRenderer.jsx
import React from 'react';

const renderValue = (value, key) => {
  if (typeof value === 'object' && value !== null) {
    return <ResultadosRenderer key={key} jsonData={value} />;
  }
  return String(value);
};

const ResultadosRenderer = ({ jsonData }) => {
  let data;
  try {
    // If jsonData is a string, parse it. Otherwise, use it directly.
    data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
  } catch (error) {
    return <pre className="font-mono text-sm text-red-500">Error al parsear JSON: {String(jsonData)}</pre>;
  }

  if (typeof data !== 'object' || data === null) {
    return <pre className="font-mono text-sm">{String(data)}</pre>;
  }

  return (
    <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-600">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="mb-1">
          <strong className="text-gray-600 dark:text-gray-300 capitalize">{key.replace(/_/g, ' ')}: </strong>
          <span className="text-gray-800 dark:text-gray-100">{renderValue(value, key)}</span>
        </div>
      ))}
    </div>
  );
};

export default ResultadosRenderer;
