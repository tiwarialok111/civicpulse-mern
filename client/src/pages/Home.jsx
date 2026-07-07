import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const FEATURES = [
  { icon: '📸', title: 'Photo Evidence', desc: 'Upload up to 5 photos to document the issue clearly.' },
  { icon: '📍', title: 'Precise Location', desc: 'Pin your exact location on the map for faster response.' },
  { icon: '🔔', title: 'Real-time Updates', desc: 'Get notified instantly when your complaint status changes.' },
  { icon: '📊', title: 'Live Dashboard', desc: 'Track all your complaints and their resolution progress.' },
  { icon: '🤖', title: 'AI-Powered', desc: 'Auto-categorization and priority detection using Gemini AI.' },
  { icon: '🔒', title: 'Secure & Private', desc: 'Bank-level JWT authentication protects your account.' },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', area: 'Delhi NCR', text: 'My street light report was fixed within 3 days. Amazing how fast this works!', rating: 5 },
  { name: 'Rahul Verma', area: 'Mumbai', text: 'The pothole on my road was marked in-progress the same day I filed the complaint.', rating: 5 },
  { name: 'Ananya Singh', area: 'Bengaluru', text: 'Finally a platform that actually connects citizens to the authorities effectively.', rating: 4 },
];

const FAQS = [
  { q: 'Is CivicPulse free to use?', a: 'Yes, completely free for all citizens. Create an account and start reporting issues in minutes.' },
  { q: 'How long does it take to resolve a complaint?', a: 'Resolution times vary by severity and department, but most complaints are reviewed within 48 hours.' },
  { q: 'Can I track my complaint after submitting?', a: 'Absolutely. Every complaint has a real-time status tracker with full timeline history.' },
  { q: 'What types of issues can I report?', a: 'Road damage, garbage, water leakage, street lights, drainage issues, traffic problems, and more.' },
];

const CATEGORIES = [
  { icon: '🛣️', label: 'Road Damage' },
  { icon: '🗑️', label: 'Garbage' },
  { icon: '💧', label: 'Water Leakage' },
  { icon: '💡', label: 'Street Light' },
  { icon: '🚰', label: 'Drainage' },
  { icon: '🚦', label: 'Traffic' },
];

const AnimatedCounter = ({ target, duration = 1500 }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setCount(Math.floor(current));
      if (current >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <>{count.toLocaleString()}</>;
};

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState({ total: 0, resolved: 0, citizens: 0, categories: 6 });
  const [openFaq, setOpenFaq] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/api/v1/public/stats');
        if (res.data?.data) setStats(res.data.data);
      } catch { /* use defaults */ }
    };
    fetchStats();
  }, []);

  const STAT_CARDS = [
    { label: 'Total Complaints', value: stats.total, icon: '📋', color: 'text-slate-300' },
    { label: 'Resolved', value: stats.resolved, icon: '✅', color: 'text-emerald-400' },
    { label: 'Active Citizens', value: stats.citizens, icon: '👥', color: 'text-blue-400' },
    { label: 'Departments', value: stats.categories, icon: '🏛️', color: 'text-purple-400' },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative bg-hero-gradient min-h-[80vh] flex items-center overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-50" />
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-emerald-500/10 animate-blob blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-teal-500/10 animate-blob blur-3xl" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-600/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-20 md:py-32 grid lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Civic Issue Reporting Platform
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
              Report Problems.
              <br />
              <span className="gradient-text">Drive Change.</span>
              <br />
              Build Community.
            </h1>
            <p className="mt-6 text-base text-slate-400 max-w-lg leading-relaxed">
              Potholes, broken street lights, garbage dumps, water leaks — report civic issues with photos and GPS, and track them to resolution in real time.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {isAuthenticated ? (
                <Link
                  to="/report"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-500 transition-all duration-200 shadow-lg shadow-emerald-900/40 hover:shadow-emerald-900/60 hover:-translate-y-0.5"
                >
                  📋 Report an Issue
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-500 transition-all duration-200 shadow-lg shadow-emerald-900/40 hover:-translate-y-0.5"
                  >
                    Get Started — Free
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white text-sm font-semibold rounded-xl hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
            <div className="mt-8 flex items-center gap-4">
              <div className="flex -space-x-2">
                {['bg-emerald-400', 'bg-blue-400', 'bg-purple-400', 'bg-amber-400'].map((c, i) => (
                  <div key={i} className={`w-7 h-7 rounded-full border-2 border-slate-900 ${c} text-slate-900 text-[9px] font-bold flex items-center justify-center`}>
                    {['P', 'R', 'A', 'M'][i]}
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-400">
                <span className="text-white font-semibold">1,200+</span> citizens already reporting
              </p>
            </div>
          </div>

          {/* Dashboard Preview Card */}
          <div className="hidden lg:block animate-fade-in animate-float">
            <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 rounded-2xl p-5 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="ml-2 text-xs text-slate-500 font-mono">civicpulse.app/dashboard</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Total Reports', val: '24', clr: 'text-white', bg: 'bg-slate-700/50' },
                  { label: 'Resolved', val: '18', clr: 'text-emerald-400', bg: 'bg-emerald-900/30' },
                  { label: 'In Progress', val: '4', clr: 'text-blue-400', bg: 'bg-blue-900/30' },
                  { label: 'Pending', val: '2', clr: 'text-amber-400', bg: 'bg-amber-900/30' },
                ].map((s) => (
                  <div key={s.label} className={`${s.bg} rounded-xl p-3 border border-slate-700/40`}>
                    <p className="text-[10px] text-slate-400 mb-1">{s.label}</p>
                    <p className={`text-2xl font-extrabold ${s.clr}`}>{s.val}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {[
                  { title: 'Pothole on MG Road', status: 'resolved', statusClr: 'bg-emerald-900/50 text-emerald-400' },
                  { title: 'Broken street lamp', status: 'in-progress', statusClr: 'bg-blue-900/50 text-blue-400' },
                  { title: 'Garbage overflow', status: 'pending', statusClr: 'bg-amber-900/50 text-amber-400' },
                ].map((c) => (
                  <div key={c.title} className="flex items-center justify-between bg-slate-700/30 rounded-lg px-3 py-2.5 border border-slate-700/30">
                    <span className="text-xs text-slate-300 font-medium truncate">{c.title}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.statusClr} ml-2 flex-shrink-0`}>{c.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────── */}
      <section className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STAT_CARDS.map((s, i) => (
              <div key={s.label} className={`text-center animate-fade-in-up stagger-${i + 1}`}>
                <div className="text-3xl font-extrabold text-slate-900">
                  <AnimatedCounter target={s.value} />+
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <span className="text-lg">{s.icon}</span>
                  <p className="text-sm text-slate-500 font-medium">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────────── */}
      <section className="py-16 bg-slate-50/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-2">What You Can Report</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">6 Categories Covered</h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {CATEGORIES.map((cat, i) => (
              <Link
                key={cat.label}
                to={isAuthenticated ? `/report` : `/register`}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md hover:-translate-y-1 transition-all duration-200 group animate-fade-in-up stagger-${i + 1}`}
              >
                <span className="text-2xl group-hover:scale-110 transition-transform duration-200">{cat.icon}</span>
                <span className="text-xs font-semibold text-slate-600 text-center">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-2">Simple Process</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">How CivicPulse Works</h2>
            <p className="mt-3 text-slate-500 max-w-md mx-auto text-sm">
              Three easy steps from reporting an issue to seeing it resolved in your community.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-200" />
            {[
              {
                step: '01',
                icon: '📝',
                title: 'File a Complaint',
                desc: 'Submit a detailed complaint with title, description, category, photos, and your GPS location.',
              },
              {
                step: '02',
                icon: '🔍',
                title: 'Official Review',
                desc: 'Municipal authorities verify and assign the issue to the appropriate department for resolution.',
              },
              {
                step: '03',
                icon: '✅',
                title: 'Track Resolution',
                desc: 'Follow live status updates through your dashboard timeline until the issue is fully resolved.',
              },
            ].map((step, i) => (
              <div key={step.step} className={`flex flex-col items-center text-center animate-fade-in-up stagger-${i + 1}`}>
                <div className="relative mb-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 text-3xl shadow-md shadow-emerald-100">
                    {step.icon}
                  </div>
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px] font-extrabold shadow-sm">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section className="py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-2">Why CivicPulse</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Everything You Need</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className={`bg-white rounded-2xl border border-slate-200 p-6 hover:border-emerald-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group animate-fade-in-up stagger-${(i % 5) + 1}`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-2xl mb-4 group-hover:scale-110 transition-transform duration-200">
                  {f.icon}
                </div>
                <h3 className="font-bold text-slate-900 mb-1.5">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-2">Citizen Stories</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">What Citizens Are Saying</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} className={`bg-slate-50 rounded-2xl border border-slate-200 p-6 animate-fade-in-up stagger-${i + 1}`}>
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <span key={j} className="text-amber-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed italic mb-4">"{t.text}"</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.area}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="py-20 bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-2">Help Center</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex items-center justify-between w-full px-5 py-4 text-left"
                  aria-expanded={openFaq === i}
                >
                  <span className="font-semibold text-slate-900 text-sm">{faq.q}</span>
                  <svg
                    className={`w-4 h-4 text-slate-400 flex-shrink-0 ml-3 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 border-t border-slate-100 animate-fade-in-down">
                    <p className="text-sm text-slate-500 leading-relaxed pt-3">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-20 bg-brand-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to Make Your Voice Heard?
          </h2>
          <p className="text-emerald-100 mb-8 text-base leading-relaxed">
            Join thousands of citizens who are building better communities through civic action.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to={isAuthenticated ? '/report' : '/register'}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-emerald-700 text-sm font-bold rounded-xl hover:bg-emerald-50 transition-all duration-200 shadow-lg hover:-translate-y-0.5"
            >
              {isAuthenticated ? '📋 Report an Issue' : '🚀 Join CivicPulse — Free'}
            </Link>
            {!isAuthenticated && (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-emerald-700/40 border border-emerald-400/40 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700/60 transition-all duration-200 backdrop-blur-sm"
              >
                Login to Account
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
