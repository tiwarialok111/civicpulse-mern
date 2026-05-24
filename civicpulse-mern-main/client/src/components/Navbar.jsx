import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-emerald-100 text-emerald-800'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  const isAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
            CP
          </span>
          <span className="text-lg font-bold text-slate-900">CivicPulse</span>
        </Link>

        {/* Desktop menu */}
        <div className="hidden items-center gap-1 md:flex">
          <NavLink to="/" className={linkClass} end>
            Home
          </NavLink>

          {isAuthenticated ? (
            <>
              {/* Dynamic menu items depending on the user's role */}
              {isAdmin ? (
                <>
                  <NavLink to="/admin" className={linkClass} end>
                    Admin Dashboard
                  </NavLink>
                  <NavLink to="/admin/complaints" className={linkClass}>
                    Manage Complaints
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/dashboard" className={linkClass}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/report" className={linkClass}>
                    Report Issue
                  </NavLink>
                  <NavLink to="/my-complaints" className={linkClass}>
                    My Complaints
                  </NavLink>
                </>
              )}

              {isAdmin ? (
                <span className="ml-2 rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-800">
                  Admin Panel
                </span>
              ) : (
                <span className="ml-2 rounded-lg bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-800">
                  Hi, {user?.name?.split(' ')[0]} (Citizen)
                </span>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="ml-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="ml-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
              >
                Register
              </NavLink>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            <NavLink to="/" className={linkClass} end onClick={() => setMenuOpen(false)}>
              Home
            </NavLink>

            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  <>
                    <NavLink to="/admin" className={linkClass} end onClick={() => setMenuOpen(false)}>
                      Admin Dashboard
                    </NavLink>
                    <NavLink to="/admin/complaints" className={linkClass} onClick={() => setMenuOpen(false)}>
                      Manage Complaints
                    </NavLink>
                  </>
                ) : (
                  <>
                    <NavLink to="/dashboard" className={linkClass} onClick={() => setMenuOpen(false)}>
                      Dashboard
                    </NavLink>
                    <NavLink to="/report" className={linkClass} onClick={() => setMenuOpen(false)}>
                      Report Issue
                    </NavLink>
                    <NavLink to="/my-complaints" className={linkClass} onClick={() => setMenuOpen(false)}>
                      My Complaints
                    </NavLink>
                  </>
                )}

                <p className="px-3 py-2 text-sm text-slate-600">
                  Signed in as {user?.name} ({isAdmin ? 'Admin' : 'Citizen'})
                </p>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg bg-slate-900 px-3 py-2 text-left text-sm font-medium text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={linkClass} onClick={() => setMenuOpen(false)}>
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  Register
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
