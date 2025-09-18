import { useTheme } from '../../hooks/useTheme';
import SunIcon from '../../assets/icons/SunIcon';
import MoonIcon from '../../assets/icons/MoonIcon';

const ThemeToggle = ({ className = "", size = "md" }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12"
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        ${sizeClasses[size]}
        relative
        rounded-full
        bg-white dark:bg-dark-surface
        border-2 border-gray-200 dark:border-dark-border
        shadow-lg dark:shadow-gray-900/20
        hover:shadow-xl dark:hover:shadow-gray-900/30
        transition-all duration-300 ease-in-out
        hover:scale-110
        focus:outline-none focus:ring-2 focus:ring-pnp-green dark:focus:ring-dark-pnp-green
        ${className}
      `}
      aria-label={`Cambiar a modo ${isDarkMode ? 'claro' : 'oscuro'}`}
      title={`Cambiar a modo ${isDarkMode ? 'claro' : 'oscuro'}`}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {isDarkMode ? (
          <SunIcon 
            className={`${iconSizes[size]} text-yellow-500 dark:text-yellow-400 transition-all duration-300`}
          />
        ) : (
          <MoonIcon 
            className={`${iconSizes[size]} text-gray-700 dark:text-gray-300 transition-all duration-300`}
          />
        )}
      </div>
      
      {/* Efecto de rotación */}
      <div className={`
        absolute inset-0 rounded-full
        transition-all duration-500 ease-in-out
        ${isDarkMode ? 'rotate-180' : 'rotate-0'}
      `}>
        <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-600 opacity-0 dark:opacity-20 transition-opacity duration-300" />
      </div>
    </button>
  );
};

export default ThemeToggle;
