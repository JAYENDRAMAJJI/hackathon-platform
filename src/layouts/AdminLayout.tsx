import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  UserX,
  GraduationCap,
  Briefcase,
  Trophy,
  PlusCircle,
  Code2,
  CheckSquare,
  Activity,
  FileCode,
  Award,
  LineChart,
  BarChart3,
  UserCheck2,
  Sliders,
  AlertTriangle,
  History,
  FileSpreadsheet,
  Bell,
  ShieldCheck,
  Settings,
  HelpCircle,
  User,
  LogOut,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Search,
  Maximize2,
  Minimize2,
  Wifi,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { apiClient } from '../lib/api';
import { BadgeCounts, Notification } from '../types/admin';
import { Logo } from '../components/Logo';
import { GlobalSearchModal } from '../components/GlobalSearchModal';

interface NavSection {
  title?: string;
  items: {
    label: string;
    path?: string;
    icon: any;
    badgeKey?: keyof BadgeCounts;
    badgeColor?: string;
    subItems?: {
      label: string;
      path: string;
      icon?: any;
      badgeKey?: keyof BadgeCounts;
    }[];
  }[];
}

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    'USER MANAGEMENT': true,
    'CONTEST': true,
    'ANALYTICS': false,
    'MONITORING': false,
    'REPORTS': false,
    'SYSTEM': false,
  });

  const [badges, setBadges] = useState<BadgeCounts>({
    pendingApprovals: 6,
    activeAnomalies: 3,
    unreadNotifications: 3,
    activeSessions: 64,
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [recentNotifs, setRecentNotifs] = useState<Notification[]>([]);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch badges periodically
  const fetchBadges = async () => {
    try {
      const resp = await apiClient.get('/admin/badges');
      if (resp.success && resp.data) {
        setBadges(resp.data);
      }
    } catch (e) {
      // Fallback in dev
    }
  };

  const fetchNotifications = async () => {
    try {
      const resp = await apiClient.get('/admin/notifications');
      if (resp.success && resp.data) {
        setRecentNotifs(resp.data.slice(0, 5));
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchBadges();
    fetchNotifications();
    const interval = setInterval(() => {
      fetchBadges();
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on outside click
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

  const toggleSubmenu = (section: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [section]: !prev[section] }));
  };

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

  const navSections: NavSection[] = [
    {
      items: [
        { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'USER MANAGEMENT',
      items: [
        {
          label: 'User Management',
          icon: Users,
          subItems: [
            { label: 'All Users', path: '/admin/users', icon: Users },
            { label: 'Students', path: '/admin/students', icon: GraduationCap },
            { label: 'Faculty', path: '/admin/faculty', icon: Briefcase },
            { label: 'Pending Approvals', path: '/admin/approvals', icon: UserCheck, badgeKey: 'pendingApprovals' },
            { label: 'Rejected Users', path: '/admin/rejected-users', icon: UserX },
          ],
        },
      ],
    },
    {
      title: 'CONTEST',
      items: [
        {
          label: 'Contest Operations',
          icon: Trophy,
          subItems: [
            { label: 'Contest Overview', path: '/admin/contests', icon: Trophy },
            { label: 'Create Contest', path: '/admin/contests/create', icon: PlusCircle },
            { label: 'Question Manager', path: '/admin/questions', icon: Code2 },
            { label: 'Test Validator', path: '/admin/test-cases', icon: CheckSquare },
            { label: 'Live Monitor', path: '/admin/live-sessions', icon: Activity, badgeKey: 'activeSessions' },
            { label: 'Submission Tracker', path: '/admin/submissions', icon: FileCode },
            { label: 'Contest Rankings', path: '/admin/leaderboard', icon: Award },
          ],
        },
      ],
    },
    {
      title: 'MONITORING',
      items: [
        {
          label: 'Live Monitoring',
          icon: Activity,
          subItems: [
            { label: 'Live Monitor', path: '/admin/live-sessions', icon: Activity, badgeKey: 'activeSessions' },
            { label: 'Anomalies', path: '/admin/anomalies', icon: AlertTriangle, badgeKey: 'activeAnomalies' },
            { label: 'Activity Logs', path: '/admin/activity', icon: History },
          ],
        },
      ],
    },
    {
      title: 'ANALYTICS',
      items: [
        {
          label: 'Analytics Suite',
          icon: LineChart,
          subItems: [
            { label: 'Contest Analytics', path: '/admin/analytics', icon: LineChart },
            { label: 'Question Analytics', path: '/admin/analytics/questions', icon: BarChart3 },
            { label: 'Student Analytics', path: '/admin/analytics/students', icon: UserCheck2 },
            { label: 'Difficulty Calibration', path: '/admin/questions/difficulty', icon: Sliders },
          ],
        },
      ],
    },
    {
      title: 'REPORTS',
      items: [
        {
          label: 'Platform Reports',
          icon: FileSpreadsheet,
          subItems: [
            { label: 'Rankings Report', path: '/admin/reports?type=rankings', icon: Award },
            { label: 'Submission Report', path: '/admin/reports?type=submissions', icon: FileCode },
            { label: 'Attendance / Sessions', path: '/admin/reports?type=sessions', icon: Activity },
            { label: 'Activity Log Report', path: '/admin/reports?type=activity', icon: History },
            { label: 'Anomaly Audit Report', path: '/admin/reports?type=anomalies', icon: AlertTriangle },
          ],
        },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { label: 'Notifications', path: '/admin/notifications', icon: Bell, badgeKey: 'unreadNotifications' },
        { label: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldCheck },
        { label: 'System Settings', path: '/admin/settings', icon: Settings },
      ],
    },
  ];

  // Helper for active path
  const isPathActive = (path?: string) => {
    if (!path) return false;
    const current = location.pathname;

    if (path.includes('?')) {
      return location.pathname + location.search === path;
    }

    if (current === path) return true;

    // Disambiguate parent/child routes
    if (path === '/admin/contests') {
      return current.startsWith('/admin/contests') && current !== '/admin/contests/create';
    }
    if (path === '/admin/questions') {
      return current.startsWith('/admin/questions') && !current.includes('/difficulty');
    }
    if (path === '/admin/analytics') {
      return current === '/admin/analytics';
    }
    if (path === '/admin/live-sessions') {
      return current.startsWith('/admin/live-sessions');
    }
    if (path === '/admin/anomalies') {
      return current.startsWith('/admin/anomalies');
    }
    if (path === '/admin/users') {
      return current === '/admin/users';
    }
    if (path === '/admin/students') {
      return current.startsWith('/admin/students') && !current.includes('/analytics');
    }

    return false;
  };

  // Generate Breadcrumbs
  const getBreadcrumbs = () => {
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts.length <= 1) return [{ label: 'Dashboard', path: '/admin/dashboard' }];

    const breadcrumbLabelMap: Record<string, string> = {
      'questions': 'Question Manager',
      'test-cases': 'Test Validator',
      'live-sessions': 'Live Monitor',
      'live-monitoring': 'Live Monitor',
      'submissions': 'Submission Tracker',
      'leaderboard': 'Contest Rankings',
    };
    
    return parts.map((part, index) => {
      const url = '/' + parts.slice(0, index + 1).join('/');
      const key = part.toLowerCase();
      const label = breadcrumbLabelMap[key] || (part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' '));
      return { label, path: url };
    });
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
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {section.title && !collapsed && (
                <div className="text-[11px] font-bold text-slate-400 tracking-wider px-3 uppercase mb-1.5 flex items-center justify-between">
                  <span>{section.title}</span>
                </div>
              )}

              {section.items.map((item, itemIdx) => {
                const Icon = item.icon;
                const hasSub = item.subItems && item.subItems.length > 0;
                const isSubOpen = openSubmenus[section.title || item.label] ?? false;
                const isItemActive = item.path ? isPathActive(item.path) : item.subItems?.some((sub) => isPathActive(sub.path));

                if (!hasSub) {
                  const badgeVal = item.badgeKey ? badges[item.badgeKey] : undefined;
                  return (
                    <Link
                      key={itemIdx}
                      to={item.path || '#'}
                      onClick={() => setMobileOpen(false)}
                      title={collapsed ? item.label : undefined}
                      className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isItemActive
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={`w-5 h-5 shrink-0 ${isItemActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </div>
                      {!collapsed && badgeVal !== undefined && badgeVal > 0 && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold shadow-sm ${
                          isItemActive ? 'bg-white text-blue-700' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {badgeVal}
                        </span>
                      )}
                    </Link>
                  );
                }

                return (
                  <div key={itemIdx} className="space-y-1">
                    <button
                      onClick={() => toggleSubmenu(section.title || item.label)}
                      title={collapsed ? item.label : undefined}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isItemActive
                          ? 'text-white bg-slate-800/60 border border-slate-700/60'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={`w-5 h-5 shrink-0 ${isItemActive ? 'text-blue-400' : 'text-slate-400'}`} />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </div>
                      {!collapsed && (
                        <div className="flex items-center gap-1.5">
                          {isSubOpen ? (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      )}
                    </button>

                    {/* Submenu Dropdown */}
                    {isSubOpen && !collapsed && (
                      <div className="pl-4 pr-1 py-1 space-y-1 ml-3 border-l border-slate-800">
                        {item.subItems?.map((sub, subIdx) => {
                          const SubIcon = sub.icon || ChevronRight;
                          const isSubActive = isPathActive(sub.path);
                          const subBadge = sub.badgeKey ? badges[sub.badgeKey] : undefined;

                          return (
                            <Link
                              key={subIdx}
                              to={sub.path}
                              onClick={() => setMobileOpen(false)}
                              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                isSubActive
                                  ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20'
                                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-white' : 'text-slate-400'}`} />
                                <span className="truncate">{sub.label}</span>
                              </div>
                              {subBadge !== undefined && subBadge > 0 && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                                  isSubActive ? 'bg-white text-blue-700' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                }`}>
                                  {subBadge}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer Bottom Controls */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 space-y-1">
          <Link
            to="/admin/help"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <HelpCircle className="w-4 h-4 shrink-0 text-slate-400" />
            {!collapsed && <span>Help & Documentation</span>}
          </Link>
          <Link
            to="/admin/profile"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <User className="w-4 h-4 shrink-0 text-slate-400" />
            {!collapsed && <span>Admin Profile</span>}
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0 text-rose-400" />
            {!collapsed && <span>Logout Platform</span>}
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
                <span className="hover:text-slate-200">Admin</span>
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

          {/* Right: Real-time Indicator, Global Search, Fullscreen, Theme, Notifs, Profile */}
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
              <span className="hidden md:inline">Search everything...</span>
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
                {badges.unreadNotifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-400" /> Notifications
                    </div>
                    <Link
                      to="/admin/notifications"
                      onClick={() => setNotifDropdownOpen(false)}
                      className="text-xs text-blue-400 hover:underline"
                    >
                      View All
                    </Link>
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

            {/* Admin Profile Pill & Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-800/80 transition-all border border-slate-800"
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
                  {user?.name ? user.name.charAt(0) : 'A'}
                </div>
                <div className="hidden xl:block text-left">
                  <div className="text-xs font-bold text-white leading-tight">{user?.name || 'Admin Director'}</div>
                  <div className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">ADMIN</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2.5 border-b border-slate-800 mb-1">
                    <p className="text-xs font-bold text-white truncate">{user?.name || 'Admin Director'}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email || 'admin@hackathon.com'}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold border border-blue-500/30">
                      ROLE: ADMIN
                    </span>
                  </div>
                  <Link
                    to="/admin/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-400" /> My Profile
                  </Link>
                  <Link
                    to="/admin/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" /> Platform Settings
                  </Link>
                  <Link
                    to="/admin/audit-logs"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-400" /> Security & Audits
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
          <Outlet />
        </main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
