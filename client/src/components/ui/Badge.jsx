const STATUS_CONFIG = {
  pending: { label: 'Pending', classes: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
  'in-progress': { label: 'In Progress', classes: 'bg-blue-100 text-blue-800 border-blue-200', dot: 'bg-blue-500' },
  resolved: { label: 'Resolved', classes: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' },
  rejected: { label: 'Rejected', classes: 'bg-red-100 text-red-800 border-red-200', dot: 'bg-red-500' },
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', classes: 'bg-slate-100 text-slate-700 border-slate-200' },
  medium: { label: 'Medium', classes: 'bg-blue-100 text-blue-700 border-blue-200' },
  high: { label: 'High', classes: 'bg-amber-100 text-amber-700 border-amber-200' },
  urgent: { label: 'Urgent', classes: 'bg-red-100 text-red-700 border-red-200' },
};

const CATEGORY_CONFIG = {
  'Road Damage': { icon: '🛣️', classes: 'bg-orange-100 text-orange-700 border-orange-200' },
  'Garbage': { icon: '🗑️', classes: 'bg-green-100 text-green-700 border-green-200' },
  'Water Leakage': { icon: '💧', classes: 'bg-blue-100 text-blue-700 border-blue-200' },
  'Street Light': { icon: '💡', classes: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  'Drainage': { icon: '🚰', classes: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  'Traffic': { icon: '🚦', classes: 'bg-red-100 text-red-700 border-red-200' },
};

export const StatusBadge = ({ status, size = 'md' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5';
  return (
    <span className={`inline-flex items-center font-semibold rounded-full border ${config.classes} ${sizeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} flex-shrink-0`} />
      {config.label}
    </span>
  );
};

export const PriorityBadge = ({ priority, size = 'md' }) => {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';
  return (
    <span className={`inline-flex items-center font-semibold rounded-full border uppercase tracking-wide ${config.classes} ${sizeClass}`}>
      {config.label}
    </span>
  );
};

export const CategoryBadge = ({ category, size = 'md' }) => {
  const config = CATEGORY_CONFIG[category] || { icon: '📋', classes: 'bg-slate-100 text-slate-700 border-slate-200' };
  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5';
  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${config.classes} ${sizeClass}`}>
      <span>{config.icon}</span>
      {category}
    </span>
  );
};

export const RoleBadge = ({ role }) => {
  const isAdmin = role === 'admin';
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${isAdmin ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
      {isAdmin ? '🛡️ Admin' : '👤 Citizen'}
    </span>
  );
};

export const Badge = ({ children, color = 'slate', size = 'md', className = '' }) => {
  const colors = {
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    red: 'bg-red-100 text-red-700 border-red-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
  };
  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';
  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${colors[color]} ${sizeClass} ${className}`}>
      {children}
    </span>
  );
};

export default StatusBadge;
