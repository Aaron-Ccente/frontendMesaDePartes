import { useEffect, useState, useMemo } from "react";
import MesaDePartes from "../../services/mesadepartesService";
import Usuarios from "../../assets/icons/Usuarios";
import SeguimientoDeOficios from "./DocumentManagement/SeguimientoDeOficios";

const DocumentManagement = () => {
  const [seguimientos, setSeguimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // filtros
  const [filterNumero, setFilterNumero] = useState("");
  const [filterPerito, setFilterPerito] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [selectedOficioId, setSelectedOficioId] = useState({ id_oficio: null, numero_oficio: null });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await MesaDePartes.getCasos();
        if (!mounted) return;
        if (!resp || !resp.success) {
          setError(resp?.message || "Error al obtener seguimientos");
          setSeguimientos([]);
        } else {
          setSeguimientos(resp.data || []);
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
  }, []);

  const filtered = useMemo(() => {
    const numero = filterNumero.trim().toLowerCase();
    const perito = filterPerito.trim().toLowerCase();
    const estado = filterEstado.trim().toLowerCase();

    return seguimientos.filter((s) => {
      const n = (s.numero_oficio || "").toString().toLowerCase();
      const p = (s.perito_asignado || "").toString().toLowerCase();
      const e = (s.estado_actual || "").toString().toLowerCase();

      if (numero && !n.includes(numero)) return false;
      if (perito && !p.includes(perito)) return false;
      if (estado && !e.includes(estado)) return false;
      return true;
    });
  }, [seguimientos, filterNumero, filterPerito, filterEstado]);

  // abrir seguimiento
  const openSeguimiento = (id_oficio, numero_oficio) => {
    setSelectedOficioId({ id_oficio, numero_oficio });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-[#1a4d2e] dark:text-green-400 mb-2">
          Gestión de Documentos
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Ver el seguimiento de oficios registrados
        </p>
      </div>

      {/* Tabla para ver estados actuales e información adicional de oficios para el admin */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">Número de oficio</label>
            <input
              value={filterNumero}
              onChange={(e) => setFilterNumero(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
              placeholder="Buscar por número"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">Perito asignado</label>
            <input
              value={filterPerito}
              onChange={(e) => setFilterPerito(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
              placeholder="Buscar por perito"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300 block mb-1">Estado</label>
            <input
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
              placeholder="Buscar por estado"
            />
          </div>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d2e]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-300">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="flex justify-center mb-4"><Usuarios size={12} /></div>
            <p>No hay registros que coincidan con los filtros.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Número</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha creación</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Asunto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Administrado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Perito asignado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado actual</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filtered.map((row, idx) => (
                  <tr
                    key={(row.id_oficio || row.numero_oficio) + "-" + idx}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-150"
                    onClick={() => openSeguimiento(row.id_oficio, row.numero_oficio)}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-200">{row.numero_oficio}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {row.fecha_creacion ? new Date(row.fecha_creacion).toLocaleString('es-PE') : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200 max-w-xs truncate">{row.asunto || "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200">{row.administrado || "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200">{row.perito_asignado || "-"}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {row.estado_actual === "CREACION DEL OFICIO" ? "ENTRADA" : row.estado_actual}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal seguimiento */}
      {selectedOficioId.id_oficio && (
        <SeguimientoDeOficios 
          id_oficio={selectedOficioId.id_oficio} 
          numero={selectedOficioId.numero_oficio} 
          onClose={() => setSelectedOficioId({ id_oficio: null, numero_oficio: null })} 
        />
      )}
    </div>
  );
};

export default DocumentManagement;
