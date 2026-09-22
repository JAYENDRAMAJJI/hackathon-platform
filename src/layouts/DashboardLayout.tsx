import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, LayoutDashboard, Code, Trophy, Bell, User, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { apiClient } from '../lib/api';
import { Logo } from '../components/Logo';

export const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadNotifs, setUnreadNotifs] = useState(2);
  const [showNotifsModal, setShowNotifsModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
    { label: 'Contest Arena', icon: Code, path: '/student/contest' },
    { label: 'Leaderboard', icon: Trophy, path: '/student/leaderboard' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
        <div className="p-4 border-b border-slate-800">
          <Logo
            size="md"
            variant="dark"
            showSubtitle={true}
          />
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
              {user?.name?.charAt(0) || 'S'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Student'}</p>
              <p className="text-[10px] text-blue-400 font-medium truncate">{user?.email || 'student@university.edu'}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2.5" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Institutional Hackathon</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-slate-700">{user?.department || 'Computer Science & Engineering'}</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowNotifsModal(!showNotifsModal)}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Bell className="h-5 w-5" />
              {unreadNotifs > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
              )}
            </button>
          </div>
        </header>

        {/* Notifications Dropdown Modal */}
        {showNotifsModal && (
          <div className="absolute top-16 right-8 z-50 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-900">Notifications</span>
              <button
                onClick={() => setUnreadNotifs(0)}
                className="text-[10px] text-blue-600 font-bold hover:underline"
              >
                Mark all read
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-slate-800 space-y-1">
                <p className="font-bold text-blue-950 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-blue-600" /> Contest Arena Active
                </p>
                <p className="text-[11px] text-slate-600">
                  Global synchronized timer running. Submit solutions to climb leaderboard ranks.
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-800 space-y-1">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Account Verified
                </p>
                <p className="text-[11px] text-slate-600">
                  Your student registration was approved by contest supervision.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
