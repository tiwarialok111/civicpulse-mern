import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyComplaints } from '../services/complaintService';
import Loader from '../components/Loader';

const Dashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const successMessage = location.state?.message;

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserStats = async () => {
      try {
        const response = await getMyComplaints({ page: 1, limit: 100 });
        const complaints = response.data.complaints || [];

        const computed = {
          total: complaints.length,
          pending: complaints.filter((c) => c.status === 'pending').length,
          inProgress: complaints.filter((c) => c.status === 'in-progress').length,
          resolved: complaints.filter((c) => c.status === 'resolved').length,
          rejected: complaints.filter((c) => c.status === 'rejected').length,
        };
        setStats(computed);
      } catch {
        // Fallback silently or keep defaults
      } finally {
        setLoading(false);
      }
    };
    loadUserStats();
  }, []);

  if (loading) {
    return <Loader fullScreen text="Loading citizen dashboard..." />;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12 space-y-8">
      {successMessage && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMessage}
        </div>
      )}

      {/* Greeting Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 p-6 sm:p-8 text-white shadow-md">
        <h1 className="text-2xl font-bold sm:text-3xl">Welcome back, {user?.name}!</h1>
        <p className="mt-2 text-sm text-emerald-100 max-w-xl">
          Help improve your community by reporting civic issues like road damage, street light outages, or garbage disposal problems.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/report"
            className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 shadow transition"
          >
            Report New Issue
          </Link>
          <Link
            to="/my-complaints"
            className="rounded-lg border border-emerald-200 bg-emerald-600/30 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600/50 transition"
          >
            My Complaints
          </Link>
        </div>
      </div>

      {/* Statistics Counter */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Your Reports Telemetry</h2>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center">
            <span className="text-2xl font-extrabold text-slate-800">{stats.total}</span>
            <p className="text-[11px] font-semibold text-slate-500 uppercase mt-1">Total Reported</p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm text-center">
            <span className="text-2xl font-extrabold text-amber-800">{stats.pending}</span>
            <p className="text-[11px] font-semibold text-amber-600 uppercase mt-1">Pending Approval</p>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 shadow-sm text-center">
            <span className="text-2xl font-extrabold text-blue-800">{stats.inProgress}</span>
            <p className="text-[11px] font-semibold text-blue-600 uppercase mt-1">In Progress</p>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm text-center">
            <span className="text-2xl font-extrabold text-emerald-800">{stats.resolved}</span>
            <p className="text-[11px] font-semibold text-emerald-600 uppercase mt-1">Resolved</p>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 shadow-sm text-center">
            <span className="text-2xl font-extrabold text-red-800">{stats.rejected}</span>
            <p className="text-[11px] font-semibold text-red-600 uppercase mt-1">Rejected</p>
          </div>
        </div>
      </div>

      {/* Useful citizen info card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-2">How CivicPulse Works</h3>
        <div className="grid gap-6 md:grid-cols-3 mt-4 text-slate-600">
          <div className="space-y-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">1</span>
            <h4 className="font-semibold text-slate-800 text-sm">File a Complaint</h4>
            <p className="text-xs">Submit descriptions, locations, and upload photo attachments describing the problem.</p>
          </div>
          <div className="space-y-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">2</span>
            <h4 className="font-semibold text-slate-800 text-sm">Official Review</h4>
            <p className="text-xs">Municipal authorities analyze the issue, set priority levels, and transition the status.</p>
          </div>
          <div className="space-y-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">3</span>
            <h4 className="font-semibold text-slate-800 text-sm">Resolution Tracker</h4>
            <p className="text-xs">Follow the progress live in your timeline history till the complaint gets closed.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
