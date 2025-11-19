import { useEffect, useState } from "react";
import { OficiosService } from "../../../services/oficiosService";
import ShowToast from "../../ui/ShowToast";

function SeguimientoDeOficios({ id, numero, onClose }) {
  const [seguimientos, setSeguimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await OficiosService.getAllSeguimientoOficiosById(id);
        if (!mounted) return;
        if (!resp || !resp.success) {
          setError(resp?.message || "No se pudo cargar el seguimiento");
          setSeguimientos([]);
        } else {
          // ordenar cronológicamente
          const items = (resp.data || []).slice().sort((a, b) => new Date(a.fecha_seguimiento) - new Date(b.fecha_seguimiento));
          setSeguimientos(items);
        }
      } catch (err) {
        if (!mounted) return;
        console.error(err);
        setError(err?.message || "Error en la petición");
        setSeguimientos([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [id]);

  const latestId = seguimientos.length ? seguimientos[seguimientos.length - 1].id_seguimiento : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) onClose && onClose(); }}
    >
      <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 relative">
        <button
          onClick={() => onClose && onClose()}
          aria-label="Cerrar"
          className="absolute top-4 right-4 text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          x
        </button>

        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
          Seguimiento - Oficio #{numero}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Línea de estados del documento (cronológico).
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1a4d2e]"></div>
          </div>
        ) : error ? (
          <div className="py-6">
            <ShowToast type="error" message={error} onClose={() => setError(null)} />
          </div>
        ) : seguimientos.length === 0 ? (
          <div className="py-8 text-center text-gray-600 dark:text-gray-300">No hay registros de seguimiento.</div>
        ) : (
          <div className="py-2">
            <div className="relative">
              {/* Línea vertical centrada */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 transform -translate-x-1/2"></div>

              <ul className="space-y-6">
                {seguimientos.map((s) => {
                  const isLatest = s.id_seguimiento === latestId;
                  return (
                    <li key={s.id_seguimiento} className="relative flex items-start">
                      {/* Círculo alineado verticalmente con el contenido */}
                      <div className="absolute left-0 top-4 transform -translate-x-1/2 z-10">
                        <div className={`w-3 h-3 rounded-full ${isLatest ? "bg-[#1a4d2e] ring-4 ring-[#1a4d2e]/20" : "bg-gray-400 ring-2 ring-gray-200 dark:ring-gray-600"}`}></div>
                      </div>

                      {/* Contenido alineado a la derecha del círculo */}
                      <div className="ml-8 flex-1">
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-sm font-semibold ${isLatest ? "text-[#1a4d2e] dark:text-green-300" : "text-gray-800 dark:text-gray-100"}`}>
                                  {s.estado_nuevo}
                                </span>
                                {isLatest && (
                                  <span className="px-2 py-0.5 bg-[#1a4d2e] text-white text-xs rounded-full">Actual</span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                por {s.usuario_asignado || "desconocido"}
                              </div>
                              {s.CIP && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  CIP: {s.CIP}
                                </div>
                              )}
                            </div>

                            <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                              {s.fecha_seguimiento ? new Date(s.fecha_seguimiento).toLocaleString() : "-"}
                            </div>
                          </div>

                          {s.estado_anterior && (
                            <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                              <span className="font-medium">Estado anterior: </span>{s.estado_anterior}
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

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => onClose && onClose()}
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default SeguimientoDeOficios;