import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#10b981', '#ef4444', '#f59e0b'];

interface OutcomeChartProps {
  data: Record<string, number>;
}

export const OutcomeChart = ({ data }: OutcomeChartProps) => {
  const chartData = Object.entries(data).map(([name, value]) => ({ name, value }));

  if (chartData.every((d) => d.value === 0)) {
    return <p className="text-slate-500 text-center py-8">No application data yet</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};
