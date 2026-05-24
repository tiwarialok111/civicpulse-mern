const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
  resolved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
};

const STATUS_LABELS = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
};

const StatusBadge = ({ status }) => {
  const style = STATUS_STYLES[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  const label = STATUS_LABELS[status] || status;

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${style}`}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
