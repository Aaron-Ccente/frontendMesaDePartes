import React from 'react';
import { useParams } from 'react-router-dom';

const CasoDetail = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-[#1a4d2e] dark:text-green-400 mb-2">
          Detalles del Caso de Oficio
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          ID del Oficio: {id}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
          Funcionalidad en Desarrollo
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Aquí se mostrarán los detalles completos del oficio, los exámenes requeridos y los formularios para ingresar resultados.
        </p>
      </div>
    </div>
  );
};

export default CasoDetail;
