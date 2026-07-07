export const StatsCard = ({
  label,
  value,
  icon,
  trend,
  trendLabel,
  color = 'emerald',
  loading = false,
  className = '',
}) => {
  const colorMap = {
    emerald: {
      icon: 'bg-emerald-100 text-emerald-600',
      trend: trend > 0 ? 'text-emerald-600' : 'text-red-500',
      badge: 'bg-emerald-50 border-emerald-100',
      value: 'text-slate-900',
    },
    blue: {
      icon: 'bg-blue-100 text-blue-600',
      trend: trend > 0 ? 'text-emerald-600' : 'text-red-500',
      badge: 'bg-blue-50 border-blue-100',
      value: 'text-slate-900',
    },
    amber: {
      icon: 'bg-amber-100 text-amber-600',
      trend: trend > 0 ? 'text-emerald-600' : 'text-red-500',
      badge: 'bg-amber-50 border-amber-100',
      value: 'text-slate-900',
    },
    red: {
      icon: 'bg-red-100 text-red-600',
      trend: trend > 0 ? 'text-emerald-600' : 'text-red-500',
      badge: 'bg-red-50 border-red-100',
      value: 'text-slate-900',
    },
    purple: {
      icon: 'bg-purple-100 text-purple-600',
      trend: trend > 0 ? 'text-emerald-600' : 'text-red-500',
      badge: 'bg-purple-50 border-purple-100',
      value: 'text-slate-900',
    },
    slate: {
      icon: 'bg-slate-100 text-slate-600',
      trend: trend > 0 ? 'text-emerald-600' : 'text-red-500',
      badge: 'bg-slate-50 border-slate-100',
      value: 'text-slate-900',
    },
  };

  const c = colorMap[color] || colorMap.emerald;

  if (loading) {
    return (
      <div className={`card p-5 space-y-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="skeleton h-3 w-24 rounded" />
          <div className="skeleton h-9 w-9 rounded-xl" />
        </div>
        <div className="skeleton h-8 w-20 rounded" />
        <div className="skeleton h-3 w-28 rounded" />
      </div>
    );
  }

  return (
    <div className={`card p-5 group card-interactive ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
          <p className={`mt-2 text-3xl font-extrabold tracking-tight ${c.value}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
        {icon && (
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl flex-shrink-0 ${c.icon} transition-transform duration-300 group-hover:scale-110`}>
            {icon}
          </div>
        )}
      </div>
      {(trend !== undefined || trendLabel) && (
        <div className="mt-3 flex items-center gap-1.5">
          {trend !== undefined && (
            <span className={`text-xs font-semibold flex items-center gap-0.5 ${c.trend}`}>
              {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'}
              {Math.abs(trend)}%
            </span>
          )}
          {trendLabel && (
            <span className="text-xs text-slate-400">{trendLabel}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatsCard;
