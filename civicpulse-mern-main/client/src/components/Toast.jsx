const Toast = ({ message, type = 'success', onClose }) => {
  if (!message) return null;

  const styles =
    type === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : 'border-red-200 bg-red-50 text-red-800';

  return (
    <div
      className={`fixed right-4 top-20 z-[100] flex max-w-sm items-start gap-3 rounded-lg border px-4 py-3 shadow-lg ${styles}`}
      role="alert"
    >
      <p className="flex-1 text-sm font-medium">{message}</p>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-lg leading-none opacity-60 hover:opacity-100"
          aria-label="Close"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Toast;
