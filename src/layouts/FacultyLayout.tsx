import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  User,
  Activity,
  LineChart,
  Trophy,
  FileCode,
  BarChart3,
  AlertTriangle,
  History,
  FileSpreadsheet,
  Bell,
  HelpCircle,
  LogOut,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Search,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Wifi,
  Sparkles,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { apiClient } from '../lib/api';
import { FacultyBadges } from '../types/faculty';
import { Notification } from '../types/admin';
import { FacultySearchModal } from '../components/FacultySearchModal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Logo } from '../components/Logo';

interface NavSection {
  title?: string;
  items: {
    label: string;
    path?: string;
    icon: any;
    badgeKey?: keyof FacultyBadges;
    badgeColor?: string;
    subItems?: {
      label: string;
      path: string;
      icon?: any;
      badgeKey?: keyof FacultyBadges;
    }[];
  }[];
}

export function FacultyLayout() {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('faculty_sidebar_collapsed') === 'true';
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    STUDENTS: true,
    'LIVE MONITORING': true,
    CONTEST: false,
    ANALYTICS: false,
    REPORTS: false,
  });

  const [badges, setBadges] = useState<FacultyBadges>({
    assignedStudents: 35,
    activeSessions: 18,
    activeAnomalies: 2,
    unreadNotifications: 3,
  });

  const [connectionStatus, setConnectionStatus] = useState<'CONNECTED' | 'RECONNECTING' | 'DISCONNECTED'>('CONNECTED');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [recentNotifs, setRecentNotifs] = useState<Notification[]>([]);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const retryTimerRef = useRef<any>(null);
  const retryCountRef = useRef(0);

  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Persist collapsed state
  useEffect(() => {
    localStorage.setItem('faculty_sidebar_collapsed', String(collapsed));
  }, [collapsed]);

  // Fetch badges periodically
  const fetchBadges = async () => {
    try {
      const resp = await apiClient.get('/faculty/badges');
      if (resp.success && resp.data) {
        setBadges(resp.data);
      }
    } catch (err) {
      console.error('Failed to load faculty badges:', err);
    }
  };

  const fetchRecentNotifs = async () => {
    try {
      const resp = await apiClient.get('/faculty/notifications');
      if (resp.success && resp.data) {
        setRecentNotifs(resp.data.slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const connectSSE = () => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    try {
      const es = new EventSource('/api/faculty/events');
      eventSourceRef.current = es;

      es.onopen = () => {
        setConnectionStatus('CONNECTED');
        retryCountRef.current = 0;
      };

      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'NOTIFICATION' || data.type === 'ANOMALY_ALERT' || data.type === 'AUDIT_LOG') {
            fetchBadges();
            fetchRecentNotifs();
          }
        } catch (_) {}
      };

      es.onerror = () => {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }

        if (retryCountRef.current < 3) {
          retryCountRef.current += 1;
          setConnectionStatus('RECONNECTING');
          const delay = Math.min(2000 * Math.pow(1.5, retryCountRef.current), 10000);
          retryTimerRef.current = setTimeout(connectSSE, delay);
        } else {
          setConnectionStatus('DISCONNECTED');
        }
      };
    } catch (_) {
      setConnectionStatus('DISCONNECTED');
    }
  };

  const manualReconnect = () => {
    retryCountRef.current = 0;
    setConnectionStatus('RECONNECTING');
    connectSSE();
  };

  // Real-Time SSE Stream Listener
  useEffect(() => {
    connectSSE();
    fetchBadges();
    fetchRecentNotifs();

    const interval = setInterval(fetchBadges, 15000);
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }
      clearInterval(interval);
    };
  }, []);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut for search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const handleLogoutConfirm = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (_) {}
    logout();
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  // Faculty navigation hierarchy
  const navSections: NavSection[] = [
    {
      items: [
        {
          label: 'Dashboard',
          path: '/faculty/dashboard',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: 'STUDENTS',
      items: [
        {
          label: 'Students',
          icon: Users,
          badgeKey: 'assignedStudents',
          badgeColor: 'bg-blue-500 text-white',
          subItems: [
            { label: 'My Students', path: '/faculty/students', icon: Users, badgeKey: 'assignedStudents' },
            { label: 'Student Performance', path: '/faculty/students/performance', icon: LineChart },
            { label: 'Student Activity', path: '/faculty/students/activity', icon: History },
          ],
        },
      ],
    },
    {
      title: 'LIVE MONITORING',
      items: [
        {
          label: 'Live Monitoring',
          icon: Activity,
          badgeKey: 'activeSessions',
          badgeColor: 'bg-emerald-500 text-white',
          subItems: [
            { label: 'Active Sessions', path: '/faculty/live-sessions', icon: Activity, badgeKey: 'activeSessions' },
            { label: 'Activity Monitor', path: '/faculty/activity', icon: History },
            { label: 'Anomalies', path: '/faculty/anomalies', icon: AlertTriangle, badgeKey: 'activeAnomalies' },
          ],
        },
      ],
    },
    {
      title: 'CONTEST',
      items: [
        {
          label: 'Contest',
          icon: Trophy,
          subItems: [
            { label: 'Contest Status', path: '/faculty/contest', icon: Trophy },
            { label: 'Leaderboard', path: '/faculty/leaderboard', icon: BarChart3 },
            { label: 'Submissions', path: '/faculty/submissions', icon: FileCode },
          ],
        },
      ],
    },
    {
      title: 'ANALYTICS',
      items: [
        {
          label: 'Analytics',
          icon: BarChart3,
          subItems: [
            { label: 'Performance Analytics', path: '/faculty/analytics/performance', icon: LineChart },
            { label: 'Question Analytics', path: '/faculty/analytics/questions', icon: FileCode },
            { label: 'Difficulty Analytics', path: '/faculty/analytics/difficulty', icon: Layers },
          ],
        },
      ],
    },
    {
      title: 'REPORTS',
      items: [
        {
          label: 'Reports',
          icon: FileSpreadsheet,
          subItems: [
            { label: 'Student Report', path: '/faculty/reports?type=student', icon: FileSpreadsheet },
            { label: 'Contest Report', path: '/faculty/reports?type=contest', icon: FileSpreadsheet },
            { label: 'Session Report', path: '/faculty/reports?type=session', icon: FileSpreadsheet },
            { label: 'Anomaly Report', path: '/faculty/reports?type=anomaly', icon: AlertTriangle },
          ],
        },
      ],
    },
    {
      items: [
        {
          label: 'Notifications',
          path: '/faculty/notifications',
          icon: Bell,
          badgeKey: 'unreadNotifications',
          badgeColor: 'bg-rose-500 text-white',
        },
        {
          label: 'My Profile',
          path: '/faculty/profile',
          icon: User,
        },
        {
          label: 'Help',
          path: '/faculty/help',
          icon: HelpCircle,
        },
      ],
    },
  ];

  const isCurrentPath = (path?: string) => {
    if (!path) return false;
    const current = location.pathname;

    if (path.includes('?')) {
      const [base, query] = path.split('?');
      return current === base && location.search.includes(query);
    }

    if (current === path) return true;

    // Disambiguate student sub-routes so 'My Students' (/faculty/students) is not highlighted on performance or activity
    if (path === '/faculty/students') {
      return (
        current.startsWith('/faculty/students/usr_') ||
        (current.startsWith('/faculty/students/') &&
          !current.includes('/performance') &&
          !current.includes('/activity'))
      );
    }
    if (path === '/faculty/students/performance') {
      return (
        current === '/faculty/students/performance' ||
        current === '/faculty/student-performance' ||
        current.endsWith('/performance')
      );
    }
    if (path === '/faculty/students/activity') {
      return (
        current === '/faculty/students/activity' ||
        current === '/faculty/student-activity' ||
        (current.startsWith('/faculty/students/') && current.endsWith('/activity'))
      );
    }
    if (path === '/faculty/live-sessions') {
      return (
        current.startsWith('/faculty/live-sessions') ||
        current.startsWith('/faculty/monitoring/sessions')
      );
    }
    if (path === '/faculty/activity') {
      return (
        current === '/faculty/activity' ||
        current === '/faculty/monitoring/activity'
      );
    }
    if (path === '/faculty/anomalies') {
      return (
        current.startsWith('/faculty/anomalies') ||
        current.startsWith('/faculty/monitoring/anomalies')
      );
    }
    if (path === '/faculty/contest') {
      return (
        current === '/faculty/contest' ||
        current === '/faculty/contest/status'
      );
    }
    if (path === '/faculty/leaderboard') {
      return (
        current === '/faculty/leaderboard' ||
        current === '/faculty/contest/leaderboard'
      );
    }
    if (path === '/faculty/submissions') {
      return (
        current.startsWith('/faculty/submissions') ||
        current.startsWith('/faculty/contest/submissions')
      );
    }
    if (path === '/faculty/reports') {
      return current.startsWith('/faculty/reports');
    }

    return false;
  };

  const getBreadcrumbTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/students/performance')) return 'Students / Student Performance';
    if (path.includes('/students/activity')) return 'Students / Student Activity';
    if (path.startsWith('/faculty/students/usr_')) return 'Students / Student Profile';
    if (path.includes('/students')) return 'Students / My Students';
    if (path.includes('/live-sessions/')) return 'Live Monitoring / Session Details';
    if (path.includes('/live-sessions')) return 'Live Monitoring / Active Sessions';
    if (path.includes('/activity')) return 'Live Monitoring / Activity Monitor';
    if (path.includes('/anomalies/')) return 'Live Monitoring / Anomaly Details';
    if (path.includes('/anomalies')) return 'Live Monitoring / Anomalies';
    if (path.includes('/contest')) return 'Contest / Contest Status';
    if (path.includes('/leaderboard')) return 'Contest / Leaderboard';
    if (path.includes('/submissions')) return 'Contest / Submissions';
    if (path.includes('/analytics/performance')) return 'Analytics / Performance Analytics';
    if (path.includes('/analytics/questions')) return 'Analytics / Question Analytics';
    if (path.includes('/analytics/difficulty')) return 'Analytics / Difficulty Analytics';
    if (path.includes('/reports')) return 'Reports / Supervision Reports';
    if (path.includes('/notifications')) return 'Notifications Center';
    if (path.includes('/profile')) return 'Supervisor Profile';
    if (path.includes('/help')) return 'Supervisor Help & Guide';
    return 'Faculty Supervision';
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-200">
      {/* Search Modal */}
      <FacultySearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        title="Confirm Logout"
        message="Are you sure you want to log out from the Faculty Supervision Portal? Your active session will be invalidated."
        confirmText="Logout Now"
        confirmVariant="danger"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setIsLogoutModalOpen(false)}
      />

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden animate-in fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-slate-900 dark:bg-slate-950 text-slate-300 border-r border-slate-800 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-72'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800 bg-slate-900/80 dark:bg-slate-950/80 backdrop-blur-md">
          <Logo
            size="md"
            collapsed={collapsed}
            variant="dark"
            showSubtitle={true}
          />

          {/* Close mobile button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card Pill (Sidebar top) */}
        {!collapsed && (
          <div className="mx-3 my-3 p-3 rounded-xl bg-slate-800/60 border border-slate-800/80 flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <img
                src={
                  user?.profileImage ||
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                }
                alt="Supervisor Avatar"
                className="w-9 h-9 rounded-lg object-cover ring-2 ring-indigo-500/30"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'Dr. Robert Vance'}</p>
              <p className="text-[11px] text-indigo-400 font-medium truncate">Faculty Supervisor</p>
            </div>
          </div>
        )}

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4 custom-scrollbar">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {section.title && !collapsed && (
                <p className="px-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                  {section.title}
                </p>
              )}

              {section.items.map((item, iIdx) => {
                const Icon = item.icon;
                const hasSub = !!item.subItems && item.subItems.length > 0;
                const isOpen = openSubmenus[item.label] || false;
                const isActive = item.path ? isCurrentPath(item.path) : item.subItems?.some((sub) => isCurrentPath(sub.path));

                if (!hasSub) {
                  return (
                    <Link
                      key={iIdx}
                      to={item.path!}
                      onClick={() => setMobileOpen(false)}
                      className={`group relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/20'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                      }`}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                      {!collapsed && item.badgeKey && badges[item.badgeKey] !== undefined && (
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${item.badgeColor || 'bg-slate-700 text-slate-300'}`}>
                          {badges[item.badgeKey]}
                        </span>
                      )}
                    </Link>
                  );
                }

                // Collapsible submenu
                return (
                  <div key={iIdx} className="space-y-1">
                    <button
                      onClick={() => {
                        if (collapsed) setCollapsed(false);
                        setOpenSubmenus((prev) => ({ ...prev, [item.label]: !prev[item.label] }));
                      }}
                      className={`w-full group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'text-white bg-slate-800/90'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                      }`}
                      title={collapsed ? item.label : undefined}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </div>
                      {!collapsed && (
                        <div className="flex items-center gap-1.5">
                          {item.badgeKey && badges[item.badgeKey] !== undefined && (
                            <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded-md ${item.badgeColor || 'bg-slate-700 text-slate-300'}`}>
                              {badges[item.badgeKey]}
                            </span>
                          )}
                          {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                        </div>
                      )}
                    </button>

                    {/* Submenu items */}
                    {!collapsed && isOpen && (
                      <div className="pl-6 pr-1 py-1 space-y-1 border-l border-slate-800 ml-5">
                        {item.subItems?.map((sub, sKey) => {
                          const SubIcon = sub.icon || Sparkles;
                          const isSubActive = isCurrentPath(sub.path);
                          return (
                            <Link
                              key={sKey}
                              to={sub.path}
                              onClick={() => setMobileOpen(false)}
                              className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                isSubActive
                                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <SubIcon className="w-3.5 h-3.5 opacity-70 flex-shrink-0" />
                                <span className="truncate">{sub.label}</span>
                              </div>
                              {sub.badgeKey && badges[sub.badgeKey] !== undefined && (
                                <span className="px-1.5 py-0.2 text-[9px] font-bold bg-slate-800 text-slate-300 rounded">
                                  {badges[sub.badgeKey]}
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
        </nav>

        {/* Sidebar Footer Logout Button */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/60 dark:bg-slate-950/60">
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 flex-shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 z-30">
          {/* Left: Mobile hamburger & breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setMobileOpen(true);
                } else {
                  setCollapsed(!collapsed);
                }
              }}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="text-slate-400 dark:text-slate-500">Faculty</span>
              <span>/</span>
              <span className="font-semibold text-slate-900 dark:text-white truncate">
                {getBreadcrumbTitle()}
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live WebSocket / SSE Connection Pill */}
            <button
              onClick={() => {
                if (connectionStatus === 'DISCONNECTED') {
                  manualReconnect();
                }
              }}
              title={connectionStatus === 'DISCONNECTED' ? 'Click to reconnect live telemetry stream' : 'Live stream status'}
              className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold shadow-xs transition-all ${
                connectionStatus === 'CONNECTED'
                  ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : connectionStatus === 'RECONNECTING'
                  ? 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500/30 text-amber-600 dark:text-amber-400'
                  : 'bg-slate-500/10 dark:bg-slate-800/60 border-slate-400/30 text-slate-500 dark:text-slate-400 hover:bg-slate-500/20 cursor-pointer'
              }`}
            >
              <span className="relative flex h-2 w-2">
                {connectionStatus === 'CONNECTED' && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                {connectionStatus === 'RECONNECTING' && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    connectionStatus === 'CONNECTED'
                      ? 'bg-emerald-500'
                      : connectionStatus === 'RECONNECTING'
                      ? 'bg-amber-500'
                      : 'bg-slate-400'
                  }`}
                />
              </span>
              <Wifi className="w-3.5 h-3.5" />
              <span>
                {connectionStatus === 'CONNECTED'
                  ? 'Live Connected'
                  : connectionStatus === 'RECONNECTING'
                  ? 'Reconnecting...'
                  : 'Disconnected (Retry)'}
              </span>
            </button>

            {/* Global Search Button (Ctrl+K) */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-xs transition-colors"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-semibold bg-white dark:bg-slate-900 text-slate-400 rounded border border-slate-300 dark:border-slate-700 shadow-xs">
                Ctrl K
              </kbd>
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="hidden sm:inline-flex p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Notifications Menu */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Bell className="w-4 h-4" />
                {badges.unreadNotifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">Supervisor Notifications</span>
                    <Link
                      to="/faculty/notifications"
                      onClick={() => setNotifDropdownOpen(false)}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                      View All
                    </Link>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {recentNotifs.length > 0 ? (
                      recentNotifs.map((n) => (
                        <Link
                          key={n.id}
                          to={n.link || '/faculty/notifications'}
                          onClick={() => setNotifDropdownOpen(false)}
                          className="block p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{n.title}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">Just now</span>
                        </Link>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-slate-400">No new notifications</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <img
                  src={
                    user?.profileImage ||
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                  }
                  alt="Avatar"
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-indigo-500/20"
                />
                <span className="hidden md:inline-block text-xs font-bold text-slate-800 dark:text-slate-200">
                  {user?.name || 'Dr. Vance'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 py-1 text-xs">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{user?.name || 'Dr. Robert Vance'}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email || 'faculty@hackathon.com'}</p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-md border border-indigo-200 dark:border-indigo-800">
                      Faculty Supervisor
                    </span>
                  </div>

                  <Link
                    to="/faculty/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    My Profile
                  </Link>
                  <Link
                    to="/faculty/notifications"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium"
                  >
                    <Bell className="w-4 h-4 text-slate-400" />
                    Notifications
                  </Link>
                  <Link
                    to="/faculty/help"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium"
                  >
                    <HelpCircle className="w-4 h-4 text-slate-400" />
                    Help & Documentation
                  </Link>

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setIsLogoutModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
