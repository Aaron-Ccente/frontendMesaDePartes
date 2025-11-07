import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

const data = [
  { name: 'Alta', cantidad: 10, color: '#EF4444' },
  { name: 'Media', cantidad: 8, color: '#F59E0B' },
  { name: 'Baja', cantidad: 12, color: '#10B981' },
  { name: 'Crítica', cantidad: 5, color: '#7C3AED' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const totalOficios = data.reduce((sum, item) => sum + item.cantidad, 0);
    return (
      <div className="bg-gray-900 dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-700">
        <p className="text-white font-semibold">{`Prioridad: ${label}`}</p>
        <p className="text-green-400">
          {`Cantidad: ${payload[0].value} oficios`}
        </p>
        <p className="text-gray-300 text-sm">
          {`${((payload[0].value / totalOficios) * 100).toFixed(1)}% del total`}
        </p>
      </div>
    );
  }
  return null;
};

const HorizontalBarChartPrioridades = ({ isAnimationActive = true }) => {
  const totalOficios = data.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Contenedor con dimensiones FIJAS */}
      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis 
              type="number" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              width={60}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fontWeight: 'bold', fill: '#374151' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="cantidad" 
              name="Oficios por Prioridad"
              radius={[0, 4, 4, 0]}
              isAnimationActive={isAnimationActive}
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-in-out"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  stroke={entry.color}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: item.color }} 
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {item.name}: {item.cantidad} ({totalOficios > 0 ? ((item.cantidad / totalOficios) * 100).toFixed(1) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HorizontalBarChartPrioridades;