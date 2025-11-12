import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

// Paleta de colores
const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#7C3AED', '#EC4899'];

const CustomTooltip = ({ active, payload, label, total }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-700">
        <p className="text-white font-semibold">{`Prioridad: ${label}`}</p>
        <p className="text-green-400">
          {`Cantidad: ${payload[0].value} oficios`}
        </p>
        <p className="text-gray-300 text-sm">
          {`${((payload[0].value / total) * 100).toFixed(1)}% del total`}
        </p>
      </div>
    );
  }
  return null;
};

const SimpleBarChart = ({ data = [], isAnimationActive = true }) => {
  // prepara los datos
  const parsedData = data.map((item, index) => ({
    name: item.nombre,
    cantidad: Number(item.cantidad) || 0,
    color: COLORS[index % COLORS.length],
  }));

  const totalOficios = parsedData.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <div className="flex flex-col items-center w-full px-6">
      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={parsedData}
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
              width={100}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fontWeight: 'bold', fill: '#374151' }}
            />
            <Tooltip content={<CustomTooltip total={totalOficios} />} />
            <Bar 
              dataKey="cantidad" 
              name="Oficios por Prioridad"
              radius={[0, 4, 4, 0]}
              isAnimationActive={isAnimationActive}
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-in-out"
            >
              {parsedData.map((entry, index) => (
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
        {parsedData.map((item, index) => (
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

export default SimpleBarChart;