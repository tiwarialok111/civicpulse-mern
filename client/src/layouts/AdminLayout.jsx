import { Link, Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <header className="border-b border-slate-800 bg-slate-900 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Admin Panel
            </p>
            <h1 className="text-lg font-bold">CivicPulse Dashboard</h1>
          </div>
          <Link
            to="/"
            className="rounded-lg bg-white/10 px-3 py-2 text-sm font-medium transition hover:bg-white/20"
          >
            ← Back to Site
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
