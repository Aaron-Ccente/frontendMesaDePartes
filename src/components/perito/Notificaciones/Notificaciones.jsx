// components/NotificationAlert.jsx
import { useState, useEffect, useRef } from 'react';
import { OficioAssignedPeritoService } from '../../../services/oficioAssignedPerito';
import Alert from '../../../assets/icons/Alert';
import { useNavigate } from 'react-router-dom';
import Information from '../../../assets/icons/Information';

const Notification = () => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [_, setError] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const loadNotificationCount = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await OficioAssignedPeritoService.getCountNewOficios();
      if (result && result.success) {
        setNotificationCount(parseInt(result.data) || 0);
      } else {
        setNotificationCount(0);
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar inicialmente
  useEffect(() => {
    loadNotificationCount();
  }, []);

  // Carga cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      loadNotificationCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Cargar cuando la ventana gana foco
  useEffect(() => {
    const handleFocus = () => {
      loadNotificationCount();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleVerCasos = () => {
    setShowDropdown(false);
    navigate('/perito/dashboard/mis-casos/extraccion');
  };

  const handleCloseDropdown = () => {
    setShowDropdown(false);
  };

  if (loading) {
    return (
      <div className='relative w-fit h-10 flex items-center'>
        <div className='bg-white h-6 rounded-full text-black flex items-center justify-center z-20 text-lg w-fit px-1 -mr-3 -mt-4 animate-pulse'>
          ...
        </div>
        <div className='cursor-pointer'>
          <Alert />
        </div>
      </div>
    );
  }

  return (
    <div className='relative' ref={dropdownRef}>
      <div className='relative w-fit h-10 flex items-center'>
        {notificationCount > 0 && (
          <div className='bg-red-500 text-white h-6 rounded-full flex items-center justify-center z-20 text-xs font-bold w-fit px-2 -mr-3 -mt-4 min-w-[24px]'>
            {notificationCount > 99 ? '99+' : notificationCount}
          </div>
        )}
        <div 
          className='cursor-pointer hover:opacity-80 transition-opacity'
          onClick={handleNotificationClick}
        >
          <Alert />
        </div>
      </div>

      {/* Dropdown de notificaciones */}
      {showDropdown && notificationCount > 0 && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
          {/* Header del dropdown */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Nuevas asignaciones
              </h3>
              <button
                onClick={handleCloseDropdown}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Contenido del mensaje */}
          <div className="p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-900 rounded-full flex items-center justify-center">
                  <Information/>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Tienes <span className="font-semibold text-blue-600 dark:text-blue-400">{notificationCount}</span> nuevo{notificationCount>1?'s':''} oficio{notificationCount>1?'s':''} asignado{notificationCount>1?'s':''} que requieren tu atención.
                </p>
              </div>
            </div>
          </div>

          {/* Footer con botones */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg">
            <div className="flex space-x-3">
              <button
                onClick={handleVerCasos}
                className="flex-1 bg-green-900 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
              >
                Ver Casos
              </button>
              <button
                onClick={handleCloseDropdown}
                className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg transition-colors text-sm font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay notificaciones pero se hace click */}
      {showDropdown && notificationCount === 0 && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  No tienes nuevas asignaciones
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;