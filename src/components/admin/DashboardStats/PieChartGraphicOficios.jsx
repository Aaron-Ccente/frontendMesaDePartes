import { Cell, Pie, PieChart, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899'];
const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (cx == null || cy == null || innerRadius == null || outerRadius == null) {
    return null;
  }
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const ncx = Number(cx);
  const x = ncx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
  const ncy = Number(cy);
  const y = ncy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > ncx ? 'start' : 'end'} dominantBaseline="central" fontSize="12" fontWeight="bold">
      {`${((percent ?? 1) * 100).toFixed(0)}%`}
    </text>
  );
};

export default function PieChartGraphicOficios({ estadosDeOficios, isAnimationActive = true }) {
  // Preparar datos
  const getChartData = () => {
    if (!estadosDeOficios || estadosDeOficios.length === 0) {
      return [];
    }

    return estadosDeOficios.map(item => ({
      name: item.estado_final || 'Desconocido',
      value: Number(item.cantidad) || 0
    }));
  };

  const data = getChartData();
  const totalOficios = data.reduce((sum, item) => sum + item.value, 0);

  // Si no hay datos, mostrar mensaje
  if (data.length === 0 || totalOficios === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No hay datos disponibles
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={140}
            fill="#8884d8"
            dataKey="value"
            isAnimationActive={isAnimationActive}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#f3f4f6',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              color: '#111827'
            }}
            formatter={(value) => [`${value} oficios`, 'Cantidad']}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Leyenda */}
      <div className="flex flex-wrap justify-center gap-4 mt-6 px-4">
        {data.map((entry, index) => (
          <div key={entry.name} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {entry.name}: {entry.value} ({totalOficios > 0 ? ((entry.value / totalOficios) * 100).toFixed(1) : 0}%)
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}