import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getMyComplaints } from '../services/complaintService';
import { StatusBadge, CategoryBadge, PriorityBadge } from '../components/ui/Badge';
import { EmptyState, ErrorState } from '../components/ui/EmptyState';
import { Pagination } from '../components/ui/Pagination';
import { CardSkeleton } from '../components/ui/Skeleton';
import { formatDate } from '../utils/formatDate';

const STATUSES = ['', 'pending', 'in-progress', 'resolved', 'rejected'];
const CATEGORIES = ['', 'Road Damage', 'Garbage', 'Water Leakage', 'Street Light', 'Drainage', 'Traffic'];

const STATUS_LABELS = {
  '': 'All Status',
  pending: 'Pending',
  'in-progress': 'In Progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
};

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 6, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const fetchComplaints = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await getMyComplaints({ page, limit: pagination.limit, status, category });
      let data = res.data.complaints || [];

      // Client-side search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        data = data.filter(
          (c) => c.title?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q) || c.location?.address?.toLowerCase().includes(q)
        );
      }

      // Client-side sorting
      if (sortBy === 'oldest') data = [...data].reverse();
      else if (sortBy === 'priority') {
        const P = { urgent: 0, high: 1, medium: 2, low: 3 };
        data = [...data].sort((a, b) => (P[a.priority] ?? 2) - (P[b.priority] ?? 2));
      }

      setComplaints(data);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load complaints.');
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, status, category, search, sortBy]);

  useEffect(() => {
    fetchComplaints(1);
  }, [status, category, sortBy]);

  const handlePageChange = (p) => {
    fetchComplaints(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchKey = (e) => {
    if (e.key === 'Enter') fetchComplaints(1);
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setCategory('');
    setSortBy('newest');
  };

  const hasFilters = search || status || category || sortBy !== 'newest';

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">My Complaints</h1>
          <p className="mt-1 text-sm text-slate-500">
            {loading ? 'Loading...' : `${pagination.total} complaint${pagination.total !== 1 ? 's' : ''} filed`}
          </p>
        </div>
        <Link
          to="/report"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Report New Issue
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[160px]">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKey}
              placeholder="Search complaints..."
              className="input-base pl-8 h-9 text-sm"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input-base h-9 text-sm appearance-none pr-7 min-w-[130px]"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
            <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-base h-9 text-sm appearance-none pr-7 min-w-[130px]"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c || 'All Categories'}</option>
              ))}
            </select>
            <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-base h-9 text-sm appearance-none pr-7 min-w-[120px]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">By Priority</option>
            </select>
            <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </div>

          {/* Clear filters */}
          {hasFilters && (
            <button onClick={clearFilters} className="inline-flex items-center gap-1.5 h-9 px-3 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              Clear
            </button>
          )}

          <button
            onClick={() => fetchComplaints(1)}
            className="inline-flex items-center gap-1.5 h-9 px-3 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="card">
          <ErrorState title="Failed to load complaints" description={error} onRetry={() => fetchComplaints(pagination.page)} />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((n) => <CardSkeleton key={n} />)}
        </div>
      ) : complaints.length === 0 ? (
        <div className="card">
          <EmptyState
            icon="📋"
            title={hasFilters ? 'No complaints match your filters' : 'No complaints yet'}
            description={hasFilters ? 'Try adjusting or clearing the filters.' : 'Start by reporting your first civic issue.'}
            action={
              hasFilters
                ? <button onClick={clearFilters} className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-colors">Clear Filters</button>
                : <Link to="/report" className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors">📝 Report an Issue</Link>
            }
          />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {complaints.map((c) => (
              <Link key={c._id} to={`/complaints/${c._id}`} className="card card-interactive p-5 block space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 flex-1">{c.title}</h3>
                  <StatusBadge status={c.status} size="sm" />
                </div>

                {/* Description */}
                {c.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{c.description}</p>
                )}

                {/* Location */}
                {c.location?.address && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span className="truncate">{c.location.address}</span>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CategoryBadge category={c.category} size="sm" />
                    <PriorityBadge priority={c.priority} size="sm" />
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0">{formatDate(c.createdAt)}</span>
                </div>
              </Link>
            ))}
          </div>
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={handlePageChange} loading={loading} />
        </>
      )}
    </div>
  );
};

export default MyComplaints;
