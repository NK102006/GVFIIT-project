import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

export default function MonthlyBarChart({
  labels,
  values,
  color = '#aa3bff',
}: {
  labels: string[];
  values: number[];
  color?: string;
}) {
  const data = labels.map((label, i) => ({ label, value: values[i] }));
  const allZero = values.every((v) => v === 0);

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis
            allowDecimals={false}
            tick={{ fill: '#71717a', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4 }}
            labelStyle={{ color: '#fff', fontSize: 12 }}
            itemStyle={{ color: '#d4d4d8', fontSize: 12 }}
          />
          <Bar dataKey="value" fill={color} radius={[3, 3, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
      {allZero && (
        <p className="text-center text-xs text-gray-600 -mt-40 relative">No data in this period yet</p>
      )}
    </div>
  );
}
