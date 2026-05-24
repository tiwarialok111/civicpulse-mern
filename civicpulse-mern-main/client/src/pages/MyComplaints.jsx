import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ComplaintCard from '../components/ComplaintCard';
import ComplaintCardSkeleton from '../components/ComplaintCardSkeleton';
import { getMyComplaints } from '../services/complaintService';

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchComplaints = async (page = 1) => {
    setLoading(true);
    setError('');

    try {
      const response = await getMyComplaints({ page, limit: pagination.limit });
      setComplaints(response.data.complaints);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load complaints.');
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchComplaints(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">My Complaints</h1>
          <p className="mt-1 text-sm text-slate-600">
            Track all issues you have reported
          </p>
        </div>
        <Link
          to="/report"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          + Report New Issue
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button
            type="button"
            onClick={() => fetchComplaints(pagination.page)}
            className="ml-2 font-medium underline"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <ComplaintCardSkeleton key={n} />
          ))}
        </div>
      ) : complaints.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <p className="text-4xl">📋</p>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">No complaints yet</h2>
          <p className="mt-2 text-sm text-slate-600">
            You haven&apos;t reported any civic issues. Start by reporting your first issue.
          </p>
          <Link
            to="/report"
            className="mt-6 inline-block rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Report an Issue
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {complaints.map((complaint) => (
              <ComplaintCard key={complaint._id} complaint={complaint} />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-slate-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                type="button"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyComplaints;
