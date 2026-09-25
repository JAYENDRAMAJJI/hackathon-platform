import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard,
  Code2,
  Trophy,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Search,
  Maximize2,
  Minimize2,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Activity,
  Flame,
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { GlobalSearchModal } from '../components/GlobalSearchModal';
import { apiClient } from '../lib/api';

export const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(2);
  const [recentNotifs, setRecentNotifs] = useState<any[]>([
    {
      id: '1',
      title: 'Contest Arena Active',
      message: 'Global synchronized timer running. Advance levels and submit solutions.',
      time: 'Just now',
      read: false,
    },
    {
      id: '2',
      title: 'Account Verified',
      message: 'Your student registration was approved by contest administration.',
      time: '1h ago',
      read: false,
    },
  ]);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Cmd/Ctrl + K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
    { label: 'Contest Arena', icon: Code2, path: '/student/contest', badge: 'LIVE' },
    { label: 'Leaderboard', icon: Trophy, path: '/student/leaderboard' },
  ];

  const getBreadcrumbs = () => {
    const current = location.pathname;
    if (current.includes('/contest')) {
      return [{ label: 'Contest Arena', path: '/student/contest' }];
    }
    if (current.includes('/leaderboard')) {
      return [{ label: 'Contest Rankings', path: '/student/leaderboard' }];
    }
    return [{ label: 'Dashboard', path: '/student/dashboard' }];
  };

  const breadcrumbs = getBreadcrumbs();
  const currentTitle = breadcrumbs[breadcrumbs.length - 1]?.label || 'Dashboard';

  return (
    <div className="flex h-screen bg-slate-950 font-sans text-slate-100 overflow-hidden print:h-auto print:overflow-visible print:bg-white print:text-slate-900">
      {/* Mobile Sidebar Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden print:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out shadow-2xl lg:shadow-none shrink-0 print:hidden ${
          collapsed ? 'w-20' : 'w-72'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
          <Logo
            size="md"
            collapsed={collapsed}
            variant="dark"
            showSubtitle={true}
          />
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          <div className="space-y-1">
            {!collapsed && (
              <div className="text-[11px] font-bold text-slate-400 tracking-wider px-3 uppercase mb-1.5 flex items-center justify-between">
                <span>STUDENT ARENA</span>
              </div>
            )}

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/student/dashboard' && location.pathname.startsWith(item.path));

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? item.label : undefined}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!collapsed && item.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer Bottom Controls */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 space-y-1">
          <div className={`p-2 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-md">
              {user?.name ? user.name.charAt(0) : 'S'}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Student'}</p>
                <p className="text-[10px] text-blue-400 font-medium truncate">{user?.department || 'Student Participant'}</p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0 text-rose-400" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-900 text-slate-100 print:overflow-visible print:h-auto print:bg-white print:text-slate-900">
        {/* TOP COMMON HEADER */}
        <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 lg:px-8 z-30 sticky top-0 print:hidden">
          {/* Left: Sidebar Toggle, Title, Breadcrumbs */}
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="hover:text-slate-200">Student</span>
                {breadcrumbs.map((b, i) => (
                  <React.Fragment key={i}>
                    <span>/</span>
                    <Link to={b.path} className="hover:text-blue-400 truncate">
                      {b.label}
                    </Link>
                  </React.Fragment>
                ))}
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight truncate flex items-center gap-2">
                {currentTitle}
              </h1>
            </div>
          </div>

          {/* Right: Real-time Indicator, Global Search, Fullscreen, Notifs, Profile */}
          <div className="flex items-center gap-3">
            {/* Live WebSocket Connection Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Live WS Connected</span>
            </div>

            {/* Global Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs transition-all shadow-sm group"
            >
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400" />
              <span className="hidden md:inline">Search platform...</span>
              <kbd className="hidden md:inline text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 border border-slate-600">
                ⌘K
              </kbd>
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Notification Bell with Preview */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifs > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-400" /> Notifications
                    </div>
                    {unreadNotifs > 0 && (
                      <button
                        onClick={() => {
                          setUnreadNotifs(0);
                          setRecentNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
                        }}
                        className="text-xs text-blue-400 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-slate-800 max-h-72 overflow-y-auto py-2">
                    {recentNotifs.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">No new notifications</div>
                    ) : (
                      recentNotifs.map((n) => (
                        <div key={n.id} className="py-2.5 hover:bg-slate-800/40 px-2 rounded-lg transition-colors">
                          <div className="text-xs font-semibold text-white flex items-center justify-between">
                            <span>{n.title}</span>
                            {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{n.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Student Profile Pill & Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-800/80 transition-all border border-slate-800"
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
                  {user?.name ? user.name.charAt(0) : 'S'}
                </div>
                <div className="hidden xl:block text-left">
                  <div className="text-xs font-bold text-white leading-tight">{user?.name || 'Student'}</div>
                  <div className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">STUDENT</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2.5 border-b border-slate-800 mb-1">
                    <p className="text-xs font-bold text-white truncate">{user?.name || 'Student'}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email || 'student@university.edu'}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold border border-blue-500/30">
                      ROLE: STUDENT
                    </span>
                  </div>
                  <Link
                    to="/student/dashboard"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-slate-400" /> Dashboard Overview
                  </Link>
                  <Link
                    to="/student/contest"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <Code2 className="w-4 h-4 text-slate-400" /> Contest Arena
                  </Link>
                  <Link
                    to="/student/leaderboard"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <Trophy className="w-4 h-4 text-slate-400" /> Rankings
                  </Link>
                  <div className="border-t border-slate-800 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-950/40 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-900 text-slate-100 print:p-0 print:overflow-visible print:h-auto print:bg-white print:text-slate-900">
          <Outlet context={{ collapsed }} />
        </main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};
