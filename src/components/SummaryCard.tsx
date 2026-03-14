interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color?: 'emerald' | 'gold' | 'blue' | 'red';
  subtitle?: string;
}

const colorMap = {
  emerald: {
    border: 'border-emerald-500/20',
    iconBg: 'bg-emerald-500/10',
    valueColor: 'text-emerald-400',
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.08)]',
  },
  gold: {
    border: 'border-yellow-500/20',
    iconBg: 'bg-yellow-500/10',
    valueColor: 'text-yellow-400',
    glow: 'shadow-[0_0_20px_rgba(212,175,55,0.08)]',
  },
  blue: {
    border: 'border-blue-500/20',
    iconBg: 'bg-blue-500/10',
    valueColor: 'text-blue-400',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.08)]',
  },
  red: {
    border: 'border-red-500/20',
    iconBg: 'bg-red-500/10',
    valueColor: 'text-red-400',
    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.08)]',
  },
};

export default function SummaryCard({
  title,
  value,
  icon,
  color = 'emerald',
  subtitle,
}: SummaryCardProps) {
  const colors = colorMap[color];
  return (
    <div
      className={`glass-card card-hover rounded-2xl p-5 border ${colors.border} ${colors.glow}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">{title}</p>
          <p className={`text-2xl sm:text-3xl font-bold ${colors.valueColor}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`${colors.iconBg} p-3 rounded-xl`}>{icon}</div>
      </div>
    </div>
  );
}
