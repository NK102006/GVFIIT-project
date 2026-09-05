import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export type StatusSlice = {
  name: string;
  value: number;
  color: string;
};

export default function MembershipDonut({ data, total }: { data: StatusSlice[]; total: number }) {
  const nonZero = data.filter((d) => d.value > 0);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative w-40 h-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={nonZero.length ? nonZero : [{ name: 'None', value: 1, color: '#3f3f46' }]}
              dataKey="value"
              nameKey="name"
              innerRadius={52}
              outerRadius={72}
              paddingAngle={nonZero.length > 1 ? 3 : 0}
              stroke="none"
            >
              {(nonZero.length ? nonZero : [{ name: 'None', value: 1, color: '#3f3f46' }]).map((slice, i) => (
                <Cell key={i} fill={slice.color} />
              ))}
            </Pie>
            {nonZero.length > 0 && (
              <Tooltip
                contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4 }}
                itemStyle={{ color: '#fff', fontSize: 12 }}
                labelStyle={{ display: 'none' }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-heading font-bold">{total}</span>
          <span className="text-[10px] text-gray-500 uppercase tracking-wide">Total</span>
        </div>
      </div>

      <div className="space-y-2 w-full">
        {data.map((slice) => (
          <div key={slice.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: slice.color }} />
              <span className="text-gray-300">{slice.name}</span>
            </div>
            <span className="text-gray-400">
              {slice.value} {total > 0 && <span className="text-gray-600">({Math.round((slice.value / total) * 100)}%)</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
