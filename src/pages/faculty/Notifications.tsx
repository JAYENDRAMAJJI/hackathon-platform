import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  Trash2,
  Check,
  AlertTriangle,
  Info,
  ShieldAlert,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../lib/api';
import { Notification } from '../../types/admin';
import { useToast } from '../../context/AdminToastContext';

export default function FacultyNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchNotifications = async () => {
    try {
      const resp = await apiClient.get('/faculty/notifications');
      if (resp.success && resp.data) {
        setNotifications(resp.data);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      const resp = await apiClient.patch(`/faculty/notifications/${id}/read`);
      if (resp.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        showToast('success', 'Notification marked as read');
      }
    } catch (err) {
      showToast('error', 'Failed to update notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const resp = await apiClient.post('/faculty/notifications/mark-all-read');
      if (resp.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        showToast('success', 'All notifications marked as read');
      }
    } catch (err) {
      showToast('error', 'Failed to mark all as read');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const resp = await apiClient.delete(`/faculty/notifications/${id}`);
      if (resp.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        showToast('success', 'Notification dismissed');
      }
    } catch (err) {
      showToast('error', 'Failed to dismiss notification');
    }
  };

  const filtered = unreadOnly ? notifications.filter((n) => !n.read) : notifications;
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Supervisor Alert Center
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              System announcements, student assignments, active session alerts, and anomaly notifications.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 cursor-pointer shadow-sm hover:border-slate-700 transition-colors">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
            />
            Unread Only ({unreadCount})
          </label>

          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleMarkAllRead}
              className="text-xs font-bold text-indigo-300 bg-indigo-600/20 border-indigo-500/50 hover:bg-indigo-600/30 rounded-xl"
            >
              <Check className="w-3.5 h-3.5 mr-1 text-indigo-400" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((notif) => (
            <Card
              key={notif.id}
              className={`border transition-all rounded-2xl shadow-xl ${
                notif.read
                  ? 'border-slate-800 bg-slate-900'
                  : 'border-indigo-500/40 bg-indigo-950/20 ring-1 ring-indigo-500/20'
              }`}
            >
              <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5 flex-1">
                  <div
                    className={`p-2.5 rounded-xl mt-0.5 border ${
                      notif.severity === 'WARNING' || notif.severity === 'CRITICAL'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : notif.severity === 'SUCCESS'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                    }`}
                  >
                    {notif.severity === 'WARNING' || notif.severity === 'CRITICAL' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : notif.severity === 'SUCCESS' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Info className="w-4 h-4" />
                    )}
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-white">{notif.title}</p>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-slate-300 font-normal leading-relaxed">{notif.message}</p>
                    <span className="text-[11px] text-slate-500 font-mono block">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                  {notif.link && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(notif.link)}
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/40 h-8 rounded-xl"
                    >
                      View Details
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  )}

                  {!notif.read && (
                    <button
                      onClick={() => handleMarkRead(notif.id)}
                      title="Mark as Read"
                      className="h-8 w-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-emerald-400 border border-slate-700 flex items-center justify-center transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(notif.id)}
                    title="Dismiss"
                    className="h-8 w-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 border border-slate-700 flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 shadow-xl">
            <Bell className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="font-semibold text-sm text-slate-300">No notifications found</p>
            <p className="text-xs text-slate-500 mt-0.5">You are up to date on all supervisory alerts.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
