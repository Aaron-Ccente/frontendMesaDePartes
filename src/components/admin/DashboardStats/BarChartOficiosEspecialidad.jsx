import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BarChartOficiosEspecialidad = ({ data }) => {
  let processedData = [];

  if (!data || data.length === 0) {
    processedData = [];
  } else if (Array.isArray(data[0]) && data.length > 1) {
    const conCantidad = Array.isArray(data[0]) ? data[0] : [];
    const todas = Array.isArray(data[1]) ? data[1] : [];
    const cantidadMap = new Map();
    conCantidad.forEach(item => {
      const name = (item?.especialidad || '').trim();
      if (name) cantidadMap.set(name, Number(item?.cantidad_oficios) || 0);
    });

    const seen = new Set();
    const ordered = [];

    todas.forEach(item => {
      const name = (item?.especialidad || '').trim();
      if (name && !seen.has(name)) {
        seen.add(name);
        ordered.push(name);
      }
    });

    conCantidad.forEach(item => {
      const name = (item?.especialidad || '').trim();
      if (name && !seen.has(name)) {
        seen.add(name);
        ordered.push(name);
      }
    });

    processedData = ordered.map(name => ({
      especialidad: name,
      cantidad_oficios: cantidadMap.get(name) || 0
    }));
  } else {
    // Intentar tratar data como lista plana
    processedData = (data || []).map(item => ({
      especialidad: (item?.especialidad || '').trim(),
      cantidad_oficios: Number(item?.cantidad_oficios) || 0
    }));
  }

  // Colores para especialidades
  const colors = [
    "#3b82f6", // azul
    "#10b981", // verde
    "#f59e0b", // amarillo
    "#ef4444", // rojo
    "#8b5cf6", // morado
    "#ec4899", // rosado
  ];

  // Si no hay datos válidos
  if (processedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
        No hay datos disponibles
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={processedData}
        margin={{
          top: 5,
          right: 30,
          left: 0,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="especialidad"
          angle={-45}
          textAnchor="end"
          height={100}
          interval={0}
          tick={{ fontSize: 11 }}
        />
        <YAxis />
        <Tooltip
          contentStyle={{
            backgroundColor: '#f3f4f6',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
          }}
          formatter={(value) => [`${value} oficios`, 'Cantidad']}
        />

        <Bar
          dataKey="cantidad_oficios"
        >
          {processedData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarChartOficiosEspecialidad;