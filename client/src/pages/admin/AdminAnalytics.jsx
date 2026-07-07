import { useState, useEffect } from 'react';
import { getAdminStats } from '../../services/adminService';
import { StatsCard } from '../../components/ui/StatsCard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 shadow-xl">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => <p key={i} className="text-sm font-bold text-white">{p.name}: {p.value}</p>)}
    </div>
  );
};

const AdminAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAdminStats();
        setStats(res.data);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const total = stats?.total || 0;
  const resolved = stats?.resolved || 0;
  const resolvedPct = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const categoryData = (stats?.categoryStats || []).map((item, i) => ({
    name: item._id || 'Unknown',
    value: item.count,
    fill: COLORS[i % COLORS.length],
  }));

  const statusData = [
    { name: 'Pending', value: stats?.pending || 0, fill: '#f59e0b' },
    { name: 'In Progress', value: stats?.inProgress || 0, fill: '#3b82f6' },
    { name: 'Resolved', value: stats?.resolved || 0, fill: '#10b981' },
    { name: 'Rejected', value: stats?.rejected || 0, fill: '#ef4444' },
  ].filter((s) => s.value > 0);

  return (
    <div className="space-y-6 pb-20 md:pb-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Platform Analytics</h1>
        <p className="text-sm text-slate-400 mt-0.5">Comprehensive platform performance metrics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: stats?.total, icon: '📋', color: 'slate' },
          { label: 'Pending', value: stats?.pending, icon: '⏳', color: 'amber' },
          { label: 'In Progress', value: stats?.inProgress, icon: '🔄', color: 'blue' },
          { label: 'Resolved', value: stats?.resolved, icon: '✅', color: 'emerald' },
          { label: 'Rejected', value: stats?.rejected, icon: '❌', color: 'red' },
        ].map((s) => (
          <div key={s.label} className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
            <StatsCard label={s.label} value={s.value ?? 0} icon={s.icon} color={s.color} loading={loading}
              className="bg-transparent border-0 p-0 shadow-none hover:shadow-none" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Category Bar */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
          <h3 className="font-bold text-white mb-1">Complaints by Category</h3>
          <p className="text-xs text-slate-400 mb-5">Issue type distribution</p>
          {loading ? (
            <div className="h-48 skeleton rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Complaints" radius={[6, 6, 0, 0]}>
                  {categoryData.map((s, i) => <Cell key={i} fill={s.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status Donut */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
          <h3 className="font-bold text-white mb-1">Status Distribution</h3>
          <p className="text-xs text-slate-400 mb-5">Current complaint breakdown</p>
          {loading ? (
            <div className="h-48 skeleton rounded-xl" />
          ) : statusData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-500">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="45%" innerRadius={60} outerRadius={85} dataKey="value" paddingAngle={2}>
                  {statusData.map((s, i) => <Cell key={i} fill={s.fill} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-slate-400">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Resolution Rate */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
          <div>
            <p className="text-6xl font-extrabold text-emerald-400">{resolvedPct}%</p>
            <p className="text-sm font-semibold text-slate-300 mt-1">Resolution Rate</p>
          </div>
          <div className="text-left space-y-2">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-sm text-slate-400">Resolved: <span className="font-bold text-white">{resolved}</span></span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-sm text-slate-400">Pending: <span className="font-bold text-white">{stats?.pending || 0}</span></span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              <span className="text-sm text-slate-400">In Progress: <span className="font-bold text-white">{stats?.inProgress || 0}</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
