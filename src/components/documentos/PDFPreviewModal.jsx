import { useEffect } from 'react';
import Portal from '../ui/Portal'; // Asegúrate de que la ruta sea correcta

const PDFPreviewModal = ({ pdfUrl, onClose }) => {
  // Efecto para manejar el cierre con la tecla 'Escape'
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'acta_procedimiento.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Portal>
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center p-4"
        onClick={onClose} // Cierra el modal al hacer clic en el fondo
      >
        <div 
          className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()} // Evita que el clic dentro del modal lo cierre
        >
          {/* Header del Modal */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-dark-border flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-800 dark:text-dark-text-primary">
              Vista Previa del Documento
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Contenedor del Iframe */}
          <div className="flex-grow bg-gray-100 dark:bg-dark-bg-primary">
            {pdfUrl ? (
              <iframe
                src={pdfUrl}
                className="w-full h-full border-none"
                title="Vista previa del PDF"
              />
            ) : (
              <div className="w-full h-full flex justify-center items-center">
                <p className="text-gray-500">Generando vista previa...</p>
              </div>
            )}
          </div>

          {/* Footer con Acciones */}
          <div className="flex justify-end items-center p-4 border-t border-gray-200 dark:border-dark-border flex-shrink-0 space-x-3">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg text-sm font-medium bg-gray-200 hover:bg-gray-300 dark:bg-dark-bg-tertiary dark:hover:bg-dark-border text-gray-800 dark:text-dark-text-secondary transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={handleDownload}
              disabled={!pdfUrl}
              className="px-5 py-2 rounded-lg text-sm font-medium bg-[#1a4d2e] hover:bg-[#2d7d4a] text-white transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              <span>Descargar PDF</span>
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default PDFPreviewModal;
