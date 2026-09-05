import type { LucideIcon } from 'lucide-react';

type Trend = { value: string; positive: boolean };

export default function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  iconBg,
  iconColor,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: Trend;
  iconBg?: string;
  iconColor?: string;
}) {
  return (
    <div className="bg-zinc-900 border border-white/10 rounded-sm p-5">
      <div className="flex items-start justify-between">
        <div
          className={`w-10 h-10 rounded-sm flex items-center justify-center ${iconBg || 'bg-accent/15'}`}
        >
          <Icon size={18} className={iconColor || 'text-accent'} />
        </div>
        {trend && (
          <span className={`text-xs font-semibold ${trend.positive ? 'text-green-400' : 'text-red-400'}`}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <p className="text-2xl font-heading font-bold mt-4">{value}</p>
      <p className="text-sm text-gray-400 mt-1">{label}</p>
    </div>
  );
}
