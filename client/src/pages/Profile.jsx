import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const AVATAR_COLORS = [
  { label: 'Emerald', value: 'bg-emerald-600' },
  { label: 'Blue', value: 'bg-blue-600' },
  { label: 'Purple', value: 'bg-purple-600' },
  { label: 'Amber', value: 'bg-amber-600' },
  { label: 'Rose', value: 'bg-rose-600' },
  { label: 'Teal', value: 'bg-teal-600' },
];

const Profile = () => {
  const { user, login } = useAuth();
  const toast = useToast();

  const [profile, setProfile] = useState({ name: user?.name || '', bio: '', phone: '', avatarColor: user?.avatarColor || 'bg-emerald-600' });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const initials = profile.name ? profile.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  const handleProfileChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });
  const handlePassChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!profile.name.trim()) { toast.error('Name is required'); return; }
    setProfileLoading(true);
    try {
      const res = await api.put('/api/v1/profile', { name: profile.name, bio: profile.bio, phone: profile.phone, avatarColor: profile.avatarColor });
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (!passwords.current || !passwords.newPass) { toast.error('Please fill all password fields'); return; }
    if (passwords.newPass.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (passwords.newPass !== passwords.confirm) { toast.error('New passwords do not match'); return; }
    setPassLoading(true);
    try {
      await api.put('/api/v1/profile/password', { currentPassword: passwords.current, newPassword: passwords.newPass });
      toast.success('Password changed successfully!');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setPassLoading(false);
    }
  };

  const TABS = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'password', label: 'Security', icon: '🔒' },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Profile Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your account information and preferences</p>
      </div>

      {/* Avatar Card */}
      <div className="card p-6 flex items-center gap-5">
        <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${profile.avatarColor} text-white text-2xl font-extrabold shadow-lg flex-shrink-0`}>
          {initials}
        </div>
        <div>
          <h2 className="font-bold text-slate-900 text-lg">{profile.name || user?.name}</h2>
          <p className="text-sm text-slate-500">{user?.email}</p>
          <span className="inline-flex items-center mt-1 text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
            👤 Citizen
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
              activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={saveProfile} className="card p-6 space-y-5 animate-fade-in">
          <h2 className="text-base font-bold text-slate-900">Personal Information</h2>

          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name <span className="text-red-500">*</span></label>
            <input id="name" name="name" type="text" value={profile.name} onChange={handleProfileChange}
              className="input-base" placeholder="Your full name" required />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Phone Number</label>
            <input id="phone" name="phone" type="tel" value={profile.phone} onChange={handleProfileChange}
              className="input-base" placeholder="+91 98765 43210" />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="bio" className="block text-sm font-medium text-slate-700">Bio</label>
            <textarea id="bio" name="bio" rows={3} value={profile.bio} onChange={handleProfileChange}
              className="input-base resize-none" placeholder="A brief description about yourself..." maxLength={200} />
            <p className="text-xs text-slate-400 text-right">{profile.bio.length}/200</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Avatar Color</label>
            <div className="flex gap-2 flex-wrap">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setProfile({ ...profile, avatarColor: c.value })}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${c.value} text-white text-xs font-extrabold transition-all duration-150 ${
                    profile.avatarColor === c.value ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'
                  }`}
                  title={c.label}
                >
                  {initials}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={profileLoading}
              className="inline-flex items-center gap-2 h-9 px-5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-60 transition-colors">
              {profileLoading ? <><span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />Saving...</> : 'Save Changes'}
            </button>
          </div>
        </form>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <form onSubmit={changePassword} className="card p-6 space-y-5 animate-fade-in">
          <h2 className="text-base font-bold text-slate-900">Change Password</h2>

          {['current', 'newPass', 'confirm'].map((field) => {
            const labels = { current: 'Current Password', newPass: 'New Password', confirm: 'Confirm New Password' };
            return (
              <div key={field} className="space-y-1.5">
                <label htmlFor={field} className="block text-sm font-medium text-slate-700">{labels[field]}</label>
                <input id={field} name={field} type="password" value={passwords[field]} onChange={handlePassChange}
                  className="input-base" placeholder="••••••••" />
              </div>
            );
          })}

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={passLoading}
              className="inline-flex items-center gap-2 h-9 px-5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-60 transition-colors">
              {passLoading ? <><span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />Updating...</> : 'Update Password'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Profile;
