// src/components/Charts/BarChart.tsx
interface Props {
    data: any[];
    xAxisKey: string;
    yAxisKey: string;
    colors?: string[];
  }
  
  const BarChartComponent: React.FC<Props> = ({
    data,
    xAxisKey,
    yAxisKey,
    colors = ["#8884d8"],
  }) => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
        <Bar dataKey={yAxisKey} fill={colors[0]} />
      </BarChart>
    </ResponsiveContainer>
  );
  
  export default BarChartComponent;
  