import { useCallback, useEffect, useState } from 'react';
import ComplaintDetailModal from '../../components/admin/ComplaintDetailModal';
import ComplaintsTable from '../../components/admin/ComplaintsTable';
import Loader from '../../components/Loader';
import Toast from '../../components/Toast';
import {
  getAdminComplaints,
  updateComplaintStatus,
  updateComplaintPriority,
  deleteComplaintAdmin,
} from '../../services/adminService';

const CATEGORIES = [
  'Road Damage',
  'Garbage',
  'Water Leakage',
  'Street Light',
  'Drainage',
  'Traffic',
];

const ComplaintManagement = () => {
  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    search: '',
  });
  const [searchInput, setSearchInput] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
  };

  const loadComplaints = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError('');
      try {
        const response = await getAdminComplaints({
          page,
          limit: 10,
          status: filters.status || undefined,
          category: filters.category || undefined,
          priority: filters.priority || undefined,
          search: filters.search || undefined,
        });
        setComplaints(response.data.complaints);
        setPagination(response.data.pagination);
      } catch (err) {
        setError(err.message || 'Failed to load complaints.');
        setComplaints([]);
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    loadComplaints(1);
  }, [loadComplaints]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchInput.trim() }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleQuickStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      const remark = `Status changed quickly via dashboard to ${status}.`;
      await updateComplaintStatus(id, { status, remark });
      showToast(`Complaint status updated to ${status}!`);
      loadComplaints(pagination.page);
    } catch (err) {
      showToast(err.message || 'Failed to update status.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleQuickPriorityChange = async (id, priority) => {
    setUpdatingId(id);
    try {
      await updateComplaintPriority(id, { priority });
      showToast(`Complaint priority updated to ${priority}!`);
      loadComplaints(pagination.page);
    } catch (err) {
      showToast(err.message || 'Failed to update priority.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteComplaint = async (id) => {
    if (!window.confirm('Are you sure you want to delete this complaint? This action is permanent.')) {
      return;
    }
    setUpdatingId(id);
    try {
      await deleteComplaintAdmin(id);
      showToast('Complaint deleted successfully!');
      loadComplaints(1);
    } catch (err) {
      showToast(err.message || 'Failed to delete complaint.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMarkResolved = async (complaint) => {
    setUpdatingId(complaint._id);
    try {
      await updateComplaintStatus(complaint._id, {
        status: 'resolved',
        remark: 'Resolved via quick action.',
      });
      showToast('Complaint marked as resolved!');
      loadComplaints(pagination.page);
    } catch (err) {
      showToast(err.message || 'Failed to resolve complaint.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12 space-y-6">
      {toast.message && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Manage Complaints</h1>
          <p className="mt-1 text-sm text-slate-400">
            View, track, assign priority, and update statuses of all citizen issues.
          </p>
        </div>
      </div>

      {/* Filters Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-sm sm:p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">Filters & Search</h2>

        <form onSubmit={handleSearchSubmit} className="mb-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by title, description, or address..."
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-900"
          />
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800 text-slate-200 px-3 py-2 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800 text-slate-200 px-3 py-2 text-sm"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800 text-slate-200 px-3 py-2 text-sm"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="flex items-end">
            {(filters.status || filters.category || filters.priority || filters.search) && (
              <button
                type="button"
                onClick={() => {
                  setFilters({ status: '', category: '', priority: '', search: '' });
                  setSearchInput('');
                }}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Main Complaints List */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-16 space-y-4">
          <Loader text="Loading complaints..." />
        </div>
      ) : complaints.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900 py-16 text-center">
          <p className="text-4xl">📭</p>
          <p className="mt-3 font-semibold text-white">No complaints match your criteria</p>
          <p className="mt-1 text-sm text-slate-400">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Custom table with Priority and Status options */}
          <div className="hidden overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-sm md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-800/50 text-slate-300 font-semibold">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Reported By</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {complaints.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-800/50 transition">
                    <td className="max-w-[200px] truncate px-4 py-3 font-medium text-slate-200">
                      {c.title}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{c.category}</td>
                    <td className="px-4 py-3 text-slate-400">
                      <div>{c.reportedBy?.name || '—'}</div>
                      <div className="text-xs text-slate-400">{c.reportedBy?.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={c.priority || 'medium'}
                        onChange={(e) => handleQuickPriorityChange(c._id, e.target.value)}
                        disabled={updatingId === c._id}
                        className={`rounded-lg border px-2 py-1 text-xs font-semibold ${
                          c.priority === 'urgent'
                            ? 'bg-red-50 border-red-200 text-red-700'
                            : c.priority === 'high'
                            ? 'bg-amber-50 border-amber-200 text-amber-700'
                            : c.priority === 'medium'
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={c.status}
                        onChange={(e) => handleQuickStatusChange(c._id, e.target.value)}
                        disabled={updatingId === c._id}
                        className={`rounded-lg border px-2 py-1 text-xs font-semibold ${
                          c.status === 'resolved'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : c.status === 'rejected'
                            ? 'bg-red-50 border-red-200 text-red-700'
                            : c.status === 'in-progress'
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-amber-50 border-amber-200 text-amber-700'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3 items-center">
                        <button
                          type="button"
                          onClick={() => setSelectedComplaint(c)}
                          className="text-emerald-600 hover:text-emerald-800 font-semibold"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteComplaint(c._id)}
                          disabled={updatingId === c._id}
                          className="text-red-600 hover:text-red-800 font-semibold disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile layouts */}
          <div className="md:hidden space-y-3">
            {complaints.map((c) => (
              <div key={c._id} className="rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-slate-200">{c.title}</h3>
                    <p className="text-xs text-slate-400">{c.category}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                      c.priority === 'urgent'
                        ? 'bg-red-100 text-red-800'
                        : c.priority === 'high'
                        ? 'bg-amber-100 text-amber-800'
                        : c.priority === 'medium'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {c.priority || 'medium'}
                    </span>
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                      c.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : c.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : c.status === 'in-progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-slate-400">
                  <div>Reported By: {c.reportedBy?.name || '—'}</div>
                  <div>Address: {c.location?.address}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedComplaint(c)}
                    className="flex-1 rounded-lg border border-slate-700 py-2 text-center text-xs font-semibold text-slate-300 hover:bg-slate-800"
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteComplaint(c._id)}
                    className="rounded-lg border border-red-200 px-3 py-2 text-center text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => loadComplaints(pagination.page - 1)}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-slate-400">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </span>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => loadComplaints(pagination.page + 1)}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {selectedComplaint && (
        <ComplaintDetailModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onUpdated={() => loadComplaints(pagination.page)}
        />
      )}
    </div>
  );
};

export default ComplaintManagement;
