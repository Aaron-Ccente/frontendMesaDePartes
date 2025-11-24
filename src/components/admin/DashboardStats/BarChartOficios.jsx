import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const BarChartOficios = ({ data }) => {
  const formattedData = data.map(d => ({
    ...d,
    cantidad_oficios: Number(d.cantidad_oficios)
  }));

  // Colores para cada día (domingo a sábado)
  const colors = [
    "#ef4444", // domingo - rojo
    "#f97316", // lunes - naranja
    "#f59e0b", // martes - amarillo
    "#10b981", // miércoles - verde
    "#3b82f6", // jueves - azul
    "#8b5cf6", // viernes - morado
    "#ec4899", // sábado - rosado
  ];

  return (
    <BarChart
      style={{ width: '100%', maxWidth: '400px', maxHeight: '60vh', aspectRatio: 1 }}
      width={400}
      height={300}
      data={formattedData}
      margin={{
        top: 5,
        right: 0,
        left: 0,
        bottom: 5,
      }}
      responsive
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="dia_semana_nombre" />
      <YAxis />
      <Tooltip />
      <Legend />

      <Bar 
        dataKey="cantidad_oficios" 
      >
        {formattedData.map((_, index) => (
          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
        ))}
      </Bar>
    </BarChart>
  );
};

export default BarChartOficios;
