import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/admin/StatCard';
import Loader from '../../components/Loader';
import { getAdminStats } from '../../services/adminService';
import { formatDate } from '../../utils/formatDate';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = async () => {
    try {
      const response = await getAdminStats();
      setStats(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return <Loader fullScreen text="Loading dashboard analytics..." />;
  }

  // Calculate percentage of resolved complaints
  const total = stats?.total || 0;
  const resolvedPct = total > 0 ? Math.round(((stats?.resolved || 0) / total) * 100) : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12 space-y-8">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">
            Real-time telemetry, statistics, and issue distribution across categories.
          </p>
        </div>
        <Link
          to="/admin/complaints"
          className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 shadow transition"
        >
          Manage Complaints &rarr;
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Analytics Counter Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Complaints" value={stats?.total || 0} color="slate" />
        <StatCard label="Pending Approval" value={stats?.pending || 0} color="amber" />
        <StatCard label="In Progress" value={stats?.inProgress || 0} color="blue" />
        <StatCard label="Resolved" value={stats?.resolved || 0} color="emerald" />
        <StatCard label="Rejected" value={stats?.rejected || 0} color="red" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Category Breakdown list */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-white">Complaints by Category</h3>
          <p className="text-xs text-slate-400 mb-6">Issue distribution across departments.</p>

          <div className="space-y-4">
            {stats?.categoryStats && stats.categoryStats.length > 0 ? (
              stats.categoryStats.map((item) => {
                const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;
                return (
                  <div key={item._id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-slate-200">{item._id || 'Unclassified'}</span>
                      <span className="text-slate-400">
                        {item.count} issues ({percent}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800">
                      <div
                        className="h-2 rounded-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-500 italic py-6 text-center">No categories recorded yet.</p>
            )}
          </div>
        </div>

        {/* Resolution Rate Card */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-white">Resolution Rate</h3>
            <p className="text-xs text-slate-400 mb-6">Current performance ratio.</p>
          </div>

          <div className="flex flex-col items-center py-4">
            <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-8 border-slate-800 bg-emerald-900/20 text-emerald-400">
              {/* Fake progress ring or simply text representation */}
              <div className="text-center">
                <span className="text-4xl font-extrabold">{resolvedPct}%</span>
                <p className="text-[10px] uppercase font-bold text-emerald-500 mt-1">Closed</p>
              </div>
            </div>
            <p className="mt-6 text-xs text-center text-slate-400 leading-relaxed max-w-[200px]">
              <span className="font-bold text-slate-200">{stats?.resolved || 0}</span> out of{' '}
              <span className="font-bold text-slate-200">{total}</span> total filed complaints have been successfully resolved.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Complaints Panel */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Recently Filed Complaints</h3>
            <p className="text-xs text-slate-400">Latest citizen activity reports.</p>
          </div>
          <Link to="/admin/complaints" className="text-xs font-bold text-emerald-600 hover:underline">
            View All &rarr;
          </Link>
        </div>

        {stats?.recentComplaints && stats.recentComplaints.length > 0 ? (
          <div className="divide-y divide-slate-800">
            {stats.recentComplaints.map((item) => (
              <div key={item._id} className="flex flex-wrap items-center justify-between gap-2 py-3.5 hover:bg-slate-800/50 px-2 rounded-lg transition">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200 text-sm">{item.title}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      item.priority === 'urgent'
                        ? 'bg-red-50 text-red-700'
                        : item.priority === 'high'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-50 text-slate-700'
                    }`}>
                      {item.priority || 'medium'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{item.category}</span>
                    <span>&bull;</span>
                    <span>By {item.reportedBy?.name || 'Anonymous'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">{formatDate(item.createdAt)}</span>
                  <span className={`rounded px-2.5 py-1 text-xs font-bold uppercase ${
                    item.status === 'resolved'
                      ? 'bg-emerald-50 text-emerald-700'
                      : item.status === 'rejected'
                      ? 'bg-red-50 text-red-700'
                      : item.status === 'in-progress'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic py-6 text-center">No complaints submitted recently.</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
