import { Cell, Pie, PieChart } from 'recharts';

const COLORS = ['#10B981', '#EF4444']; // Verde para activos, Rojo para inactivos claro pi
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
    <text x={x} y={y} fill="white" textAnchor={x > ncx ? 'start' : 'end'} dominantBaseline="central">
      {`${((percent ?? 1) * 100).toFixed(0)}%`}
    </text>
  );
};

export default function UsersPieChart({ usuariosActivos, isAnimationActive = true }) {
  // Preparar datos
  const getChartData = () => {
    if (!usuariosActivos || usuariosActivos.length === 0) {
      return [
        { name: 'Activos', value: 0 },
        { name: 'Inactivos', value: 0 }
      ];
    }

    const totalSistema = Number(usuariosActivos[0]?.total_usuarios_sistema) || 0;
    const usuariosActivosCount = usuariosActivos.length;
    const usuariosInactivosCount = Math.max(0, totalSistema - usuariosActivosCount);

    return [
      { name: 'Activos', value: usuariosActivosCount },
      { name: 'Inactivos', value: usuariosInactivosCount }
    ];
  };

  const data = getChartData();
  const totalUsuarios = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex flex-col items-center">
      <PieChart style={{ width: '100%', maxWidth: '400px', maxHeight: '60vh', aspectRatio: 1 }} responsive>
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
      </PieChart>
      
      {/* Leyenda */}
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {data.map((entry, index) => (
          <div key={entry.name} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {entry.name}: {entry.value} ({totalUsuarios > 0 ? ((entry.value / totalUsuarios) * 100).toFixed(1) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}