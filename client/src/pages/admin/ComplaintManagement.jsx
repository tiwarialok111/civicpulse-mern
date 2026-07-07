import { useCallback, useEffect, useState } from 'react';
import {
  getAdminComplaints,
  updateComplaintStatus,
  updateComplaintPriority,
  deleteComplaintAdmin,
} from '../../services/adminService';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { Modal, ModalBody, ModalFooter } from '../../components/ui/Modal';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatDate';

const CATEGORIES = ['Road Damage', 'Garbage', 'Water Leakage', 'Street Light', 'Drainage', 'Traffic'];
const STATUSES = ['pending', 'in-progress', 'resolved', 'rejected'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const ComplaintManagement = () => {
  const toast = useToast();
  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', category: '', priority: '', search: '' });
  const [searchInput, setSearchInput] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [statusModal, setStatusModal] = useState(null); // { complaint, status }
  const [deleteModal, setDeleteModal] = useState(null); // complaint id
  const [remark, setRemark] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadComplaints = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await getAdminComplaints({
        page,
        limit: 10,
        status: filters.status || undefined,
        category: filters.category || undefined,
        priority: filters.priority || undefined,
        search: filters.search || undefined,
      });
      setComplaints(res.data.complaints || []);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error(err.message || 'Failed to load complaints.');
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadComplaints(1); }, [loadComplaints]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, search: searchInput.trim() }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ status: '', category: '', priority: '', search: '' });
    setSearchInput('');
  };

  const handleQuickPriorityChange = async (id, priority) => {
    setUpdatingId(id);
    try {
      await updateComplaintPriority(id, { priority });
      toast.success(`Priority updated to ${priority}!`);
      loadComplaints(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Failed to update priority.');
    } finally {
      setUpdatingId(null);
    }
  };

  const openStatusModal = (complaint, preStatus = '') => {
    setStatusModal({ complaint, status: preStatus || complaint.status });
    setRemark('');
  };

  const handleStatusUpdate = async () => {
    if (!statusModal) return;
    setActionLoading(true);
    try {
      await updateComplaintStatus(statusModal.complaint._id, { status: statusModal.status, remark: remark || `Status changed to ${statusModal.status}.` });
      toast.success(`Status updated to ${statusModal.status}!`);
      setStatusModal(null);
      loadComplaints(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal) return;
    setActionLoading(true);
    try {
      await deleteComplaintAdmin(deleteModal);
      toast.success('Complaint deleted successfully!');
      setDeleteModal(null);
      loadComplaints(pagination.page === 1 ? 1 : pagination.page);
    } catch (err) {
      toast.error(err.message || 'Failed to delete complaint.');
    } finally {
      setActionLoading(false);
    }
  };

  const exportCSV = () => {
    if (!complaints.length) return;
    const headers = ['Title', 'Category', 'Status', 'Priority', 'Reported By', 'Address', 'Date'];
    const rows = complaints.map((c) => [
      `"${c.title}"`,
      c.category,
      c.status,
      c.priority || 'medium',
      c.reportedBy?.name || 'Unknown',
      `"${c.location?.address || ''}"`,
      formatDate(c.createdAt),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `civicpulse-complaints-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported!');
  };

  const hasFilters = filters.status || filters.category || filters.priority || filters.search;

  return (
    <div className="space-y-5 pb-20 md:pb-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Complaint Management</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {loading ? 'Loading...' : `${pagination.total} complaint${pagination.total !== 1 ? 's' : ''} total`}
          </p>
        </div>
        <button
          onClick={exportCSV}
          disabled={loading || !complaints.length}
          className="inline-flex items-center gap-1.5 h-9 px-4 text-sm font-semibold text-emerald-400 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 disabled:opacity-40 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Export CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[160px]">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search title, description..."
              className="w-full pl-8 pr-3 h-9 text-sm bg-slate-900 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Status */}
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="h-9 pl-3 pr-7 text-sm bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:border-emerald-500 focus:outline-none appearance-none min-w-[120px]"
            >
              <option value="">All Status</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>)}
            </select>
            <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </div>

          {/* Category */}
          <div className="relative">
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="h-9 pl-3 pr-7 text-sm bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:border-emerald-500 focus:outline-none appearance-none min-w-[130px]"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </div>

          {/* Priority */}
          <div className="relative">
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="h-9 pl-3 pr-7 text-sm bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:border-emerald-500 focus:outline-none appearance-none min-w-[120px]"
            >
              <option value="">All Priority</option>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
            <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </div>

          <button type="submit" className="h-9 px-4 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-500 transition-colors">
            Search
          </button>

          {hasFilters && (
            <button type="button" onClick={clearFilters} className="h-9 px-3 text-sm text-slate-400 hover:text-white rounded-xl hover:bg-slate-700 transition-colors inline-flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[700px]">
            <thead className="bg-slate-900/60 border-b border-slate-700">
              <tr>
                {['Title & Description', 'Category', 'Reported By', 'Priority', 'Status', 'Date', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {loading ? (
                [1, 2, 3, 4, 5].map((n) => <TableRowSkeleton key={n} cols={7} />)
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState icon="📭" title="No complaints found" description={hasFilters ? 'Try adjusting your filters.' : 'No complaints submitted yet.'} compact />
                  </td>
                </tr>
              ) : complaints.map((c) => (
                <tr key={c._id} className="hover:bg-slate-700/30 transition-colors group">
                  <td className="px-4 py-3.5 max-w-[200px]">
                    <p className="font-semibold text-slate-200 truncate text-sm">{c.title}</p>
                    {c.location?.address && (
                      <p className="text-xs text-slate-500 truncate mt-0.5">📍 {c.location.address}</p>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <CategoryBadge category={c.category} size="sm" />
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm text-slate-300 font-medium">{c.reportedBy?.name || '—'}</p>
                    <p className="text-xs text-slate-500 truncate max-w-[130px]">{c.reportedBy?.email}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="relative">
                      <select
                        value={c.priority || 'medium'}
                        onChange={(e) => handleQuickPriorityChange(c._id, e.target.value)}
                        disabled={updatingId === c._id}
                        className="text-xs font-semibold appearance-none pr-5 pl-2 py-1 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-200 focus:border-emerald-500 focus:outline-none disabled:opacity-50 cursor-pointer"
                      >
                        {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                      </select>
                      <svg className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={c.status} size="sm" />
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs text-slate-400">{formatDate(c.createdAt)}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedComplaint(c)}
                        className="h-7 px-2.5 text-xs font-semibold text-emerald-400 bg-emerald-900/30 border border-emerald-800 rounded-lg hover:bg-emerald-900/50 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => openStatusModal(c)}
                        className="h-7 px-2.5 text-xs font-semibold text-blue-400 bg-blue-900/30 border border-blue-800 rounded-lg hover:bg-blue-900/50 transition-colors"
                      >
                        Status
                      </button>
                      <button
                        onClick={() => setDeleteModal(c._id)}
                        className="h-7 px-2.5 text-xs font-semibold text-red-400 bg-red-900/20 border border-red-900 rounded-lg hover:bg-red-900/40 transition-colors"
                      >
                        Del
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden p-3 space-y-3">
          {loading ? (
            [1, 2, 3].map((n) => <div key={n} className="bg-slate-900 rounded-xl p-4 space-y-3 animate-pulse"><div className="h-4 bg-slate-700 rounded w-3/4" /><div className="h-3 bg-slate-700 rounded w-1/2" /></div>)
          ) : complaints.length === 0 ? (
            <EmptyState icon="📭" title="No complaints found" description="Try adjusting filters." compact />
          ) : complaints.map((c) => (
            <div key={c._id} className="bg-slate-900 rounded-xl border border-slate-700 p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-200 text-sm truncate">{c.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{c.reportedBy?.name} · {formatDate(c.createdAt)}</p>
                </div>
                <StatusBadge status={c.status} size="sm" />
              </div>
              <div className="flex gap-2 flex-wrap">
                <CategoryBadge category={c.category} size="sm" />
                <PriorityBadge priority={c.priority} size="sm" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setSelectedComplaint(c)} className="flex-1 h-8 text-xs font-semibold text-emerald-400 bg-emerald-900/30 border border-emerald-800 rounded-lg hover:bg-emerald-900/50 transition-colors">
                  View
                </button>
                <button onClick={() => openStatusModal(c)} className="flex-1 h-8 text-xs font-semibold text-blue-400 bg-blue-900/30 border border-blue-800 rounded-lg hover:bg-blue-900/50 transition-colors">
                  Update Status
                </button>
                <button onClick={() => setDeleteModal(c._id)} className="h-8 px-3 text-xs font-semibold text-red-400 bg-red-900/20 border border-red-900 rounded-lg hover:bg-red-900/40 transition-colors">
                  Del
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="[&>*]:text-slate-300 [&_button]:bg-slate-800 [&_button]:border-slate-700 [&_button:hover]:bg-slate-700">
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={(p) => loadComplaints(p)} loading={loading} />
      </div>

      {/* Detail View Modal */}
      <Modal open={!!selectedComplaint} onClose={() => setSelectedComplaint(null)} title={selectedComplaint?.title} size="lg">
        {selectedComplaint && (
          <>
            <ModalBody className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={selectedComplaint.status} />
                <PriorityBadge priority={selectedComplaint.priority} />
                <CategoryBadge category={selectedComplaint.category} />
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</p>
                  <p className="text-slate-700 leading-relaxed">{selectedComplaint.description}</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Reported By</p>
                    <p className="text-slate-700 font-medium">{selectedComplaint.reportedBy?.name}</p>
                    <p className="text-xs text-slate-400">{selectedComplaint.reportedBy?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Location</p>
                    <p className="text-slate-700">{selectedComplaint.location?.address || 'Not specified'}</p>
                  </div>
                </div>
                {selectedComplaint.adminRemark && (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
                    <p className="text-xs font-semibold text-emerald-700 mb-1">Admin Remark</p>
                    <p className="text-sm text-emerald-800 italic">"{selectedComplaint.adminRemark}"</p>
                  </div>
                )}
                {selectedComplaint.statusHistory?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Status History</p>
                    <div className="space-y-2 border-l-2 border-slate-200 pl-4">
                      {selectedComplaint.statusHistory.map((h, i) => (
                        <div key={i} className="text-sm">
                          <div className="flex items-center gap-2">
                            <StatusBadge status={h.status} size="sm" />
                            <span className="text-xs text-slate-400">{formatDate(h.timestamp)}</span>
                          </div>
                          {h.note && <p className="text-xs text-slate-500 mt-0.5">{h.note}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {selectedComplaint.images?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Images</p>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedComplaint.images.map((img, i) => {
                      const url = typeof img === 'string' ? img : img?.url;
                      return <img key={i} src={url} alt="" className="h-16 w-full rounded-lg object-cover border border-slate-200" />;
                    })}
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <button onClick={() => setSelectedComplaint(null)} className="h-9 px-4 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Close</button>
              <button onClick={() => { openStatusModal(selectedComplaint); setSelectedComplaint(null); }}
                className="h-9 px-4 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors">
                Update Status
              </button>
            </ModalFooter>
          </>
        )}
      </Modal>

      {/* Status Update Modal */}
      <Modal open={!!statusModal} onClose={() => setStatusModal(null)} title="Update Complaint Status" size="sm">
        {statusModal && (
          <>
            <ModalBody className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">New Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusModal((m) => ({ ...m, status: s }))}
                      className={`h-9 text-sm font-semibold rounded-xl border transition-all ${
                        statusModal.status === s
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {s.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Remark / Note</label>
                <textarea rows={3} value={remark} onChange={(e) => setRemark(e.target.value)}
                  className="input-base resize-none" placeholder="Optional note for the citizen about this status change..." />
              </div>
            </ModalBody>
            <ModalFooter>
              <button onClick={() => setStatusModal(null)} className="h-9 px-4 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={handleStatusUpdate} disabled={actionLoading}
                className="h-9 px-4 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-60 transition-colors">
                {actionLoading ? 'Updating...' : 'Update Status'}
              </button>
            </ModalFooter>
          </>
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Complaint"
        description="This will permanently delete this complaint. This action cannot be undone." size="sm">
        <ModalFooter>
          <button onClick={() => setDeleteModal(null)} className="h-9 px-4 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={handleDeleteConfirm} disabled={actionLoading}
            className="h-9 px-4 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-60 transition-colors">
            {actionLoading ? 'Deleting...' : '🗑️ Delete'}
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ComplaintManagement;
