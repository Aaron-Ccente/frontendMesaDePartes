import { useState, useMemo } from "react";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Calendar from "../../../assets/icons/Calendar";

const COLORS = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];

export default function BarCharPeritosProductividadIndividual({ data = null }) {
  const [filtro, setFiltro] = useState("dia");

  const chartData = useMemo(() => {
    if (!data) return [];

    if (filtro === "mes") {
      return (data.productividadPorPeritoMes || []).map((it, i) => ({
        name: `${it.mes ?? "-"} / ${it.anio ?? "-"}`,
        value: Number(it.acciones_realizadas) || 0,
        label: it.nombre_completo ?? `Perito ${i + 1}`
      }));
    }

    if (filtro === "año" || filtro === "anio") {
      return (data.productividadPorPeritoAnio || []).map((it, i) => ({
        name: `${it.anio ?? "-"}`,
        value: Number(it.acciones_realizadas) || 0,
        label: it.nombre_completo ?? `Perito ${i + 1}`
      }));
    }

    // día (por defecto)
    return (data.productividadPorPerito || []).map((it, i) => {
      const raw = it.fecha ?? it.fecha_seguimiento ?? it.dia ?? null;
      const name = raw ? new Date(raw).toLocaleDateString("es-PE") : "-";
      return {
        name,
        value: Number(it.acciones_realizadas) || 0,
        label: it.nombre_completo ?? `Perito ${i + 1}`
      };
    });
  }, [data, filtro]);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
        No hay datos de productividad
      </div>
    );
  }

  const total = chartData.reduce((s, it) => s + (it.value || 0), 0);
  const showNoData = chartData.length === 0 || total === 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="text-sm text-gray-600 dark:text-gray-300">Ver por:</div>
        <div className="flex justify-center items-center gap-2 text-green-600 dark:text-green-500">
        <Calendar/>
        <select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="mb-0 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white text-gray-800"
        >
          <option value="dia">Día</option>
          <option value="mes">Mes</option>
          <option value="año">Año</option>
        </select>
        </div>
      </div>

      {showNoData ? (
        <div className="flex items-center justify-center h-52 text-gray-500 dark:text-gray-400">
          No hay acciones registradas
        </div>
      ) : (
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer>
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 0, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} interval={0} tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip formatter={(value) => [`${value} acciones`, "Acciones"]} />
              <Bar dataKey="value" fill="#3b82f6">
                {chartData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}