import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center animate-fade-in">
    {/* Illustration */}
    <div className="relative mb-8">
      <div className="text-8xl font-extrabold text-slate-200 select-none leading-none">404</div>
      <div className="absolute inset-0 flex items-center justify-center text-6xl animate-bounce-sm">🗺️</div>
    </div>
    <h1 className="text-2xl font-extrabold text-slate-900 mb-3">Page Not Found</h1>
    <p className="text-slate-500 max-w-sm mb-8 text-sm leading-relaxed">
      Oops! The page you're looking for has gone missing — much like some civic issues. Let's get you back on track.
    </p>
    <div className="flex flex-wrap gap-3 justify-center">
      <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm">
        🏠 Go Home
      </Link>
      <Link to="/dashboard" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
        📋 Dashboard
      </Link>
    </div>
  </div>
);

export default NotFound;
