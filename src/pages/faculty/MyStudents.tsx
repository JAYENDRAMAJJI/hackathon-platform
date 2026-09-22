import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  LineChart,
  Activity,
  FileCode,
  AlertTriangle,
  History,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../lib/api';
import { User } from '../../types/admin';
import { exportToCSV, formatDate } from '../../lib/exportUtils';
import { useToast } from '../../context/AdminToastContext';

export default function MyStudents() {
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sessionStatusFilter, setSessionStatusFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [sortOrder, setSortOrder] = useState('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchStudents = async (isManual = false) => {
    try {
      setRefreshing(true);
      const params: Record<string, any> = {
        sortBy,
        sortOrder,
      };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (sessionStatusFilter) params.sessionStatus = sessionStatusFilter;
      if (difficultyFilter) params.difficulty = difficultyFilter;
      if (departmentFilter) params.department = departmentFilter;

      const resp = await apiClient.get('/faculty/students', params);
      if (resp.success && resp.data) {
        setStudents(resp.data);
      }
      if (isManual) {
        showToast('success', 'Assigned students roster refreshed');
      }
    } catch (err) {
      console.error('Failed to load students:', err);
      showToast('error', 'Failed to fetch assigned students');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [search, statusFilter, sessionStatusFilter, difficultyFilter, departmentFilter, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchStudents();
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setSessionStatusFilter('');
    setDifficultyFilter('');
    setDepartmentFilter('');
    setSortBy('score');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const handleExport = () => {
    if (!students || students.length === 0) {
      showToast('warning', 'No students to export');
      return;
    }

    const exportData = students.map((s) => ({
      'Student ID': s.id,
      'Full Name': s.name,
      'Email Address': s.email,
      'Department': s.department || 'Computer Science & Engineering',
      'Account Status': s.status === 'ACTIVE' ? 'Active' : s.status === 'PENDING' ? 'Pending Approval' : s.status === 'SUSPENDED' ? 'Suspended' : s.status || 'Active',
      'Session Status': s.sessionStatus || 'OFFLINE',
      'Contest Score': s.score ?? 0,
      'Rank': s.rank ?? 'Unranked',
      'Current Level': s.currentDifficulty ? `Level ${s.currentDifficulty}` : 'Level 1',
      'Highest Level Reached': s.highestDifficulty ? `Level ${s.highestDifficulty}` : 'Level 1',
      'Problems Solved': s.solvedCount ?? 0,
      'Total Attempts': s.attemptsCount ?? 0,
      'Problems Skipped': s.skippedCount ?? 0,
      'Last Login': formatDate(s.lastLogin),
    }));

    exportToCSV('Hackathon_Arena_Supervised_Students', exportData);
    showToast('success', `Exported ${exportData.length} supervised student records to CSV`);
  };

  // Paginated records
  const totalPages = Math.ceil(students.length / pageSize) || 1;
  const paginatedStudents = students.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-400" />
            My Supervised Students
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage, inspect progress, and review live competition performance for your assigned cohort.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchStudents(true)}
            disabled={refreshing}
            className="text-xs font-semibold flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 rounded-xl"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={handleExport}
            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-sm font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student ID, full name, or university email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-5 py-2 font-semibold rounded-xl">
            Search
          </Button>
        </form>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-bold text-slate-300">Filters:</span>
          </div>

          {/* Session Status */}
          <select
            value={sessionStatusFilter}
            onChange={(e) => {
              setSessionStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs font-medium focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Session States</option>
            <option value="ACTIVE">Active in Arena</option>
            <option value="IDLE">Idle</option>
            <option value="COMPLETED">Completed</option>
            <option value="OFFLINE">Offline</option>
            <option value="PAUSED">Paused</option>
          </select>

          {/* Difficulty Level */}
          <select
            value={difficultyFilter}
            onChange={(e) => {
              setDifficultyFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs font-medium focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Difficulty Levels (1–10)</option>
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Level {i + 1}
              </option>
            ))}
          </select>

          {/* Department */}
          <select
            value={departmentFilter}
            onChange={(e) => {
              setDepartmentFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs font-medium focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="Information Technology">Information Technology</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs font-medium focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Account Statuses</option>
            <option value="ACTIVE">Active Account</option>
            <option value="PENDING">Pending Approval</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          {(search || statusFilter || sessionStatusFilter || difficultyFilter || departmentFilter) && (
            <button
              onClick={clearFilters}
              className="text-xs text-rose-400 hover:text-rose-300 underline font-medium cursor-pointer ml-1"
            >
              Reset Filters
            </button>
          )}

          <div className="ml-auto text-xs text-slate-400 font-medium">
            Showing <span className="font-bold text-white">{students.length}</span> assigned students
          </div>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/90 text-xs font-bold uppercase tracking-wider text-slate-200 border-b border-slate-700">
              <tr>
                <th className="p-4">Student Name & ID</th>
                <th className="p-4">Department</th>
                <th className="p-4">Session Status</th>
                <th className="p-4 text-center">Current Level</th>
                <th className="p-4 text-center">Score</th>
                <th className="p-4 text-center">Rank</th>
                <th className="p-4 text-center">Solved / Attempts</th>
                <th className="p-4 text-center">Skipped</th>
                <th className="p-4">Last Login</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {loading && students.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-10 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <div>Loading supervised students roster...</div>
                  </td>
                </tr>
              ) : paginatedStudents.length > 0 ? (
                paginatedStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 text-white font-bold flex items-center justify-center text-xs ring-2 ring-indigo-500/30 shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p
                            className="font-bold text-white hover:text-indigo-400 cursor-pointer text-sm truncate"
                            onClick={() => navigate(`/faculty/students/${student.id}`)}
                          >
                            {student.name}
                          </p>
                          <p className="text-xs text-slate-400 font-mono truncate">{student.id} • {student.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-slate-300 font-medium">
                      {student.department || 'Computer Science'}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                          student.sessionStatus === 'ACTIVE'
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                            : student.sessionStatus === 'COMPLETED'
                            ? 'bg-indigo-950/60 text-indigo-400 border-indigo-500/30'
                            : student.sessionStatus === 'PAUSED'
                            ? 'bg-amber-950/60 text-amber-400 border-amber-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            student.sessionStatus === 'ACTIVE'
                              ? 'bg-emerald-400 animate-ping'
                              : student.sessionStatus === 'COMPLETED'
                              ? 'bg-indigo-400'
                              : student.sessionStatus === 'PAUSED'
                              ? 'bg-amber-400'
                              : 'bg-slate-500'
                          }`}
                        />
                        {student.sessionStatus || 'OFFLINE'}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-950/60 text-indigo-300 border border-indigo-800/60">
                        Level {student.currentDifficulty || 1} / 10
                      </span>
                    </td>

                    <td className="p-4 text-center font-mono font-bold text-indigo-400 text-sm">
                      {student.score || 0} pts
                    </td>

                    <td className="p-4 text-center font-bold text-amber-400 text-sm">
                      #{student.rank || '-'}
                    </td>

                    <td className="p-4 text-center">
                      <span className="font-bold text-emerald-400">
                        {student.solvedCount || 0}
                      </span>
                      <span className="text-slate-400"> / {student.attemptsCount || 0}</span>
                    </td>

                    <td className="p-4 text-center text-amber-400 font-bold">
                      {student.skippedCount || 0}
                    </td>

                    <td className="p-4 text-slate-400 font-mono text-xs">
                      {new Date(student.lastLogin).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/faculty/students/${student.id}`)}
                          title="View Profile Details"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-indigo-400" />
                        </button>
                        <button
                          onClick={() => navigate(`/faculty/students/${student.id}/performance`)}
                          title="Performance Analytics"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all shadow-xs"
                        >
                          <LineChart className="w-3.5 h-3.5 text-blue-400" />
                        </button>
                        <button
                          onClick={() => navigate(`/faculty/live-sessions/sess_${student.id}`)}
                          title="Live Monitor"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all shadow-xs"
                        >
                          <Activity className="w-3.5 h-3.5 text-emerald-400" />
                        </button>
                        <button
                          onClick={() => navigate(`/faculty/students/${student.id}/activity`)}
                          title="Activity Timeline"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all shadow-xs"
                        >
                          <History className="w-3.5 h-3.5 text-purple-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-slate-400">
                    <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    No students found matching current supervisory filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90 text-xs">
            <span className="text-slate-400 font-medium">
              Showing page <span className="font-bold text-white">{currentPage}</span> of <span className="font-bold text-white">{totalPages}</span>
            </span>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-8 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 disabled:opacity-40"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
