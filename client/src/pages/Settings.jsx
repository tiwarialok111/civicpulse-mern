import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const { logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [notifications, setNotifications] = useState({
    statusUpdates: true,
    adminReplies: true,
    newFeatures: false,
    weeklySummary: true,
  });

  const handleDeleteAccount = () => {
    if (deleteConfirm !== 'DELETE') {
      toast.error('Please type DELETE to confirm account deletion');
      return;
    }
    toast.info('Account deletion is not yet implemented in this version.');
    setDeleteConfirm('');
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your application preferences</p>
      </div>

      {/* Appearance */}
      <div className="card p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900">🎨 Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-900 text-sm">Dark Mode</p>
            <p className="text-xs text-slate-500">Switch between light and dark themes</p>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative w-12 h-6 rounded-full transition-all duration-300 ${isDark ? 'bg-emerald-600' : 'bg-slate-200'}`}
            role="switch" aria-checked={isDark}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 flex items-center justify-center text-[10px] ${isDark ? 'translate-x-6' : 'translate-x-0'}`}>
              {isDark ? '🌙' : '☀️'}
            </span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="card p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900">🔔 Notification Preferences</h2>
        {[
          { key: 'statusUpdates', label: 'Status Updates', desc: 'Get notified when your complaint status changes' },
          { key: 'adminReplies', label: 'Admin Replies', desc: 'Notifications for admin remarks and actions' },
          { key: 'newFeatures', label: 'New Features', desc: 'Stay up to date with platform improvements' },
          { key: 'weeklySummary', label: 'Weekly Summary', desc: 'Weekly digest of your complaint activity' },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between py-1">
            <div>
              <p className="font-medium text-slate-900 text-sm">{item.label}</p>
              <p className="text-xs text-slate-500">{item.desc}</p>
            </div>
            <button
              onClick={() => setNotifications((n) => ({ ...n, [item.key]: !n[item.key] }))}
              className={`relative w-10 h-5 rounded-full transition-all duration-300 ${notifications[item.key] ? 'bg-emerald-600' : 'bg-slate-200'}`}
              role="switch" aria-checked={notifications[item.key]}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${notifications[item.key] ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        ))}
        <button onClick={() => toast.success('Notification preferences saved!')}
          className="mt-2 inline-flex items-center gap-2 h-9 px-4 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors">
          Save Preferences
        </button>
      </div>

      {/* Privacy */}
      <div className="card p-6 space-y-3">
        <h2 className="text-base font-bold text-slate-900">🔐 Privacy & Data</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          Your personal data is encrypted and never shared with third parties without your consent. All complaint data is stored securely on our servers.
        </p>
        <div className="flex gap-3 flex-wrap">
          <a href="#" className="text-sm text-emerald-600 hover:underline font-medium">Download My Data</a>
          <span className="text-slate-300">|</span>
          <a href="#" className="text-sm text-emerald-600 hover:underline font-medium">Privacy Policy</a>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card p-6 border-red-200 space-y-4">
        <h2 className="text-base font-bold text-red-700">⚠️ Danger Zone</h2>
        <div className="rounded-xl bg-red-50 border border-red-200 p-4">
          <p className="font-semibold text-red-800 text-sm mb-1">Delete Account</p>
          <p className="text-xs text-red-600 mb-3 leading-relaxed">
            Permanently delete your account and all associated complaint data. This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder='Type "DELETE" to confirm'
              className="input-base flex-1 border-red-300 focus:border-red-400 text-sm"
            />
            <button
              onClick={handleDeleteAccount}
              className="inline-flex items-center h-9 px-4 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors flex-shrink-0"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
