import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  RefreshCw,
  Clock,
  User,
  Monitor,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  StopCircle,
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { ActivityLog } from '../../types/admin';
import { formatDate, exportJsonToCsv } from '../../lib/exportUtils';
import { useToast } from '../../context/AdminToastContext';

export default function ActivityMonitoring() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const toast = useToast();

  const fetchActivity = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (actionFilter !== 'ALL') params.action = actionFilter;

      const resp = await apiClient.get('/admin/activity', params);
      if (resp.success && resp.data) {
        setLogs(resp.data);
      }
    } catch (err: any) {
      toast.error('Failed to load activity stream');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchActivity();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, actionFilter]);

  const handleExportCSV = () => {
    if (!logs || logs.length === 0) {
      toast.warning('No activity logs available to export');
      return;
    }

    const exportData = logs.map((l) => ({
      'Log ID': l.id,
      'Timestamp': formatDate(l.timestamp),
      'Student ID': l.studentId,
      'Student Name': l.studentName,
      'Event Action': l.action,
      'Details': l.details,
      'IP Address': l.ipAddress,
      'Device': l.device,
      'Session ID': l.sessionId,
    }));

    exportJsonToCsv('Hackathon_Arena_Activity_Logs', exportData);
    toast.success(`Exported ${exportData.length} activity records to CSV`);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-300 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-cyan-400" /> Granular Participant Activity Stream
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time feed of compiler events, question opens, problem skips, and session lifecycle changes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-blue-400" /> Export CSV
          </button>
          <button
            onClick={fetchActivity}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchActivity();
          }}
          className="relative w-full md:w-96"
        >
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student, details, or IP..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </form>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium">Action Type:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Actions</option>
            <option value="LOGIN">Authentication Login</option>
            <option value="QUESTION_OPENED">Question Opened</option>
            <option value="SUBMISSION">Code Submitted</option>
            <option value="QUESTION_SKIPPED">Question Skipped</option>
            <option value="DIFFICULTY_CHANGED">Difficulty Tier Change</option>
            <option value="SESSION_START">Session Started</option>
            <option value="ADMIN_INTERVENTION">Admin Intervention</option>
          </select>

          {(search || actionFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setActionFilter('ALL');
              }}
              className="text-xs text-rose-400 hover:text-rose-300 underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-700">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Student</th>
                <th className="p-4">Action Event</th>
                <th className="p-4">Details</th>
                <th className="p-4">IP Subnet</th>
                <th className="p-4">Workstation / Device</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <div>Streaming activity logs...</div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-400">
                    No activity logs recorded matching criteria
                  </td>
                </tr>
              ) : (
                logs.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 text-xs font-mono text-slate-400">
                      {formatDate(item.timestamp)}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white text-xs">{item.studentName}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                        {item.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-200">
                      {item.details}
                    </td>
                    <td className="p-4 text-xs font-mono text-emerald-400">
                      {item.ipAddress}
                    </td>
                    <td className="p-4 text-xs text-slate-400">
                      {item.device}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
