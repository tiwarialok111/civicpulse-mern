import { useEffect, useState } from 'react';
import { getMyComplaints } from '../services/complaintService';
import { StatsCard } from '../components/ui/StatsCard';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 shadow-xl">
      <p className="text-xs text-slate-300 mb-1">{label}</p>
      {payload.map((p, i) => <p key={i} className="text-sm font-bold text-white">{p.name}: {p.value}</p>)}
    </div>
  );
};

const Analytics = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getMyComplaints({ page: 1, limit: 200 });
        setComplaints(res.data.complaints || []);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const total = complaints.length;
  const resolved = complaints.filter((c) => c.status === 'resolved').length;
  const pending = complaints.filter((c) => c.status === 'pending').length;
  const inProgress = complaints.filter((c) => c.status === 'in-progress').length;
  const resolvedRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // Category breakdown
  const categoryMap = {};
  complaints.forEach((c) => {
    categoryMap[c.category] = (categoryMap[c.category] || 0) + 1;
  });
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  // Monthly submissions (last 6 months)
  const monthlyMap = {};
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
    months.push(key);
    monthlyMap[key] = 0;
  }
  complaints.forEach((c) => {
    const d = new Date(c.createdAt);
    const key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
    if (monthlyMap[key] !== undefined) monthlyMap[key]++;
  });
  const monthlyData = months.map((m) => ({ name: m, complaints: monthlyMap[m] }));

  // Status pie
  const statusData = [
    { name: 'Resolved', value: resolved, fill: '#10b981' },
    { name: 'In Progress', value: inProgress, fill: '#3b82f6' },
    { name: 'Pending', value: pending, fill: '#f59e0b' },
    { name: 'Rejected', value: complaints.filter((c) => c.status === 'rejected').length, fill: '#ef4444' },
  ].filter((s) => s.value > 0);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">My Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">Personal complaint statistics and trends</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatsCard label="Total Filed" value={total} icon="📋" color="slate" loading={loading} />
        <StatsCard label="Resolved" value={resolved} icon="✅" color="emerald" loading={loading} trendLabel={`${resolvedRate}% rate`} />
        <StatsCard label="In Progress" value={inProgress} icon="🔄" color="blue" loading={loading} />
        <StatsCard label="Pending" value={pending} icon="⏳" color="amber" loading={loading} />
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Monthly Bar */}
        <div className="card p-5">
          <h3 className="font-bold text-slate-900 mb-1">Monthly Submissions</h3>
          <p className="text-xs text-slate-500 mb-4">Last 6 months</p>
          {loading ? (
            <div className="h-40 skeleton rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthlyData} margin={{ left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="complaints" name="Complaints" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status Donut */}
        <div className="card p-5">
          <h3 className="font-bold text-slate-900 mb-1">Status Breakdown</h3>
          <p className="text-xs text-slate-500 mb-4">All-time distribution</p>
          {loading ? (
            <div className="h-40 skeleton rounded-xl" />
          ) : statusData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" paddingAngle={2}>
                  {statusData.map((s, i) => <Cell key={i} fill={s.fill} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-slate-500">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Category Breakdown */}
      {categoryData.length > 0 && (
        <div className="card p-5">
          <h3 className="font-bold text-slate-900 mb-1">Complaints by Category</h3>
          <p className="text-xs text-slate-500 mb-5">Types of issues you've reported</p>
          <div className="space-y-4">
            {categoryData.map((item, i) => (
              <div key={item.name}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                  <span className="text-sm text-slate-400">{item.value} ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${total > 0 ? (item.value / total) * 100 : 0}%`, backgroundColor: COLORS[i % COLORS.length] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resolution Rate Banner */}
      <div className={`rounded-2xl p-6 text-center ${resolvedRate >= 70 ? 'bg-emerald-50 border border-emerald-200' : resolvedRate >= 40 ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50 border border-slate-200'}`}>
        <p className={`text-5xl font-extrabold mb-2 ${resolvedRate >= 70 ? 'text-emerald-600' : resolvedRate >= 40 ? 'text-amber-600' : 'text-slate-600'}`}>
          {resolvedRate}%
        </p>
        <p className="text-sm font-semibold text-slate-700">Overall Resolution Rate</p>
        <p className="text-xs text-slate-500 mt-1">
          {resolvedRate >= 70 ? '🎉 Excellent! Most of your issues have been resolved.' : resolvedRate >= 40 ? '👍 Good progress. Keep tracking your open issues.' : '📋 Keep reporting — your voice creates change.'}
        </p>
      </div>
    </div>
  );
};

export default Analytics;
