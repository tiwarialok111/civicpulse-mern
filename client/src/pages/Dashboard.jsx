import { useEffect, useState, lazy, Suspense } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyComplaints } from '../services/complaintService';
import { StatsCard } from '../components/ui/StatsCard';
import { StatusBadge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { formatDate } from '../utils/formatDate';

const QUICK_ACTIONS = [
  { label: 'Report Issue', to: '/report', icon: '📝', desc: 'File a new civic complaint', color: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-200' },
  { label: 'My Complaints', to: '/my-complaints', icon: '📋', desc: 'Track all your reports', color: 'bg-white text-slate-700 border border-slate-200 hover:border-emerald-300 hover:shadow-md' },
  { label: 'Analytics', to: '/analytics', icon: '📊', desc: 'View your statistics', color: 'bg-white text-slate-700 border border-slate-200 hover:border-blue-300 hover:shadow-md' },
  { label: 'Profile', to: '/profile', icon: '👤', desc: 'Manage your account', color: 'bg-white text-slate-700 border border-slate-200 hover:border-purple-300 hover:shadow-md' },
];

const STATUS_STEPS = ['pending', 'in-progress', 'resolved'];

const Dashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const successMessage = location.state?.message;

  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0, rejected: 0 });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getMyComplaints({ page: 1, limit: 100 });
        const all = res.data.complaints || [];
        setStats({
          total: all.length,
          pending: all.filter((c) => c.status === 'pending').length,
          inProgress: all.filter((c) => c.status === 'in-progress').length,
          resolved: all.filter((c) => c.status === 'resolved').length,
          rejected: all.filter((c) => c.status === 'rejected').length,
        });
        setRecentComplaints(all.slice(0, 3));
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';
  const avatarColor = user?.avatarColor || 'bg-emerald-600';
  const resolvedRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
      {/* Success Banner */}
      {successMessage && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 animate-fade-in-down">
          <span className="text-emerald-500 text-lg">✅</span>
          <p className="text-sm font-medium text-emerald-800">{successMessage}</p>
        </div>
      )}

      {/* Greeting Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-hero-gradient p-6 sm:p-8 shadow-xl">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${avatarColor} text-white text-xl font-extrabold shadow-lg flex-shrink-0`}>
              {initials}
            </div>
            <div>
              <p className="text-sm text-emerald-300 font-medium">{greeting},</p>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">{user?.name} 👋</h1>
              <p className="text-xs text-slate-400 mt-0.5">Citizen since {new Date(user?.createdAt || Date.now()).getFullYear()}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link to="/report"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/30 hover:-translate-y-0.5">
              📝 Report Issue
            </Link>
            <Link to="/my-complaints"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 border border-white/20 text-white text-sm font-semibold rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm">
              📋 My Complaints
            </Link>
          </div>
        </div>

        {/* Mini progress bar */}
        {stats.total > 0 && (
          <div className="relative mt-6 pt-5 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Resolution Rate</span>
              <span className="text-xs font-bold text-emerald-400">{resolvedRate}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-1000"
                style={{ width: `${resolvedRate}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-4">Your Activity</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatsCard label="Total Reports" value={stats.total} icon="📋" color="slate" loading={loading} />
          <StatsCard label="Pending" value={stats.pending} icon="⏳" color="amber" loading={loading} />
          <StatsCard label="In Progress" value={stats.inProgress} icon="🔄" color="blue" loading={loading} />
          <StatsCard label="Resolved" value={stats.resolved} icon="✅" color="emerald" loading={loading} />
          <StatsCard label="Rejected" value={stats.rejected} icon="❌" color="red" loading={loading} className="col-span-2 sm:col-span-1" />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action, i) => (
            <Link
              key={action.label}
              to={action.to}
              className={`flex flex-col items-start gap-2 rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 animate-fade-in-up stagger-${i + 1} ${action.color}`}
            >
              <span className="text-2xl">{action.icon}</span>
              <div>
                <p className="font-semibold text-sm">{action.label}</p>
                <p className={`text-xs mt-0.5 ${action.label === 'Report Issue' ? 'text-emerald-100' : 'text-slate-400'}`}>{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Complaints */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">Recent Complaints</h2>
          <Link to="/my-complaints" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="card p-4 flex items-center gap-4">
                <div className="skeleton h-4 flex-1 rounded" />
                <div className="skeleton h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : recentComplaints.length === 0 ? (
          <div className="card">
            <EmptyState
              icon="📋"
              title="No complaints yet"
              description="Start by reporting a civic issue in your area."
              action={<Link to="/report" className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors">📝 Report Issue</Link>}
              compact
            />
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentComplaints.map((c) => (
              <Link
                key={c._id}
                to={`/complaints/${c._id}`}
                className="card card-interactive flex items-start justify-between gap-4 p-4 block"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm truncate">{c.title}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-slate-400">{c.category}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-400">{formatDate(c.createdAt)}</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <StatusBadge status={c.status} size="sm" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* How CivicPulse Works */}
      <div className="card p-6">
        <h2 className="text-base font-bold text-slate-900 mb-5">How CivicPulse Works</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { n: '1', icon: '📝', title: 'File a Complaint', desc: 'Submit description, location & upload photo evidence.' },
            { n: '2', icon: '🔍', title: 'Official Review', desc: 'Municipal authorities analyze and assign the complaint.' },
            { n: '3', icon: '✅', title: 'Resolution Tracker', desc: 'Follow progress live until the issue is fully resolved.' },
          ].map((step) => (
            <div key={step.n} className="flex gap-3">
              <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-extrabold">
                {step.n}
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">{step.icon} {step.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
