const ComplaintCardSkeleton = () => {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="h-5 w-2/3 rounded bg-slate-200" />
        <div className="h-5 w-20 rounded-full bg-slate-200" />
      </div>
      <div className="mt-3 h-4 w-24 rounded bg-slate-200" />
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded bg-slate-200" />
        <div className="h-3 w-4/5 rounded bg-slate-200" />
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-16 w-16 rounded-lg bg-slate-200" />
        <div className="h-16 w-16 rounded-lg bg-slate-200" />
      </div>
      <div className="mt-4 h-9 w-32 rounded-lg bg-slate-200" />
    </div>
  );
};

export default ComplaintCardSkeleton;
