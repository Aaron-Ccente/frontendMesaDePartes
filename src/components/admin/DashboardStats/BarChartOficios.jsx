import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BarChartOficios = ({ data = [] }) => {
  // días de la semana en orden (1=domingo ... 7=sábado)
  const week = [
    { num: 1, name: 'Domingo' },
    { num: 2, name: 'Lunes' },
    { num: 3, name: 'Martes' },
    { num: 4, name: 'Miércoles' },
    { num: 5, name: 'Jueves' },
    { num: 6, name: 'Viernes' },
    { num: 7, name: 'Sábado' },
  ];

  const mapByNum = new Map();
  (data || []).forEach(d => {
    const num = Number(d.dia_semana_num);
    if (!isNaN(num)) {
      mapByNum.set(num, Number(d.cantidad_oficios) || 0);
    }
  });

  // Rellenar todos los días
  const formattedData = week.map(w => ({
    dia_semana_num: w.num,
    dia_semana_nombre: w.name,
    cantidad_oficios: mapByNum.has(w.num) ? mapByNum.get(w.num) : 0
  }));

  const colors = [
    "#ef4444", // domingo
    "#f97316", // lunes
    "#f59e0b", // martes
    "#10b981", // miércoles
    "#3b82f6", // jueves
    "#8b5cf6", // viernes
    "#ec4899", // sábado
  ];

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart
          data={formattedData}
          margin={{
            top: 5,
            right: 10,
            left: 0,
            bottom: 40,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="dia_semana_nombre" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} />
          <Tooltip formatter={(value) => [`${value} oficios`, 'Cantidad']} />
          <Bar dataKey="cantidad_oficios">
            {formattedData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartOficios;