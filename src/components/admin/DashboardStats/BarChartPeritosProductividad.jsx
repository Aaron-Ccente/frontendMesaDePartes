import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const BarChartPeritosProductividad = ({ data }) => {
  const formattedData = data.map(d => ({
    ...d,
    acciones_realizadas: Number(d.acciones_realizadas)
  }));

  const getColor = (acciones) => {
    if (acciones === 0) return "#ef4444"; // rojo
    if (acciones <= 2) return "#f59e0b"; // amarillo
    if (acciones <= 4) return "#10b981"; // verde
    return "#3b82f6"; // azul
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={formattedData}
        margin={{
          top: 5,
          right: 30,
          left: 0,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="nombre_completo" 
          angle={-45}
          textAnchor="end"
          height={80}
          interval={0}
          tick={{ fontSize: 12 }}
        />
        <YAxis />
        <Tooltip 
          contentStyle={{
            backgroundColor: '#f3f4f6',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
          }}
          formatter={(value) => [`${value} acciones`, 'Productividad']}
        />
        <Bar 
          dataKey="acciones_realizadas"
          name="Productividad"
        >
          {formattedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColor(entry.acciones_realizadas)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
export default BarChartPeritosProductividad;