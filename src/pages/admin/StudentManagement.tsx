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
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { User } from '../../types/admin';
import { exportJsonToCsv, formatDate } from '../../lib/exportUtils';
import { useToast } from '../../context/AdminToastContext';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

export default function StudentManagement() {
  const [searchParams] = useSearchParams();
  const [students, setStudents] = useState<User[]>([]);
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

      const resp = await apiClient.get('/admin/students', params);
      if (resp.success && resp.data) {
        setStudents(resp.data);
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
  }, [search, difficultyFilter, sessionStatusFilter]);

  const handleOpenStudentDrawer = async (student: User) => {
    setSelectedStudent(student);
    setStudentDetailsLoading(true);
    try {
      const resp = await apiClient.get(`/admin/students/${student.id}`);
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
      'Contest Score': s.score ?? 0,
      'Rank': s.rank ?? 'Unranked',
      'Current Level': s.currentDifficulty ? `Level ${s.currentDifficulty}` : 'Level 1',
      'Highest Level Reached': s.highestDifficulty ? `Level ${s.highestDifficulty}` : 'Level 1',
      'Problems Solved': s.solvedCount ?? 0,
      'Problems Skipped': s.skippedCount ?? 0,
      'Total Attempts': s.attemptsCount ?? 0,
      'Account Status': s.status === 'ACTIVE' ? 'Active' : s.status === 'PENDING' ? 'Pending Approval' : s.status === 'SUSPENDED' ? 'Suspended' : s.status || 'Active',
      'Session Status': s.sessionStatus || 'OFFLINE',
      'Assigned Faculty': s.assignedFacultyName || 'Unassigned',
      'Registration Date': formatDate(s.registrationDate),
      'Last Login': formatDate(s.lastLogin),
    }));

    exportJsonToCsv('Hackathon_Arena_Students', exportData);
    toast.success(`Exported ${exportData.length} student performance records to CSV`);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <GraduationCap className="w-6 h-6 text-blue-400" /> Student Performance & Session Records
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time difficulty progression, problem attempts, session logs, and fraud inspections.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-blue-400" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters Strip */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchStudents();
          }}
          className="relative w-full md:w-96 flex items-center"
        >
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student by name, email, or ID..."
            className="w-full pl-10 pr-20 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all"
            >
              Search
            </button>
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Difficulty Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Difficulty Level:</span>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Levels (1–10)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => (
                <option key={lvl} value={lvl}>Level {lvl}</option>
              ))}
            </select>
          </div>

          {/* Session Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Session Status:</span>
            <select
              value={sessionStatusFilter}
              onChange={(e) => setSessionStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Sessions</option>
              <option value="ACTIVE">Active in Arena</option>
              <option value="IDLE">Idle</option>
              <option value="COMPLETED">Completed</option>
              <option value="OFFLINE">Offline</option>
            </select>
          </div>

          {(search || difficultyFilter !== 'ALL' || sessionStatusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setDifficultyFilter('ALL');
                setSessionStatusFilter('ALL');
              }}
              className="text-xs text-rose-400 hover:text-rose-300 underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-700">
              <tr>
                <th className="p-4">Rank</th>
                <th className="p-4">Student</th>
                <th className="p-4">Score</th>
                <th className="p-4">Solved / Skips</th>
                <th className="p-4">Level (Current/Highest)</th>
                <th className="p-4">Assigned Faculty</th>
                <th className="p-4">Session Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {loading && students.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <div>Loading student directory...</div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    No students matching specified filters
                  </td>
                </tr>
              ) : (
                students.map((stu) => (
                  <tr key={stu.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <span className={`inline-flex items-center justify-center h-7 w-7 rounded-full text-xs font-extrabold ${
                        stu.rank === 1
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                          : stu.rank === 2
                          ? 'bg-slate-300 text-slate-950'
                          : stu.rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
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
                      <div className="font-extrabold text-blue-400">{stu.score || 0} pts</div>
                    </td>
                    <td className="p-4 text-xs">
                      <span className="text-emerald-400 font-bold">{stu.solvedCount || 0} solved</span>
                      <span className="text-slate-500"> / </span>
                      <span className="text-amber-400 font-medium">{stu.skippedCount || 0} skips</span>
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
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        stu.sessionStatus === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : stu.sessionStatus === 'IDLE'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : stu.sessionStatus === 'COMPLETED'
                          ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                          : 'bg-slate-700 text-slate-400 border border-slate-600'
                      }`}>
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
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white text-xs font-semibold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> Performance
                        </button>
                        {stu.status === 'ACTIVE' ? (
                          <button
                            onClick={() => setModalState({ isOpen: true, type: 'SUSPEND', targetStudent: stu })}
                            className="p-1.5 rounded-lg text-amber-400 hover:bg-amber-950/40"
                            title="Suspend Access"
                          >
                            <PauseCircle className="w-4 h-4" />
                          </button>
                        ) : stu.status === 'SUSPENDED' ? (
                          <button
                            onClick={() => handleActivate(stu)}
                            className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-950/40"
                            title="Activate Access"
                          >
                            <PlayCircle className="w-4 h-4" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
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
                  <p className="text-xs text-slate-400">{selectedStudent.email} • {selectedStudent.department || 'Computer Science'}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Performance KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400">Score</div>
                <div className="text-xl font-extrabold text-blue-400 mt-0.5">{selectedStudent.score || 0} pts</div>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400">Rank</div>
                <div className="text-xl font-extrabold text-amber-400 mt-0.5">#{selectedStudent.rank || '-'}</div>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400">Current Level</div>
                <div className="text-xl font-extrabold text-emerald-400 mt-0.5">L{selectedStudent.currentDifficulty || 1}</div>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400">Solved</div>
                <div className="text-xl font-extrabold text-purple-400 mt-0.5">{selectedStudent.solvedCount || 0}</div>
              </div>
            </div>

            {/* Difficulty Progression Timeline */}
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

            {/* Submission History */}
            <div className="p-5 bg-slate-800/40 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Code2 className="w-4 h-4 text-blue-400" /> Recent Compiler Submissions
              </h3>
              <div className="divide-y divide-slate-800 text-xs">
                {studentDetails?.submissions?.map((sub: any) => (
                  <div key={sub.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">{sub.questionTitle} (L{sub.difficulty})</div>
                      <div className="text-slate-400 text-[11px]">{formatDate(sub.submittedAt)} • {sub.executionTimeMs}ms • {sub.memoryUsedMb}</div>
                    </div>
                    <span className={`font-bold px-2 py-0.5 rounded-md ${
                      sub.result === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {sub.result}
                    </span>
                  </div>
                )) || <div className="text-slate-400 py-2">Loading submissions...</div>}
              </div>
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
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
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
