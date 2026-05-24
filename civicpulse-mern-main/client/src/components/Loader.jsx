const Loader = ({ fullScreen = false, text = 'Loading...' }) => {
  const wrapperClass = fullScreen
    ? 'flex min-h-[60vh] flex-col items-center justify-center gap-3'
    : 'flex items-center justify-center gap-2 py-8';

  return (
    <div className={wrapperClass}>
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600"
        role="status"
        aria-label="Loading"
      />
      <p className="text-sm text-slate-500">{text}</p>
    </div>
  );
};

export default Loader;
