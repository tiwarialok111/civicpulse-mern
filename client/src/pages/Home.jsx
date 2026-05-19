import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <section className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 px-6 py-14 text-white shadow-lg sm:px-12 sm:py-16">
        <p className="mb-3 text-sm font-medium uppercase tracking-wide text-emerald-100">
          Civic Issue Reporting
        </p>
        <h1 className="max-w-2xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
          Report problems in your city. Track fixes. Build a better community.
        </h1>
        <p className="mt-4 max-w-xl text-emerald-50">
          Potholes, garbage, water leaks, street lights, drainage, and traffic — report issues
          with photos and location pins.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {isAuthenticated ? (
            <Link
              to="/report"
              className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-emerald-700 shadow transition hover:bg-emerald-50"
            >
              Report an Issue
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-emerald-700 shadow transition hover:bg-emerald-50"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="rounded-lg border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="mt-12 grid gap-6 sm:grid-cols-3">
        {[
          {
            title: 'Report Issues',
            desc: 'Submit complaints with photos, category, and map location.',
          },
          {
            title: 'Track Status',
            desc: 'Follow your complaint from pending to resolved.',
          },
          {
            title: 'Community Impact',
            desc: 'Help local authorities fix problems faster.',
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <h3 className="font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Home;
