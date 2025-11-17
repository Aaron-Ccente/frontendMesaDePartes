const EstadoBadge = ({ estado }) => {
  let colorClasses = 'bg-gray-200 text-gray-800';
  let text = estado || 'SIN ESTADO';

  switch (text.toUpperCase()) {
    case 'CREACION DEL OFICIO':
      colorClasses = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      text = 'Recién Creado';
      break;
    case 'OFICIO VISTO':
      colorClasses = 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
      text = 'Visto';
      break;
    case 'OFICIO EN PROCESO':
      colorClasses = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      text = 'En Proceso';
      break;
    case 'COMPLETADO':
    case 'CERRADO':
      colorClasses = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      text = 'Finalizado';
      break;
    default:
      if (text.startsWith('DERIVADO A:')) {
        colorClasses = 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      }
      break;
  }

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${colorClasses}`}>
      {text}
    </span>
  );
};

export default EstadoBadge;
