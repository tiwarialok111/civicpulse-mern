export const EmptyState = ({
  icon,
  title,
  description,
  action,
  compact = false,
}) => (
  <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-10 px-4' : 'py-16 px-6'}`}>
    {icon && (
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-4 text-3xl animate-bounce-sm">
        {icon}
      </div>
    )}
    <h3 className={`font-bold text-slate-900 ${compact ? 'text-base' : 'text-lg'}`}>{title}</h3>
    {description && (
      <p className={`mt-2 text-slate-500 max-w-sm ${compact ? 'text-xs' : 'text-sm'}`}>{description}</p>
    )}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export const ErrorState = ({ title = 'Something went wrong', description, onRetry }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-6">
    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-red-100 mb-4 text-3xl">
      ⚠️
    </div>
    <h3 className="text-lg font-bold text-slate-900">{title}</h3>
    {description && (
      <p className="mt-2 text-sm text-slate-500 max-w-sm">{description}</p>
    )}
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 underline underline-offset-2"
      >
        Try again
      </button>
    )}
  </div>
);

export default EmptyState;
