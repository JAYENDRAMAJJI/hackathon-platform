import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  History,
  Search,
  Filter,
  RefreshCw,
  ArrowLeft,
  Activity,
  Code2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Layers,
  Users,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { apiClient } from '../../lib/api';
import { ActivityLog, User } from '../../types/admin';
import { exportToCSV, formatDate } from '../../lib/exportUtils';
import { useToast } from '../../context/AdminToastContext';

export default function StudentActivity() {
  const { studentId: routeStudentId } = useParams<{ studentId: string }>();
  const [students, setStudents] = useState<User[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(routeStudentId || '');
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [activityTypeFilter, setActivityTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const resp = await apiClient.get('/faculty/students');
        if (resp.success && resp.data) {
          setStudents(resp.data);
        }
      } catch (err) {
        console.error('Failed to load students for activity filter:', err);
      }
    };
    loadStudents();
  }, []);

  const fetchActivities = async (isManual = false) => {
    try {
      setRefreshing(true);
      const minDelay = isManual ? new Promise((r) => setTimeout(r, 600)) : Promise.resolve();
      const params: Record<string, any> = {};
      if (selectedStudentId) params.studentId = selectedStudentId;
      if (activityTypeFilter) params.activityType = activityTypeFilter;
      if (search) params.search = search;

      const endpoint = selectedStudentId
        ? `/faculty/students/${selectedStudentId}/activity`
        : `/faculty/activity`;

      const [resp] = await Promise.all([
        apiClient.get(endpoint, params),
        minDelay,
      ]);
      if (resp.success && resp.data) {
        setActivities(resp.data);
        if (isManual) {
          showToast('success', 'Student activity timeline refreshed');
        }
      }
    } catch (err) {
      console.error('Failed to load activities:', err);
      if (isManual) {
        showToast('error', 'Failed to refresh activity timeline');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActivities(false);
  }, [selectedStudentId, activityTypeFilter]);

  const filteredActivities = useMemo(() => {
    if (!search.trim()) return activities;
    const q = search.toLowerCase();
    return activities.filter(
      (act) =>
        act.activity?.toLowerCase().includes(q) ||
        act.studentName?.toLowerCase().includes(q) ||
        act.questionTitle?.toLowerCase().includes(q) ||
        act.result?.toLowerCase().includes(q)
    );
  }, [activities, search]);

  const totalPages = Math.ceil(filteredActivities.length / pageSize) || 1;
  const paginatedActivities = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredActivities.slice(start, start + pageSize);
  }, [filteredActivities, currentPage, pageSize]);

  const getActivityIcon = (act: string, result?: string) => {
    if (result === 'ACCEPTED' || result === 'PASSED') return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    if (result === 'FAILED' || result === 'WRONG_ANSWER') return <XCircle className="w-4 h-4 text-rose-400" />;
    if (act?.toLowerCase().includes('skip')) return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    if (act?.toLowerCase().includes('level') || act?.toLowerCase().includes('difficulty')) return <Layers className="w-4 h-4 text-blue-400" />;
    if (act?.toLowerCase().includes('code') || act?.toLowerCase().includes('submit')) return <Code2 className="w-4 h-4 text-indigo-400" />;
    return <Activity className="w-4 h-4 text-slate-400" />;
  };

  const handleExportCSV = () => {
    if (!filteredActivities || filteredActivities.length === 0) {
      showToast('warning', 'No student activity records available to export');
      return;
    }
    const formatted = filteredActivities.map((act) => ({
      'Timestamp': formatDate(act.timestamp),
      'Student ID': act.studentId,
      'Student Name': act.studentName,
      'Event Activity': act.action || act.details,
      'Details / Question': act.details || '-',
      'Session ID': act.sessionId || '-',
      'IP Address': act.ipAddress || '-',
      'Device': act.device || '-',
    }));
    exportToCSV('Hackathon_Arena_Student_Activity_Timeline', formatted);
    showToast('success', `Exported ${formatted.length} activity records to CSV`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/faculty/students')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <History className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Student Activity Timeline
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Filterable chronological stream of arena interactions, compiles, skips, and state transitions.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchActivities(true)}
            disabled={refreshing}
            className="text-xs font-semibold flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 rounded-xl"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Stream
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs font-semibold flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 rounded-xl"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="bg-slate-900 border border-slate-800 shadow-xl rounded-2xl">
        <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by action, student name, question, or result..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white font-medium text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto text-xs">
            {/* Student Dropdown */}
            <div className="flex items-center gap-1.5 min-w-[180px]">
              <Users className="w-4 h-4 text-slate-400" />
              <select
                value={selectedStudentId}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Assigned Students</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Activity Type Dropdown */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={activityTypeFilter}
                onChange={(e) => {
                  setActivityTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Activity Types</option>
                <option value="Submitted Code">Submitted Code</option>
                <option value="Question Opened">Question Opened</option>
                <option value="Question Skipped">Question Skipped</option>
                <option value="Difficulty Promoted">Difficulty Promoted</option>
                <option value="Editor Focus">Editor Focus</option>
                <option value="Contest Login">Contest Login</option>
              </select>
            </div>

            {(selectedStudentId || activityTypeFilter || search) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedStudentId('');
                  setActivityTypeFilter('');
                  setSearch('');
                  setCurrentPage(1);
                }}
                className="text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 h-8 rounded-xl"
              >
                Clear
              </Button>
            )}

            <div className="ml-auto text-xs text-slate-400 font-mono whitespace-nowrap">
              {filteredActivities.length} records
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Stream */}
      <Card className="bg-slate-900 border border-slate-800 shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="p-5 pb-3 border-b border-slate-800 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-black text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            Live Event Stream
          </CardTitle>
          <span className="text-[11px] text-slate-400 font-mono">
            Page {currentPage} of {totalPages}
          </span>
        </CardHeader>
        <CardContent className="p-5 sm:p-6">
          <div className="relative border-l-2 border-slate-800 ml-4 space-y-6">
            {paginatedActivities.length > 0 ? (
              paginatedActivities.map((act) => (
                <div key={act.id} className="relative pl-6 group">
                  {/* Timeline Node */}
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  </div>

                  <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/60 hover:border-indigo-500/40 transition-colors space-y-2 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getActivityIcon(act.activity, act.result)}
                        <span className="font-bold text-white text-xs">{act.activity}</span>
                        <span className="text-slate-600">•</span>
                        <span
                          className="text-indigo-400 font-bold cursor-pointer hover:underline"
                          onClick={() => navigate(`/faculty/students/${act.studentId}`)}
                        >
                          {act.studentName}
                        </span>
                      </div>
                      <span className="font-mono text-slate-500 text-[11px]">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-slate-300">
                      {act.questionTitle && (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 font-medium text-slate-200">
                          Question: {act.questionTitle}
                        </span>
                      )}
                      {act.difficulty && (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 font-bold text-blue-400">
                          Level {act.difficulty}
                        </span>
                      )}
                      {act.result && (
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${
                            act.result === 'ACCEPTED' || act.result === 'PASSED'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : act.result === 'FAILED' || act.result === 'WRONG_ANSWER'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {act.result}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                No activity records found matching filters.
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-800 mt-6">
              <span className="text-xs text-slate-400">
                Showing {(currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, filteredActivities.length)} of{' '}
                {filteredActivities.length} items
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="text-xs font-semibold flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 rounded-xl"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </Button>
                <span className="text-xs font-bold text-white px-2">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="text-xs font-semibold flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 rounded-xl"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
