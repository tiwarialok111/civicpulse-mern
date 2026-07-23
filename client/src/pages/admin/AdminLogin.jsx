import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
  const { login, logout, isAuthenticated, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // All handlers defined before any conditional returns
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await login({ email: form.email.trim(), password: form.password });
      if (response.data.user.role !== 'admin') {
        logout(); // Clear the non-admin session
        setError('Access denied. This account does not have admin privileges.');
      } else {
        navigate('/admin');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Conditional returns AFTER all hooks and handlers
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-10 border-r border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{backgroundImage:'radial-gradient(circle at 20% 50%, #10b98133 0%, transparent 60%), radial-gradient(circle at 80% 20%, #6366f133 0%, transparent 50%)'}}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white text-sm font-extrabold shadow-lg shadow-emerald-900/50">
            CP
          </div>
          <div>
            <p className="text-white font-bold text-base leading-none">CivicPulse</p>
            <p className="text-slate-500 text-[10px] uppercase tracking-widest font-medium mt-0.5">Admin Panel</p>
          </div>
        </div>

        {/* Center content */}
        <div className="relative space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-purple-900/40 border border-purple-700/50 rounded-full px-3 py-1.5">
              <span className="text-purple-400 text-xs font-semibold">🛡️ Admin Access</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white leading-tight">
              Manage CivicPulse<br/>from one place.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Review complaints, update statuses, view analytics, and keep the community running smoothly.
            </p>
          </div>
          <div className="space-y-3">
            {[
              { icon: '📋', text: 'View & manage all citizen complaints' },
              { icon: '📊', text: 'Real-time analytics & dashboards' },
              { icon: '✅', text: 'Update complaint statuses instantly' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700/60 text-sm flex-shrink-0">
                  {item.icon}
                </span>
                <span className="text-sm text-slate-300">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-slate-600">© {new Date().getFullYear()} CivicPulse</p>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12 bg-slate-950">
        <div className="w-full max-w-[380px]">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white text-xs font-extrabold">CP</div>
            <div>
              <p className="text-white font-bold text-sm">CivicPulse</p>
              <p className="text-slate-500 text-[10px] uppercase tracking-widest">Admin Panel</p>
            </div>
          </div>

          <div className="mb-7">
            <h1 className="text-2xl font-extrabold text-white">Admin Sign In</h1>
            <p className="mt-1 text-sm text-slate-400">Sign in to access the admin dashboard</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-red-950/50 border border-red-800/60 px-4 py-3">
              <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="admin-email" className="block text-sm font-medium text-slate-300">
                Admin Email
              </label>
              <input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@civicpulse.com"
                className="w-full h-10 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="admin-password" className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full h-10 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 pr-10 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Hint box */}
            <div className="flex items-start gap-2 rounded-lg bg-slate-800/50 border border-slate-700/50 px-3 py-2.5">
              <svg className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-xs text-slate-400 leading-relaxed">
                Default credentials: <span className="text-slate-200 font-mono">admin@civicpulse.com</span> / <span className="text-slate-200 font-mono">Admin@123</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 h-10 px-4 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-emerald-900/50"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In as Admin'
              )}
            </button>
          </form>

          <div className="mt-6 space-y-2 text-center">
            <p className="text-sm text-slate-500">
              Not an admin?{' '}
              <Link to="/login" className="font-semibold text-emerald-500 hover:text-emerald-400 transition-colors">
                Citizen Login
              </Link>
            </p>
            <p className="text-sm text-slate-500">
              Need an admin account?{' '}
              <Link to="/admin/register" className="font-semibold text-slate-300 hover:text-white transition-colors">
                Register Admin →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
