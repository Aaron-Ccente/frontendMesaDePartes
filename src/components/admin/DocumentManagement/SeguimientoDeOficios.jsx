import { useEffect, useState } from "react";
import MesaDePartes from "../../../services/mesadepartesService";
import ShowToast from "../../ui/ShowToast";

function SeguimientoDeOficios({ id_oficio, numero, onClose }) {
  const [detalle, setDetalle] = useState(null);
  const [seguimientos, setSeguimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id_oficio) return;
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await MesaDePartes.getDetalleCaso(id_oficio);
        if (!mounted) return;
        const data = resp?.data;
        
        if (!data) {
          setError("No se pudo cargar el seguimiento");
          setDetalle(null);
          setSeguimientos([]);
        } else {
          setDetalle(data);
          const items = (data.seguimiento_historial || [])
            .slice()
            .sort((a, b) => new Date(a.fecha_seguimiento) - new Date(b.fecha_seguimiento));
          setSeguimientos(items);
        }
      } catch (err) {
        if (!mounted) return;
        console.error(err);
        setError(err?.message || "Error en la petición");
        setDetalle(null);
        setSeguimientos([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [id_oficio]);

  const latestId = seguimientos.length ? seguimientos[seguimientos.length - 1].id_seguimiento : null;

  const formatearEstado = (estado) => {
    return estado.replace(/_/g, " ");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) onClose && onClose(); }}
    >
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => onClose && onClose()}
          aria-label="Cerrar"
          className="absolute top-4 right-4 text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          ×
        </button>

        <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-1">
          Oficio #{numero}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          Línea de tiempo de seguimiento del documento
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1a4d2e]"></div>
          </div>
        ) : error ? (
          <div className="py-6">
            <ShowToast type="error" message={error} onClose={() => setError(null)} />
          </div>
        ) : (
          <>
            {/* Información del oficio */}
            {detalle && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Administrado</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{detalle.examinado_incriminado || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">DNI</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{detalle.dni_examinado_incriminado || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Especialidad</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{detalle.especialidad_requerida || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Perito Actual</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{detalle.perito_asignado || "-"}</p>
                </div>
              </div>
            )}

            {/* Timeline de seguimiento */}
            {seguimientos.length === 0 ? (
              <div className="py-8 text-center text-gray-600 dark:text-gray-300">
                No hay registros de seguimiento.
              </div>
            ) : (
              <div className="py-2">
                <div className="relative">
                  {/* Línea vertical */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#1a4d2e] to-gray-300 dark:to-gray-600"></div>

                  <ul className="space-y-6">
                    {seguimientos.map((s, idx) => {
                      const isLatest = s.id_seguimiento === latestId;
                      return (
                        <li key={idx} className="relative flex items-start">
                          {/* Círculo */}
                          <div className="absolute left-0 top-4 transform -translate-x-1/2 z-10">
                            <div className={`w-4 h-4 rounded-full transition-all ${isLatest
                              ? "bg-[#1a4d2e] ring-4 ring-[#1a4d2e]/30 scale-125"
                              : "bg-gray-400 ring-2 ring-gray-200 dark:ring-gray-600"
                            }`}></div>
                          </div>

                          {/* Contenido */}
                          <div className="ml-8 flex-1">
                            <div className={`p-4 rounded-lg border transition-all ${
                              isLatest
                                ? "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700"
                                : "bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-gray-700"
                            }`}>
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-sm font-bold ${
                                      isLatest
                                        ? "text-[#1a4d2e] dark:text-green-300"
                                        : "text-gray-800 dark:text-gray-100"
                                    }`}>
                                      {formatearEstado(s.estado_nuevo)}
                                    </span>
                                    {isLatest && (
                                      <span className="px-2 py-0.5 bg-[#1a4d2e] text-white text-xs rounded-full font-medium">
                                        Estado actual
                                      </span>
                                    )}
                                  </div>

                                  <div className="text-xs text-gray-600 dark:text-gray-300 mt-2">
                                    <p className="font-medium">Realizado por: <span className="font-normal">{s.nombre_usuario || "desconocido"}</span></p>
                                    {s.nombre_seccion_usuario && (
                                      <p className="text-gray-500 dark:text-gray-400">Sección: {s.nombre_seccion_usuario}</p>
                                    )}
                                  </div>

                                  {s.observaciones && (
                                    <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Observaciones:</p>
                                      <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{s.observaciones}</p>
                                    </div>
                                  )}
                                </div>

                                <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                  {s.fecha_seguimiento ? new Date(s.fecha_seguimiento).toLocaleString('es-PE') : "-"}
                                </div>
                              </div>

                              {s.estado_anterior && (
                                <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                                  <span className="font-medium">Desde: </span>{formatearEstado(s.estado_anterior)}
                                </div>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}
          </>
        )}

        <div className="mt-6 flex justify-end border-t border-gray-200 dark:border-gray-700 pt-4">
          <button
            onClick={() => onClose && onClose()}
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default SeguimientoDeOficios;