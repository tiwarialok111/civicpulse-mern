import StatusBadge from '../StatusBadge';
import { formatDate } from '../../utils/formatDate';

const ComplaintsTable = ({
  complaints,
  onView,
  onMarkResolved,
  onQuickStatusChange,
  updatingId,
}) => {
  if (!complaints.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
        <p className="text-4xl">📭</p>
        <p className="mt-3 font-medium text-slate-900">No complaints found</p>
        <p className="mt-1 text-sm text-slate-500">Try changing your filters or search term.</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Reported By</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {complaints.map((c) => (
              <tr key={c._id} className="hover:bg-slate-50">
                <td className="max-w-[180px] truncate px-4 py-3 font-medium text-slate-900">
                  {c.title}
                </td>
                <td className="px-4 py-3 text-slate-600">{c.category}</td>
                <td className="px-4 py-3">
                  <select
                    value={c.status}
                    onChange={(e) => onQuickStatusChange(c._id, e.target.value)}
                    disabled={updatingId === c._id}
                    className="rounded border border-slate-300 px-2 py-1 text-xs"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-slate-600">{c.reportedBy?.name || '—'}</td>
                <td className="px-4 py-3 text-slate-500">{formatDate(c.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onView(c)}
                      className="text-emerald-600 hover:underline"
                    >
                      View
                    </button>
                    {c.status !== 'resolved' && (
                      <button
                        type="button"
                        onClick={() => onMarkResolved(c)}
                        disabled={updatingId === c._id}
                        className="text-slate-600 hover:underline disabled:opacity-50"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {complaints.map((c) => (
          <div key={c._id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-slate-900">{c.title}</h3>
              <StatusBadge status={c.status} />
            </div>
            <p className="mt-1 text-xs text-slate-500">{c.category}</p>
            <p className="mt-2 text-sm text-slate-600">By {c.reportedBy?.name}</p>
            <p className="text-xs text-slate-400">{formatDate(c.createdAt)}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onView(c)}
                className="rounded-lg border border-emerald-600 px-3 py-1.5 text-xs font-medium text-emerald-600"
              >
                View Details
              </button>
              {c.status !== 'resolved' && (
                <button
                  type="button"
                  onClick={() => onMarkResolved(c)}
                  disabled={updatingId === c._id}
                  className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                >
                  Mark Resolved
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ComplaintsTable;
