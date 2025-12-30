import React, { useEffect, useRef, useState } from 'react';

const InformePreview = ({ htmlContent, isLoading }) => {
  const iframeRef = useRef(null);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  // Calcular escala para ajustar la hoja A4 al contenedor disponible
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        // Ancho A4 en px (aprox 96 DPI): 210mm = 794px. Agregamos margen de seguridad para no romper la vista previa
        const a4Width = 794; 
        const padding = 40; // Espacio alrededor
        const newScale = Math.min((containerWidth - padding) / a4Width, 1); // Max escala 1 (tamaño real)
        setScale(newScale > 0 ? newScale : 0.5);
      }
    };

    // Observer para detectar cambios de tamaño en el panel padre
    const resizeObserver = new ResizeObserver(() => {
        handleResize();
    });

    if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (iframeRef.current && htmlContent) {
      const doc = iframeRef.current.contentDocument;
      doc.open();
      doc.write(htmlContent);
      doc.close();
      
      // Inyectar estilos para ocultar scrollbars del iframe interno si es necesario
      const style = doc.createElement('style');
      style.textContent = 'body { overflow: hidden; }'; 
      doc.head.appendChild(style);
    }
  }, [htmlContent]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px] bg-gray-100 dark:bg-gray-800 rounded-xl border dark:border-dark-border">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pnp-green-dark mx-auto mb-4"></div>
            <p className="text-gray-500 font-medium">Generando vista previa...</p>
        </div>
      </div>
    );
  }

  if (!htmlContent) {
     return (
        <div className="flex items-center justify-center h-full min-h-[500px] bg-gray-50 dark:bg-gray-800 rounded-xl border dark:border-dark-border text-gray-400">
            Esperando datos...
        </div>
     );
  }

  return (
    <div 
        ref={containerRef} 
        className="w-full h-full bg-gray-500/10 rounded-xl overflow-hidden border dark:border-dark-border flex flex-col items-center p-4 overflow-y-auto"
    >
      {/* Contenedor escalable */}
      <div 
        style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            width: '210mm', // Ancho físico A4
            height: '297mm', // Alto físico A4
            minWidth: '210mm',
            minHeight: '297mm',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            backgroundColor: 'white',
            marginBottom: '20px' // Margen inferior para scroll
        }}
      >
          <iframe 
            ref={iframeRef}
            title="Vista Previa Informe"
            className="w-full h-full border-none"
            sandbox="allow-same-origin"
            style={{ overflow: 'hidden' }} // Evitar scrollbars dentro de la hoja
          />
      </div>
      <p className="text-xs text-gray-400 mt-2">Vista preliminar a escala A4 ({Math.round(scale * 100)}%)</p>
    </div>
  );
};

export default InformePreview;