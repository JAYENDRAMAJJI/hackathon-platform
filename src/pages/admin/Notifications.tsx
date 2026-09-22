import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  Trash2,
  Check,
  AlertTriangle,
  Clock,
  Shield,
  Trophy,
  Activity,
  Layers,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { Notification } from '../../types/admin';
import { formatDate } from '../../lib/exportUtils';
import { useToast } from '../../context/AdminToastContext';

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const toast = useToast();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const resp = await apiClient.get('/admin/notifications');
      if (resp.success && resp.data) {
        setNotifications(resp.data);
      }
    } catch (err: any) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      const resp = await apiClient.post(`/admin/notifications/${id}/read`);
      if (resp.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
      }
    } catch (err: any) {
      toast.error('Failed to mark read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const resp = await apiClient.post('/admin/notifications/mark-all-read');
      if (resp.success) {
        toast.success('All notifications marked as read');
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch (err: any) {
      toast.error('Failed to update notifications');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const resp = await apiClient.delete(`/admin/notifications/${id}`);
      if (resp.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        toast.info('Notification removed');
      }
    } catch (err: any) {
      toast.error('Failed to delete notification');
    }
  };

  const filtered = filter === 'UNREAD' ? notifications.filter((n) => !n.read) : notifications;
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-blue-400" /> Administrative Notification Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            System dispatch alerts, user approval requests, and anomaly triggers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all shadow-sm"
            >
              <Check className="w-4 h-4 text-emerald-400" /> Mark All Read
            </button>
          )}
          <button
            onClick={fetchNotifications}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl shadow-xl w-fit">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'ALL' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          All Alerts ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'UNREAD' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading && notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
            <div>Loading notifications...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-400 opacity-50" />
            <div className="text-base font-bold text-white">No Unread Notifications</div>
            <p className="text-xs text-slate-500 mt-1">You are all caught up on system dispatches.</p>
          </div>
        ) : (
          filtered.map((n) => {
            const isUnread = !n.read;
            return (
              <div
                key={n.id}
                className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  isUnread
                    ? 'bg-slate-900/95 border-blue-500/40 shadow-lg shadow-blue-500/5'
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                    n.severity === 'ERROR'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : n.severity === 'WARNING'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {n.severity === 'ERROR' ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <Bell className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm truncate">{n.title}</h4>
                      {isUnread && (
                        <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0"></span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
                    <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                      <span className="font-mono">{formatDate(n.createdAt)}</span>
                      {n.link && (
                        <Link
                          to={n.link}
                          className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                        >
                          View Action <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {isUnread && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                      title="Mark as Read"
                    >
                      <Check className="w-4 h-4 text-emerald-400" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                    title="Delete Notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
