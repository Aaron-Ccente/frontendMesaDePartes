import { useRef, useState } from "react";
import Barcode from "react-barcode";
import { OficiosService } from "../../services/oficiosService";
import ShowToast from "../ui/ShowToast";

function Codigodebarras({ codigo, width = 2, height = 60, displayValue = false, onClose, oficioData }) {
  const barcodeRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (!codigo) return null;

  const handlePrintOnly = () => {
    if (!barcodeRef.current) return;

    setPrintLoading(true);
    
    const svgHtml = barcodeRef.current.innerHTML;
    const htmlContent = `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8"/>
          <title>Código de Barras</title>
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
                setTimeout(() => {
                  window.close();
                }, 100);
              }, 100);
            };
          </script>
        </body>
      </html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank', 'width=600,height=400');
    
    if (!printWindow) {
      setFeedback("No se pudo abrir la ventana de impresión. Permite popups y vuelve a intentarlo.");
      URL.revokeObjectURL(url);
      setPrintLoading(false);
      return;
    }

    printWindow.onload = () => {
      URL.revokeObjectURL(url);
      printWindow.focus();
      setPrintLoading(false);
    };
  };

  const handleCreateAndPrint = async () => {
    if (!barcodeRef.current) return;

    try {
      setLoading(true);
      setFeedback(null);

      const mesadepartesData = JSON.parse(localStorage.getItem('mesadepartesData') || "null");
      if (!mesadepartesData) {
        setFeedback("No se encontraron datos de mesa de partes");
        return;
      }

      const tipoMuestra =
        oficioData.tipo_de_muestra === 'toma' ? 'TOMA DE MUESTRAS'
        : oficioData.tipo_de_muestra === 'remitidas' ? 'MUESTRAS REMITIDAS'
        : null;

      if (!tipoMuestra) {
        setFeedback(["Debe seleccionar el tipo de muestra (MUESTRAS REMITIDAS o TOMA DE MUESTRAS)"]);
        return;
      }

      const missing = [];
      if (tipoMuestra === 'TOMA DE MUESTRAS') {
        if (!oficioData.implicado || String(oficioData.implicado).trim() === "") {
          missing.push("Examinado/Incriminado es requerido para toma de muestras");
        }
        if (!oficioData.dniImplicado || String(oficioData.dniImplicado).trim() === "") {
          missing.push("DNI del examinado/incriminado es requerido para toma de muestras");
        }
      }
      if (missing.length > 0) {
        setFeedback(missing);
        return;
      }

      const payload = {
        mesadepartesData,
        numero_oficio: oficioData.numeroOficio,
        unidad_solicitante: oficioData.fiscalia,
        unidad_remitente: oficioData.fiscal_remitente,
        region_fiscalia: oficioData.regionSolicitante,
        tipo_de_muestra: tipoMuestra,
        asunto: oficioData.asunto,
        examinado_incriminado: oficioData.implicado || null,
        dni_examinado_incriminado: oficioData.dniImplicado || null,
        fecha_hora_incidente: oficioData.fechaHora,
        especialidad_requerida: oficioData.nombre_especialidad || null,
        id_especialidad_requerida: oficioData.id_especialidad ? Number(oficioData.id_especialidad) : null,
        tipo_examen: oficioData.tipo_examen || null,
        id_tipo_examen: oficioData.id_tipo_examen ? Number(oficioData.id_tipo_examen) : null,
        muestra: oficioData.muestra,
        perito_asignado: oficioData.nombre_perito || null,
        cip_perito_asignado: oficioData.cip_perito || null,
        id_usuario_perito_asignado: oficioData.id_usuario_perito ? Number(oficioData.id_usuario_perito) : null,
        id_prioridad: oficioData.id_prioridad ? Number(oficioData.id_prioridad) : null
      };

      const result = await OficiosService.createOficio(payload);
      if (!result.success) {
        if (Array.isArray(result.errors) && result.errors.length > 0) {
          setFeedback(result.errors);
        } else {
          setFeedback(result.message || "Error al crear el oficio");
        }
        return;
      }

      setFeedback("Oficio creado exitosamente");

      handlePrintOnly();

      setTimeout(() => { 
        onClose && onClose(); 
      }, 2000);

    } catch (err) {
      console.error(err);
      setFeedback(err?.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 bg-black/60"
      aria-hidden="true"
    >
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        onClick={(e) => { 
          if (e.target === e.currentTarget) onClose && onClose(false); 
        }}
      >
        <div className="w-[420px] bg-white dark:bg-gray-800 min-h-[320px] flex flex-col rounded-2xl relative p-6 shadow-xl">
          {feedback && (
            <div className="absolute top-2 left-4 right-4 z-10">
              <ShowToast
                type={Array.isArray(feedback) ? "error" : (feedback && feedback.includes("exitos") ? "success" : "error")}
                message={feedback}
                onClose={() => setFeedback(null)}
              />
            </div>
          )}

          <button
            type="button"
            onClick={() => onClose && onClose(false)}
            aria-label="Cerrar"
            className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
          >
            x
          </button>

          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Código de Barras</h3>
          </div>

          <div className="flex-1 flex items-center justify-center py-4">
            <div ref={barcodeRef} className="flex justify-center bg-white dark:bg-gray-700 p-4 rounded-lg">
              <Barcode 
                value={String(codigo)} 
                width={width} 
                height={height} 
                displayValue={displayValue} 
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <button
              type="button"
              onClick={handlePrintOnly}
              disabled={printLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-semibold text-base transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {printLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Imprimiendo...
                </>
              ) : (
                "Imprimir solo código de barras"
              )}
            </button>

            <button
              type="button"
              onClick={handleCreateAndPrint}
              disabled={loading}
              className="bg-gradient-to-r from-[#1a4d2e] to-[#2d7d4a] text-white py-3 px-4 rounded-xl font-semibold text-base transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Procesando...
                </>
              ) : (
                "Asignar a perito e imprimir"
              )}
            </button>

            <button
              type="button"
              onClick={() => onClose && onClose(false)}
              className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-xl font-semibold text-base transition-all duration-300 hover:shadow-sm"
              disabled={loading || printLoading}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Codigodebarras;