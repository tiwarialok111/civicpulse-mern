import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats } from '../../services/adminService';
import { StatsCard } from '../../components/ui/StatsCard';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../../components/ui/Badge';
import { ErrorState } from '../../components/ui/EmptyState';
import { formatDate } from '../../utils/formatDate';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 shadow-xl">
      <p className="text-xs text-slate-300 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-bold text-white">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAdminStats();
        setStats(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const total = stats?.total || 0;
  const resolvedPct = total > 0 ? Math.round(((stats?.resolved || 0) / total) * 100) : 0;

  const categoryData = (stats?.categoryStats || []).map((item) => ({
    name: item._id || 'Unknown',
    value: item.count,
    percent: total > 0 ? Math.round((item.count / total) * 100) : 0,
  }));

  const statusData = [
    { name: 'Pending', value: stats?.pending || 0, fill: '#f59e0b' },
    { name: 'In Progress', value: stats?.inProgress || 0, fill: '#3b82f6' },
    { name: 'Resolved', value: stats?.resolved || 0, fill: '#10b981' },
    { name: 'Rejected', value: stats?.rejected || 0, fill: '#ef4444' },
  ].filter((s) => s.value > 0);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <ErrorState title="Dashboard Error" description={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Admin Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">Platform overview and real-time statistics</p>
        </div>
        <Link
          to="/admin/complaints"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-500 transition-colors shadow-sm"
        >
          Manage Complaints →
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total Complaints', value: stats?.total, icon: '📋', color: 'slate' },
          { label: 'Pending', value: stats?.pending, icon: '⏳', color: 'amber' },
          { label: 'In Progress', value: stats?.inProgress, icon: '🔄', color: 'blue' },
          { label: 'Resolved', value: stats?.resolved, icon: '✅', color: 'emerald' },
          { label: 'Rejected', value: stats?.rejected, icon: '❌', color: 'red' },
        ].map((s) => (
          <div key={s.label} className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
            <StatsCard label={s.label} value={s.value ?? 0} icon={s.icon} color={s.color} loading={loading}
              className="bg-transparent border-0 p-0 shadow-none hover:shadow-none hover:transform-none" />
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Category Bar Chart */}
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl p-5">
          <h3 className="text-base font-bold text-white mb-1">Complaints by Category</h3>
          <p className="text-xs text-slate-400 mb-5">Issue distribution across departments</p>
          {loading ? (
            <div className="h-48 skeleton rounded-xl" />
          ) : categoryData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Complaints" radius={[6, 6, 0, 0]}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status Donut + Resolution Rate */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 flex flex-col">
          <h3 className="text-base font-bold text-white mb-1">Status Distribution</h3>
          <p className="text-xs text-slate-400 mb-4">Current platform performance</p>
          {loading ? (
            <div className="h-40 skeleton rounded-xl flex-1" />
          ) : statusData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">No data yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value" paddingAngle={2}>
                    {statusData.map((s, i) => <Cell key={i} fill={s.fill} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-1.5">
                {statusData.map((s) => (
                  <div key={s.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.fill }} />
                      <span className="text-xs text-slate-400">{s.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-200">{s.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-700 text-center">
                <p className="text-3xl font-extrabold text-emerald-400">{resolvedPct}%</p>
                <p className="text-xs text-slate-400 mt-0.5">Resolution Rate</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Category Progress Bars */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
        <h3 className="text-base font-bold text-white mb-1">Category Breakdown</h3>
        <p className="text-xs text-slate-400 mb-5">Percentage share of each issue type</p>
        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map((n) => <div key={n} className="h-6 skeleton rounded" />)}</div>
        ) : categoryData.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">No categories recorded yet.</p>
        ) : (
          <div className="space-y-4">
            {categoryData.map((item, i) => (
              <div key={item.name}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-semibold text-slate-200">{item.name}</span>
                  <span className="text-sm text-slate-400">{item.value} issues ({item.percent}%)</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${item.percent}%`, backgroundColor: COLORS[i % COLORS.length] }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Complaints */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-white">Recent Complaints</h3>
            <p className="text-xs text-slate-400">Latest citizen activity</p>
          </div>
          <Link to="/admin/complaints" className="text-sm font-semibold text-emerald-500 hover:text-emerald-400 transition-colors">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">{[1, 2, 3, 4, 5].map((n) => <div key={n} className="h-12 skeleton rounded-xl" />)}</div>
        ) : !stats?.recentComplaints?.length ? (
          <p className="text-sm text-slate-500 text-center py-6">No complaints submitted yet.</p>
        ) : (
          <div className="divide-y divide-slate-700/60">
            {stats.recentComplaints.map((item) => (
              <div key={item._id} className="flex flex-wrap items-center justify-between gap-3 py-3.5 hover:bg-slate-700/30 px-2 rounded-xl transition-colors">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-200 text-sm truncate max-w-[200px]">{item.title}</span>
                    <PriorityBadge priority={item.priority} size="sm" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <CategoryBadge category={item.category} size="sm" />
                    <span>·</span>
                    <span>By {item.reportedBy?.name || 'Unknown'}</span>
                    <span>·</span>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                </div>
                <StatusBadge status={item.status} size="sm" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
