import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';

const AdminLogin = () => {
  const { login, isAuthenticated, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (authLoading) {
    return <Loader fullScreen />;
  }

  // If already authenticated and is admin, redirect to admin dashboard
  if (isAuthenticated) {
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/" replace />; // Citizens shouldn't be here
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(form);
      if (response.data.user.role !== 'admin') {
        setError('Access denied: Admin privileges required.');
        // Optionally logout if they are not admin but successfully authenticated
      } else {
        navigate('/admin');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12 sm:py-16">
      <div className="rounded-2xl border border-indigo-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-indigo-900">Admin Login</h1>
        <p className="mt-1 text-sm text-indigo-600">Access the CivicPulse admin panel</p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              Admin Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              placeholder="admin@civicpulse.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Logging in...' : 'Login as Admin'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Not an admin?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
            Citizen Login
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-slate-600">
          Need an admin account?{' '}
          <Link to="/admin/register" className="font-medium text-indigo-600 hover:text-indigo-700">
            Register Admin
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
