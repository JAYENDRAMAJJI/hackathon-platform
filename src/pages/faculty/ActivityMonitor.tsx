import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  Search,
  Filter,
  RefreshCw,
  Download,
  Activity,
  Code2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
  Pause,
  Play,
  Radio,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { apiClient } from '../../lib/api';
import { ActivityLog } from '../../types/admin';
import { exportToCSV, formatDate } from '../../lib/exportUtils';
import { useToast } from '../../context/AdminToastContext';

export default function ActivityMonitor() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activityFilter, setActivityFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [isPaused, setIsPaused] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchActivities = async (isManual = false) => {
    try {
      setRefreshing(true);
      const params: Record<string, any> = {};
      if (search) params.search = search;
      if (activityFilter) params.activity = activityFilter;
      if (difficultyFilter) params.difficulty = difficultyFilter;

      const resp = await apiClient.get('/faculty/activity', params);
      if (resp.success && resp.data) {
        setActivities(resp.data);
        if (isManual) {
          showToast('success', 'Cohort activity monitor refreshed');
        }
      }
    } catch (err) {
      console.error('Failed to load faculty activity stream:', err);
      if (isManual) {
        showToast('error', 'Failed to refresh activity monitor');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActivities(false);
  }, [activityFilter, difficultyFilter]);

  // Connect to SSE stream for live updates
  useEffect(() => {
    if (isPaused) return;

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/faculty/events');
      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === 'ACTIVITY_LOG' && parsed.data) {
            setActivities((prev) => [parsed.data, ...prev.slice(0, 99)]);
          }
        } catch {
          // Ignore parse errors
        }
      };
      eventSource.onerror = () => {
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
      };
    } catch {
      // Ignore SSE init errors
    }

    return () => {
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
    };
  }, [isPaused]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchActivities(true);
  };

  const handleExport = () => {
    if (!activities || activities.length === 0) {
      showToast('warning', 'No activity records to export');
      return;
    }

    const data = activities.map((a) => ({
      'Timestamp': formatDate(a.timestamp),
      'Student ID': a.studentId,
      'Student Name': a.studentName,
      'Event Action': a.action || a.details,
      'Event Details': a.details,
      'IP Address': a.ipAddress,
      'Device': a.device,
      'Session ID': a.sessionId,
    }));

    exportToCSV('Hackathon_Arena_Faculty_Activity_Stream', data);
    showToast('success', `Exported ${data.length} activity records to CSV`);
  };

  // KPIs
  const passedCount = activities.filter((a) => a.result === 'PASSED' || a.result === 'ACCEPTED').length;
  const skipCount = activities.filter((a) => a.activity?.toLowerCase().includes('skip')).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Activity className="w-6 h-6" />
            </div>
            Supervised Cohort Activity Monitor
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time stream of participant events, compiles, test evaluations, and skips across your assigned cohort.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isPaused ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsPaused(!isPaused)}
            className={`text-xs font-semibold flex items-center gap-1.5 rounded-xl ${
              isPaused
                ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            {isPaused ? (
              <>
                <Play className="w-3.5 h-3.5" /> Resume Stream
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5" /> Pause Stream
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchActivities(true)}
            disabled={refreshing}
            className="text-xs font-semibold flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 rounded-xl"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExport}
            className="text-xs font-semibold flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 rounded-xl"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stream Status Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl text-xs">
        <div className="flex items-center gap-2.5">
          <Radio className={`w-4 h-4 ${isPaused ? 'text-amber-500' : 'text-emerald-400 animate-pulse'}`} />
          <span className="font-bold text-white">
            {isPaused ? 'Live Event Stream PAUSED (Inspecting snapshot)' : 'Live Event Stream ACTIVE (Listening for arena events)'}
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span>{activities.length} Cached Events</span>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400 font-bold">{passedCount} Passed</span>
          <span className="text-slate-600">•</span>
          <span className="text-amber-400 font-bold">{skipCount} Skips</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by student name, question title, or action..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 text-xs bg-slate-800/80 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <select
                value={activityFilter}
                onChange={(e) => setActivityFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs font-semibold focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">All Activities</option>
                <option value="Submitted Code">Submitted Code</option>
                <option value="Question Opened">Question Opened</option>
                <option value="Question Skipped">Question Skipped</option>
                <option value="Difficulty Promoted">Difficulty Promoted</option>
                <option value="Editor Focus">Editor Focus</option>
              </select>

              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs font-semibold focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">All Levels (1–10)</option>
                {Array.from({ length: 10 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Level {i + 1}
                  </option>
                ))}
              </select>

              <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 rounded-xl shadow-md">
                Filter
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Activities Table */}
      <Card className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-800/90 text-xs font-bold uppercase tracking-wider text-slate-200 border-b border-slate-700 select-none">
                <tr>
                  <th className="px-4 py-3.5">Time</th>
                  <th className="px-4 py-3.5">Student</th>
                  <th className="px-4 py-3.5">Activity</th>
                  <th className="px-4 py-3.5">Question Title</th>
                  <th className="px-4 py-3.5 text-center">Level</th>
                  <th className="px-4 py-3.5">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {activities.length > 0 ? (
                  activities.map((act) => (
                    <tr key={act.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-slate-400">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-white">
                        <span
                          className="hover:text-indigo-400 cursor-pointer hover:underline"
                          onClick={() => navigate(`/faculty/students/${act.studentId}`)}
                        >
                          {act.studentName}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-200 font-medium">
                        {act.activity}
                      </td>
                      <td className="px-4 py-3.5 text-slate-300 max-w-[200px] truncate">
                        {act.questionTitle || 'Contest Arena'}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 border border-slate-700 text-blue-400">
                          L{act.difficulty || 1}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge
                          variant={
                            act.result === 'ACCEPTED' || act.result === 'PASSED'
                              ? 'success'
                              : act.result === 'FAILED' || act.result === 'WRONG_ANSWER'
                              ? 'danger'
                              : 'default'
                          }
                        >
                          {act.result || 'COMPLETED'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                      No activity records found matching filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
