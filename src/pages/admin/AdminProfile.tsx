import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Shield,
  Clock,
  Calendar,
  Monitor,
  LogOut,
  Edit,
  CheckCircle2,
  RefreshCw,
  X,
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { formatDate } from '../../lib/exportUtils';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../context/AdminToastContext';

export default function AdminProfile() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [name, setName] = useState('');

  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const resp = await apiClient.get('/admin/profile');
      if (resp.success && resp.data) {
        setData(resp.data);
        setName(resp.data.profile.name);
      }
    } catch (err: any) {
      toast.error('Failed to load admin profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resp = await apiClient.put('/admin/profile', { name });
      if (resp.success) {
        toast.success('Admin profile updated');
        setIsEditModalOpen(false);
        fetchProfile();
      }
    } catch (err: any) {
      toast.error('Failed to update profile');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 space-y-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium">Loading administrator profile...</p>
      </div>
    );
  }

  const profile = data?.profile;
  const sessions = data?.activeSessions || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300 pb-16">
      {/* Profile Card Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-xl">
              {profile?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-white">{profile?.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold">
                  ROLE: ADMIN
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">{profile?.email}</p>
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-3">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-400" /> Authorized Administrator
                </span>
                <span>•</span>
                <span>ID: {profile?.id}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all shadow-sm"
            >
              <Edit className="w-4 h-4 text-blue-400" /> Edit Profile
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Account Info & Active Sessions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Details */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-white text-base pb-3 border-b border-slate-800 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" /> Account Security & SSO
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Authentication Method:</span>
              <span className="font-bold text-emerald-400">Google OAuth 2.0 (SSO)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Account Created:</span>
              <span className="text-slate-300">{formatDate(profile?.registrationDate)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Last Successful Login:</span>
              <span className="text-slate-300 font-mono">{formatDate(profile?.lastLogin)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Password Storage:</span>
              <span className="text-slate-400">No passwords stored (Google Managed)</span>
            </div>
          </div>
        </div>

        {/* Active Admin Sessions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-white text-base pb-3 border-b border-slate-800 flex items-center gap-2">
            <Monitor className="w-4 h-4 text-emerald-400" /> Active Administrative Sessions
          </h3>

          <div className="space-y-3">
            {sessions.map((sess: any) => (
              <div
                key={sess.id}
                className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    {sess.device}
                    {sess.isCurrent && (
                      <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                        CURRENT
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">IP: {sess.ip} • Logged in: {sess.loginTime}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Edit Administrator Profile</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Display Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Email Address (Google SSO)</label>
                <input
                  type="email"
                  disabled
                  value={profile?.email}
                  className="w-full px-3.5 py-2.5 bg-slate-800/40 border border-slate-700/60 rounded-xl text-slate-400 text-sm cursor-not-allowed"
                />
                <span className="text-[10px] text-slate-500">Email is linked to Google OAuth single sign-on.</span>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
