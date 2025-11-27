// frontend-mesa-de-partes/src/components/admin/AdminUIHelpers.jsx
import React from 'react';

export const getStatusBadge = (status) => {
  if (!status) {
    status = 'CREADO';
  }
  
  status = status.toUpperCase();
  let bgColor = 'bg-gray-100 dark:bg-gray-700';
  let textColor = 'text-gray-800 dark:text-gray-200';

  if (status.includes('CREACI') || status.includes('INICIO')) {
    bgColor = 'bg-blue-100 dark:bg-blue-800';
    textColor = 'text-blue-800 dark:text-blue-200';
  } else if (status.includes('DERIVADO') || status.includes('PENDIENTE')) {
    bgColor = 'bg-yellow-100 dark:bg-yellow-800';
    textColor = 'text-yellow-800 dark:text-yellow-200';
  } else if (status.includes('FINALIZADO') || status.includes('PROCESO')) {
    bgColor = 'bg-indigo-100 dark:bg-indigo-800';
    textColor = 'text-indigo-800 dark:text-indigo-200';
  } else if (status.includes('COMPLETADO') || status.includes('EMITIDO') || status.includes('LISTO')) {
    bgColor = 'bg-green-100 dark:bg-green-800';
    textColor = 'text-green-800 dark:text-green-200';
  } else if (status.includes('ERROR') || status.includes('FALLIDA')) {
    bgColor = 'bg-red-100 dark:bg-red-800';
    textColor = 'text-red-800 dark:text-red-200';
  }

  return (
    <span className={`px-2 py-1 font-semibold leading-tight text-xs rounded-full ${bgColor} ${textColor}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};
