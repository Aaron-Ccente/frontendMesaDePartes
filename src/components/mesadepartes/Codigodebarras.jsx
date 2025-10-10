import { useRef } from "react";
import Barcode from "react-barcode";

function Codigodebarras({ codigo, width = 2, height = 60, displayValue = true, onClose }) {
  const barcodeRef = useRef(null);
  if (!codigo) return null;

  const handlePrintModern = () => {
    if (!barcodeRef.current) return;

    const svgHtml = barcodeRef.current.innerHTML;
    
    const htmlContent = `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8"/>
          <title></title>
          <style>
            html, body { 
              height: 100%; 
              margin: 0; 
              padding: 0; 
              overflow: hidden;
            }
            body { 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              background: #fff; 
              width: 100vw;
              height: 100vh;
            }
            .barcode-container {
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .barcode-container svg { 
              width: 100%;
              height: 100%;
              max-width: 100%;
              max-height: 100%;
            }
            @media print {
              @page {
                margin: 0 !important;
                padding: 0 !important;
                size: auto;
              }
              body {
                margin: 0 !important;
                padding: 0 !important;
              }
              .barcode-container {
                margin: 0 !important;
                padding: 0 !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="barcode-container">
            ${svgHtml}
          </div>
          <script>
            window.onload = function() {
              const style = document.createElement('style');
              style.innerHTML = \`
                @page { margin: 0; size: auto; }
                body { margin: 0; }
              \`;
              document.head.appendChild(style);
              
              setTimeout(() => {
                window.print();
                setTimeout(() => window.close(), 100);
              }, 100);
            };
          </script>
        </body>
      </html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      alert("No se pudo abrir la ventana de impresión. Permite popups y vuelve a intentarlo.");
      URL.revokeObjectURL(url);
      return;
    }

    printWindow.onload = () => {
      URL.revokeObjectURL(url);
      printWindow.focus();
    };
  };

  return (
    <div
      className="w-full bg-black/40 z-50 min-h-screen fixed top-0 left-0 flex justify-center items-center"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose && onClose(false);
        }
      }}
    >
      <div className="w-96 bg-white h-64 flex justify-center items-center flex-col rounded-3xl relative p-6">
        <button
          type="button"
          onClick={() => onClose && onClose(false)}
          aria-label="Cerrar"
          className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
        >
          Cerrar
        </button>

        <div ref={barcodeRef} className="flex justify-center">
          <Barcode 
            value={String(codigo)} 
            width={width} 
            height={height} 
            displayValue={displayValue} 
          />
        </div>

        <div className="flex gap-3 mt-4">
          <button
            type="button"
            onClick={() => onClose && onClose(false)}
            className="bg-gray-200 text-gray-800 py-2 px-4 rounded-xl font-semibold text-base hover:shadow-sm"
          >
            Cerrar
          </button>

          <button
            type="button"
            onClick={handlePrintModern}
            className="bg-gradient-to-r from-[#1a4d2e] to-[#2d7d4a] text-white py-2 px-4 rounded-xl font-semibold text-base transition-all duration-300 hover:shadow-lg"
          >
            Imprimir código de barras
          </button>
        </div>
      </div>
    </div>
  );
}

export default Codigodebarras;