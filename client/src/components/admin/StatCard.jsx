const StatCard = ({ label, value, color = 'slate' }) => {
  const colors = {
    slate: 'border-slate-200 bg-white text-slate-900',
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
    blue: 'border-blue-200 bg-blue-50 text-blue-900',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    red: 'border-red-200 bg-red-50 text-red-900',
  };

  return (
    <div className={`rounded-xl border p-5 shadow-sm ${colors[color] || colors.slate}`}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value ?? 0}</p>
    </div>
  );
};

export default StatCard;
