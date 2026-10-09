import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  GraduationCap,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  PauseCircle,
  PlayCircle,
  Activity,
  Trophy,
  History,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  Code2,
  Download,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { User } from '../../types/admin';
import { exportJsonToCsv, formatDate } from '../../lib/exportUtils';
import { useToast } from '../../context/AdminToastContext';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import StudentActivityTimeline from '../../components/StudentActivityTimeline';

interface ContextOption {
  id: string;
  name: string;
  code?: string;
  status?: string;
  participantsCount?: number;
}

export default function StudentManagement() {
  const [searchParams] = useSearchParams();
  const [students, setStudents] = useState<User[]>([]);
  const [contexts, setContexts] = useState<ContextOption[]>([]);
  const [contextFilter, setContextFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');
  const [sessionStatusFilter, setSessionStatusFilter] = useState('ALL');

  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [studentDetailsLoading, setStudentDetailsLoading] = useState(false);
  const [studentDetails, setStudentDetails] = useState<any | null>(null);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'REJECT' | 'SUSPEND';
    targetStudent?: User;
  }>({ isOpen: false, type: 'REJECT' });

  const toast = useToast();

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (difficultyFilter !== 'ALL') params.difficulty = difficultyFilter;
      if (sessionStatusFilter !== 'ALL') params.sessionStatus = sessionStatusFilter;
      if (contextFilter !== 'ALL') params.contextId = contextFilter;

      const resp = await apiClient.get('/admin/students', params);
      if (resp.success && resp.data) {
        setStudents(resp.data);
      }
      if (Array.isArray(resp.contexts)) {
        setContexts(resp.contexts);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, difficultyFilter, sessionStatusFilter, contextFilter]);

  // Real-time SSE listener
  useEffect(() => {
    const handleUpdate = () => {
      fetchStudents();
    };
    window.addEventListener('admin-contests-updated', handleUpdate);
    window.addEventListener('admin-students-updated', handleUpdate);
    return () => {
      window.removeEventListener('admin-contests-updated', handleUpdate);
      window.removeEventListener('admin-students-updated', handleUpdate);
    };
  }, [contextFilter, search, difficultyFilter, sessionStatusFilter]);

  const handleOpenStudentDrawer = async (student: User) => {
    setSelectedStudent(student);
    setStudentDetailsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (contextFilter !== 'ALL') params.contextId = contextFilter;
      const resp = await apiClient.get(`/admin/students/${student.id}`, params);
      if (resp.success && resp.data) {
        setStudentDetails(resp.data);
      }
    } catch (err: any) {
      toast.error('Failed to load student performance details');
    } finally {
      setStudentDetailsLoading(false);
    }
  };

  const handleApprove = async (student: User) => {
    try {
      const resp = await apiClient.post(`/admin/users/${student.id}/approve`);
      if (resp.success) {
        toast.success(`Student ${student.name} approved`);
        fetchStudents();
      }
    } catch (err: any) {
      toast.error(err.message || 'Approval failed');
    }
  };

  const handleReject = async (reason?: string) => {
    if (!modalState.targetStudent) return;
    try {
      const resp = await apiClient.post(`/admin/users/${modalState.targetStudent.id}/reject`, { reason });
      if (resp.success) {
        toast.warning(`Student ${modalState.targetStudent.name} rejected`);
        fetchStudents();
      }
    } catch (err: any) {
      toast.error(err.message || 'Rejection failed');
    } finally {
      setModalState({ isOpen: false, type: 'REJECT' });
    }
  };

  const handleSuspend = async (reason?: string) => {
    if (!modalState.targetStudent) return;
    try {
      const resp = await apiClient.post(`/admin/users/${modalState.targetStudent.id}/suspend`, { reason });
      if (resp.success) {
        toast.warning(`Student ${modalState.targetStudent.name} suspended`);
        fetchStudents();
      }
    } catch (err: any) {
      toast.error(err.message || 'Suspension failed');
    } finally {
      setModalState({ isOpen: false, type: 'SUSPEND' });
    }
  };

  const handleActivate = async (student: User) => {
    try {
      const resp = await apiClient.post(`/admin/users/${student.id}/activate`);
      if (resp.success) {
        toast.success(`Student ${student.name} activated`);
        fetchStudents();
      }
    } catch (err: any) {
      toast.error(err.message || 'Activation failed');
    }
  };

  const selectedContextName = contexts.find((c) => c.id === contextFilter)?.name;

  const handleExportCSV = () => {
    if (!students || students.length === 0) {
      toast.warning('No student records available to export');
      return;
    }

    const exportData = students.map((s) => ({
      'Student ID': s.id,
      'Full Name': s.name,
      'Email Address': s.email,
      'Department': s.department || 'Computer Science & Engineering',
      'Selected Context': contextFilter !== 'ALL' ? (selectedContextName || contextFilter) : 'All Contexts',
      'Participation Status': s.participationStatus || s.sessionStatus || 'REGISTERED',
      'Assigned Contexts': s.assignedContexts?.map((c) => c.name).join('; ') || 'None',
      'Contest Score': s.score ?? 0,
      'Rank': s.rank ?? 'Unranked',
      'Current Level': s.currentDifficulty ? `Level ${s.currentDifficulty}` : 'Level 1',
      'Highest Level Reached': s.highestDifficulty ? `Level ${s.highestDifficulty}` : 'Level 1',
      'Problems Solved': s.contextSolvedCount ?? s.solvedCount ?? 0,
      'Problems Skipped': s.skippedCount ?? 0,
      'Context Submissions': s.contextSubmissionsCount ?? s.attemptsCount ?? 0,
      'Account Status': s.status === 'ACTIVE' ? 'Active' : s.status === 'PENDING' ? 'Pending Approval' : s.status === 'SUSPENDED' ? 'Suspended' : s.status || 'Active',
      'Session Status': s.sessionStatus || 'OFFLINE',
      'Assigned Faculty': s.assignedFacultyName || 'Unassigned',
      'Registration Date': formatDate(s.registrationDate),
      'Last Login': formatDate(s.lastLogin),
    }));

    const filePrefix = contextFilter !== 'ALL' ? `Students_${selectedContextName?.replace(/\s+/g, '_')}` : 'All_Students';
    exportJsonToCsv(filePrefix, exportData);
    toast.success(`Exported ${exportData.length} student performance records to CSV`);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <GraduationCap className="w-6 h-6 text-blue-400" /> Student Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage student profiles, contest participation, submissions, and live session activity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {contextFilter !== 'ALL' && selectedContextName && (
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
              <Layers className="w-3.5 h-3.5" /> Context: {selectedContextName}
            </span>
          )}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 text-blue-400" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl space-y-3.5">
        {/* Row 1: Search Bar & Count Telemetry */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchStudents();
            }}
            className="relative flex-1 max-w-lg flex items-center"
          >
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students by name, email, or student ID..."
              className="w-full pl-10 pr-24 py-2.5 bg-slate-800/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 font-medium shadow-sm">
              Showing <b className="text-white font-bold">{students.length}</b> student{students.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Row 2: Dynamic Filters & Reset */}
        <div className="border-t border-slate-800/70 pt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Dynamic Context Filter - Context names only */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5 shrink-0">
                <Layers className="w-3.5 h-3.5 text-blue-400" /> Context:
              </span>
              <select
                value={contextFilter}
                onChange={(e) => setContextFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-800 border border-blue-500/40 hover:border-blue-500 rounded-xl text-xs text-white font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors max-w-[280px] truncate"
                title="Filter students by contest context"
              >
                <option value="ALL">All Contexts</option>
                {contexts.map((ctx) => (
                  <option key={ctx.id} value={ctx.id}>
                    {ctx.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium shrink-0">Difficulty:</span>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="ALL">All Levels (1–10)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => (
                  <option key={lvl} value={lvl}>Level {lvl}</option>
                ))}
              </select>
            </div>

            {/* Session Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium shrink-0">Session Status:</span>
              <select
                value={sessionStatusFilter}
                onChange={(e) => setSessionStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="ALL">All Sessions</option>
                <option value="ACTIVE">Active in Arena</option>
                <option value="IDLE">Idle</option>
                <option value="COMPLETED">Completed</option>
                <option value="OFFLINE">Offline</option>
              </select>
            </div>
          </div>

          {(search || difficultyFilter !== 'ALL' || sessionStatusFilter !== 'ALL' || contextFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setDifficultyFilter('ALL');
                setSessionStatusFilter('ALL');
                setContextFilter('ALL');
              }}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium underline flex items-center gap-1 cursor-pointer transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Active Context Bar Banner when filtered */}
      {contextFilter !== 'ALL' && selectedContextName && (
        <div className="px-4 py-3 bg-blue-950/40 border border-blue-500/30 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs text-blue-300">
            <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
            <span>
              Organized by context: <strong className="text-white">{selectedContextName}</strong>. Displaying enrolled participants, submissions, and performance records for this context.
            </span>
          </div>
          <button
            onClick={() => setContextFilter('ALL')}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold underline shrink-0 cursor-pointer"
          >
            Show All Contexts
          </button>
        </div>
      )}

      {/* Students Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-700">
              <tr>
                <th className="p-4">Rank</th>
                <th className="p-4">Student</th>
                <th className="p-4">
                  {contextFilter !== 'ALL' ? 'Context Participation' : 'Assigned Contexts'}
                </th>
                <th className="p-4">Score</th>
                <th className="p-4">Solved / Submissions</th>
                <th className="p-4">Level (Current/Highest)</th>
                <th className="p-4">Assigned Faculty</th>
                <th className="p-4">Session Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {loading && students.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <div>Loading student directory...</div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-400">
                    No students found matching specified context or filters
                  </td>
                </tr>
              ) : (
                students.map((stu) => {
                  const partStatus = stu.participationStatus || (stu.sessionStatus === 'ACTIVE' ? 'ACTIVE' : 'REGISTERED');
                  const solvedCount = typeof stu.contextSolvedCount === 'number' ? stu.contextSolvedCount : (stu.solvedCount || 0);
                  const submissionsCount = typeof stu.contextSubmissionsCount === 'number' ? stu.contextSubmissionsCount : (stu.attemptsCount || 0);

                  return (
                    <tr key={stu.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center justify-center h-7 w-7 rounded-full text-xs font-extrabold ${
                            stu.rank === 1
                              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                              : stu.rank === 2
                              ? 'bg-slate-300 text-slate-950'
                              : stu.rank === 3
                              ? 'bg-amber-700 text-white'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          #{stu.rank || '-'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
                            {stu.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-white truncate">{stu.name}</div>
                            <div className="text-xs text-slate-400 truncate">{stu.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {contextFilter !== 'ALL' ? (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              partStatus === 'ACTIVE'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : partStatus === 'COMPLETED'
                                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                : partStatus === 'ATTEMPTED'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }`}
                          >
                            {partStatus === 'ACTIVE' && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            )}
                            {partStatus}
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {Array.isArray(stu.assignedContexts) && stu.assignedContexts.length > 0 ? (
                              stu.assignedContexts.slice(0, 2).map((ctx) => (
                                <span
                                  key={ctx.id}
                                  className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[11px] text-slate-300 font-medium truncate max-w-[130px]"
                                  title={ctx.name}
                                >
                                  {ctx.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-500 italic">None</span>
                            )}
                            {Array.isArray(stu.assignedContexts) && stu.assignedContexts.length > 2 && (
                              <span className="px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-bold">
                                +{stu.assignedContexts.length - 2} more
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="font-extrabold text-blue-400">{stu.score || 0} pts</div>
                      </td>
                      <td className="p-4 text-xs">
                        <span className="text-emerald-400 font-bold">{solvedCount} solved</span>
                        <span className="text-slate-500"> / </span>
                        <span className="text-slate-300 font-medium">{submissionsCount} subs</span>
                      </td>
                      <td className="p-4">
                        <div className="inline-flex items-center gap-1 text-xs">
                          <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
                            L{stu.currentDifficulty || 1}
                          </span>
                          <span className="text-slate-500">→</span>
                          <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-400 font-bold border border-purple-500/30">
                            Max: L{stu.highestDifficulty || 1}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-xs text-slate-400">
                        {stu.assignedFacultyName || 'Unassigned'}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            stu.sessionStatus === 'ACTIVE'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : stu.sessionStatus === 'IDLE'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : stu.sessionStatus === 'COMPLETED'
                              ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                              : 'bg-slate-700 text-slate-400 border border-slate-600'
                          }`}
                        >
                          {stu.sessionStatus === 'ACTIVE' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          )}
                          {stu.sessionStatus || 'OFFLINE'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenStudentDrawer(stu)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> Performance
                          </button>
                          {stu.status === 'ACTIVE' ? (
                            <button
                              onClick={() => setModalState({ isOpen: true, type: 'SUSPEND', targetStudent: stu })}
                              className="p-1.5 rounded-lg text-amber-400 hover:bg-amber-950/40 cursor-pointer"
                              title="Suspend Access"
                            >
                              <PauseCircle className="w-4 h-4" />
                            </button>
                          ) : stu.status === 'SUSPENDED' ? (
                            <button
                              onClick={() => handleActivate(stu)}
                              className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-950/40 cursor-pointer"
                              title="Activate Access"
                            >
                              <PlayCircle className="w-4 h-4" />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* STUDENT PERFORMANCE INSPECTION SLIDE-OVER DRAWER */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-2xl h-full overflow-y-auto p-6 shadow-2xl space-y-6 animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-lg shadow-lg">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-white">{selectedStudent.name}</h2>
                  <p className="text-xs text-slate-400">
                    {selectedStudent.email} • {selectedStudent.department || 'Computer Science'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Context Scope Banner in Drawer */}
            <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-slate-300">
                  Active Context Scope:{' '}
                  <strong className="text-white">
                    {contextFilter !== 'ALL' && selectedContextName ? selectedContextName : 'All Contexts'}
                  </strong>
                </span>
              </div>
              {contextFilter !== 'ALL' && (
                <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 text-[11px] font-bold border border-blue-500/30">
                  {selectedStudent.participationStatus || 'REGISTERED'}
                </span>
              )}
            </div>

            {/* Associated Contexts List */}
            {(() => {
              const enrolledContexts = selectedStudent.assignedContexts || studentDetails?.profile?.assignedContexts || [];
              if (!Array.isArray(enrolledContexts) || enrolledContexts.length === 0) return null;
              return (
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-slate-400">Enrolled Contexts:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {enrolledContexts.map((ctx: any) => (
                      <span
                        key={ctx.id}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                          ctx.id === contextFilter
                            ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {ctx.name}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Performance KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400">Contest Score</div>
                <div className="text-xl font-extrabold text-blue-400 mt-0.5">{selectedStudent.score || 0} pts</div>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400">Rank</div>
                <div className="text-xl font-extrabold text-amber-400 mt-0.5">#{selectedStudent.rank || '-'}</div>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400">Current Level</div>
                <div className="text-xl font-extrabold text-emerald-400 mt-0.5">
                  L{selectedStudent.currentDifficulty || 1}
                </div>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400">
                  {contextFilter !== 'ALL' ? 'Context Solved' : 'Total Solved'}
                </div>
                <div className="text-xl font-extrabold text-purple-400 mt-0.5">
                  {selectedStudent.contextSolvedCount ?? selectedStudent.solvedCount ?? 0}
                </div>
              </div>
            </div>

            {/* Dynamic Difficulty Progression Timeline */}
            <div className="p-5 bg-slate-800/40 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> Dynamic Difficulty Progression
              </h3>
              <div className="space-y-2">
                {[
                  { lvl: 1, title: 'Two Sum Target Indices', time: '10:05 AM', duration: '4.2 min', passed: true },
                  { lvl: 2, title: 'Valid Balanced Parentheses', time: '10:14 AM', duration: '7.8 min', passed: true },
                  { lvl: 3, title: 'Container With Most Water', time: '10:28 AM', duration: '12.1 min', passed: true },
                  { lvl: 4, title: 'Longest Substring Without Repeating', time: '10:45 AM', duration: '15.5 min', passed: true },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">
                        Level {item.lvl}
                      </span>
                      <span className="font-semibold text-white">{item.title}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400">
                      <span>{item.duration}</span>
                      <span className="text-emerald-400 font-bold">PASSED</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submission History Scoped to Context */}
            <div className="p-5 bg-slate-800/40 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-blue-400" /> Recent Compiler Submissions
                </h3>
                {contextFilter !== 'ALL' && selectedContextName && (
                  <span className="text-[11px] text-slate-400 italic">
                    Filtered for {selectedContextName}
                  </span>
                )}
              </div>
              <div className="divide-y divide-slate-800 text-xs">
                {studentDetailsLoading ? (
                  <div className="text-slate-400 py-4 text-center">Loading submissions...</div>
                ) : studentDetails?.submissions && studentDetails.submissions.length > 0 ? (
                  studentDetails.submissions.map((sub: any) => (
                    <div key={sub.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">
                          {sub.questionTitle} (L{sub.difficulty})
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          {formatDate(sub.submittedAt)} • {sub.executionTimeMs}ms • {sub.memoryUsedMb}MB
                        </div>
                      </div>
                      {(() => {
                        const res = String(sub.result || sub.verdict || '').toUpperCase().trim();
                        const isAcc = res === 'ACCEPTED' || res === 'PASSED' || res === 'SUCCESS';
                        return (
                          <span
                            className={`font-bold px-2 py-0.5 rounded-md ${
                              isAcc
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {sub.result || sub.verdict || 'PENDING'}
                          </span>
                        );
                      })()}
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 py-3 text-center">
                    No submissions recorded for this student in the selected context.
                  </div>
                )}
              </div>
            </div>

            {/* Student Activity Timeline */}
            <div className="pt-2">
              <StudentActivityTimeline
                studentId={selectedStudent.id}
                studentName={selectedStudent.name}
                contestId={contextFilter !== 'ALL' ? contextFilter : undefined}
                role="ADMIN"
                compact={true}
              />
            </div>

            {/* Session Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <Link
                to={`/admin/live-sessions/sess_${selectedStudent.id}`}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
              >
                Inspect Live Session Arena →
              </Link>
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={modalState.isOpen && modalState.type === 'REJECT'}
        onClose={() => setModalState({ isOpen: false, type: 'REJECT' })}
        onConfirm={handleReject}
        title={`Reject Student: ${modalState.targetStudent?.name}`}
        description="Are you sure you want to reject this student? They will be removed from the active contest session."
        confirmText="Reject Student"
        variant="danger"
        requireReason={true}
      />

      <ConfirmModal
        isOpen={modalState.isOpen && modalState.type === 'SUSPEND'}
        onClose={() => setModalState({ isOpen: false, type: 'SUSPEND' })}
        onConfirm={handleSuspend}
        title={`Suspend Student: ${modalState.targetStudent?.name}`}
        description="This will immediately pause their live session."
        confirmText="Suspend Access"
        variant="warning"
        requireReason={true}
      />
    </div>
  );
}
