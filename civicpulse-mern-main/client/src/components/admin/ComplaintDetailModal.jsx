import { useState } from 'react';
import StatusBadge from '../StatusBadge';
import { formatDate } from '../../utils/formatDate';
import { updateComplaintStatus, updateComplaintPriority } from '../../services/adminService';

const STATUSES = ['pending', 'in-progress', 'resolved', 'rejected'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const ComplaintDetailModal = ({ complaint, onClose, onUpdated }) => {
  const [status, setStatus] = useState(complaint?.status || 'pending');
  const [priority, setPriority] = useState(complaint?.priority || 'medium');
  const [remark, setRemark] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!complaint) return null;

  const imageUrl = (img) => (typeof img === 'string' ? img : img?.url);

  const handleUpdate = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Update priority if it has changed
      if (priority !== complaint.priority) {
        await updateComplaintPriority(complaint._id, { priority });
      }

      // 2. Update status and remark
      await updateComplaintStatus(complaint._id, { status, remark: remark.trim() });

      onUpdated();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update complaint.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close modal"
      />
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-3xl font-light text-slate-400 hover:text-slate-600 focus:outline-none"
        >
          &times;
        </button>

        {/* Modal Header */}
        <div className="border-b border-slate-100 pb-4 pr-8">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{complaint.title}</h2>
            <StatusBadge status={complaint.status} />
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${
              complaint.priority === 'urgent'
                ? 'bg-red-100 text-red-800'
                : complaint.priority === 'high'
                ? 'bg-amber-100 text-amber-800'
                : complaint.priority === 'medium'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-slate-100 text-slate-800'
            }`}>
              {complaint.priority || 'medium'} priority
            </span>
          </div>
          <p className="mt-1.5 text-sm font-semibold text-emerald-600">{complaint.category}</p>
        </div>

        {/* Modal Body */}
        <div className="mt-6 space-y-6">
          {/* Main Info */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Description</h4>
                <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{complaint.description}</p>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Location Details</h4>
                <p className="mt-1 text-sm text-slate-700">{complaint.location?.address}</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  Latitude: {complaint.location?.latitude}, Longitude: {complaint.location?.longitude}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Citizen Reporter</h4>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {complaint.reportedBy?.name || 'Anonymous citizen'}
                </p>
                <p className="text-xs text-slate-500">{complaint.reportedBy?.email || 'No email'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Dates Info</h4>
                <p className="mt-1 text-sm text-slate-700">
                  <span className="font-medium text-slate-500">Reported:</span> {formatDate(complaint.createdAt)}
                </p>
                {complaint.resolvedAt && (
                  <p className="mt-1 text-sm text-emerald-700 font-medium">
                    Resolved on: {formatDate(complaint.resolvedAt)}
                  </p>
                )}
              </div>

              {complaint.images?.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Attached Photos</h4>
                  <div className="flex flex-wrap gap-2">
                    {complaint.images.map((img, i) => (
                      <a key={imageUrl(img) || i} href={imageUrl(img)} target="_blank" rel="noopener noreferrer">
                        <img
                          src={imageUrl(img)}
                          alt=""
                          className="h-16 w-16 rounded-lg object-cover border border-slate-200 hover:scale-105 transition"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timeline / Status History */}
          <div className="rounded-xl bg-slate-50 p-4 sm:p-5">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-3">Status Timeline History</h3>
            {complaint.statusHistory && complaint.statusHistory.length > 0 ? (
              <div className="relative border-l border-emerald-200 ml-2.5 pl-5 space-y-4">
                {complaint.statusHistory.map((history, idx) => (
                  <div key={history._id || idx} className="relative">
                    <span className="absolute -left-[26px] mt-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-slate-50" />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 uppercase bg-white border border-slate-200 rounded px-1.5 py-0.5">
                          {history.status}
                        </span>
                        <span className="text-xs text-slate-400">{formatDate(history.timestamp)}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600 font-medium">
                        Changed by: {history.changedBy?.name || 'System / Admin'}
                      </p>
                      {history.note && (
                        <p className="mt-1 text-xs italic bg-white border border-slate-100 rounded p-2 text-slate-500">
                          &ldquo;{history.note}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No timeline changes recorded yet. Status is pending.</p>
            )}
          </div>

          {/* Action Form / Dropdowns */}
          <div className="border-t border-slate-100 pt-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Review & Actions</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Assign Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Update Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Admin Remarks / Notes</label>
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="Add comments explaining status change, priority assignment, or instructions..."
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            {error && <p className="text-sm font-medium text-red-600">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdate}
                disabled={loading}
                className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? 'Saving Changes...' : 'Save Review'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetailModal;
