import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const BarChartOficios = ({ data }) => {
  // Asegurar que cantidad_oficios sea número
  const formattedData = data.map(d => ({
    ...d,
    cantidad_oficios: Number(d.cantidad_oficios)
  }));

  return (
    <BarChart
      width={500}
      height={300}
      data={formattedData}
      margin={{
        top: 5,
        right: 0,
        left: 0,
        bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      
      {/* Mostrar el nombre del día en el eje X */}
      <XAxis dataKey="dia_semana_nombre" />

      <YAxis />

      <Tooltip />
      <Legend />

      {/* Cantidad de oficios como valor de la barra */}
      <Bar 
        dataKey="cantidad_oficios" 
        fill="#4ade80" 
        activeBar={<Rectangle fill="#22c55e" stroke="#166534" />} 
        name="Cantidad de oficios"
      />
    </BarChart>
  );
};

export default BarChartOficios;
