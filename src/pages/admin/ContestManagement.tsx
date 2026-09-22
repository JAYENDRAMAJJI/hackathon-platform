import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trophy,
  PlusCircle,
  Play,
  Pause,
  StopCircle,
  XCircle,
  Copy,
  Trash2,
  Clock,
  Calendar,
  Users,
  Code2,
  Shield,
  Activity,
  Layers,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  Edit,
  Sliders,
  ListPlus,
  KeyRound,
  UserCheck,
  Globe,
  Eye,
  EyeOff,
  Check,
  CheckCircle2,
  X
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { Contest, ContestStatus, User } from '../../types/admin';
import { formatDate } from '../../lib/exportUtils';
import { useToast } from '../../context/AdminToastContext';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

export default function ContestManagement() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [availableFaculty, setAvailableFaculty] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Filter tab state
  const [filterTab, setFilterTab] = useState<'ALL' | 'ACTIVE' | 'SCHEDULED' | 'DRAFT' | 'ENDED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'START' | 'PAUSE' | 'RESUME' | 'END' | 'CANCEL' | 'DELETE';
    targetContest?: Contest;
  }>({ isOpen: false, type: 'START' });

  // Quick Faculty Assign Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignContest, setAssignContest] = useState<Contest | null>(null);
  const [selectedFacultyForAssign, setSelectedFacultyForAssign] = useState<string[]>([]);
  const [assigningFaculty, setAssigningFaculty] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const fetchContestsAndFaculty = async () => {
    setLoading(true);
    try {
      const [contestResp, facResp] = await Promise.all([
        apiClient.get('/admin/contests'),
        apiClient.get('/admin/faculty'),
      ]);

      if (contestResp.success && contestResp.data) {
        setContests(contestResp.data);
      }
      if (facResp.success && facResp.data) {
        setAvailableFaculty(facResp.data);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch contests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContestsAndFaculty();
  }, []);

  const handleCopyCode = (code: string, contestId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(contestId);
    toast.success(`Contest Code "${code}" copied to clipboard!`);
    setTimeout(() => {
      setCopiedCodeId(null);
    }, 2500);
  };

  const handleTogglePublish = async (contest: Contest) => {
    try {
      const endpoint = contest.isPublished
        ? `/admin/contests/${contest.id}/unpublish`
        : `/admin/contests/${contest.id}/publish`;
      const resp = await apiClient.post(endpoint);
      if (resp.success) {
        toast.success(
          contest.isPublished
            ? `Contest "${contest.name}" unpublished (Hidden from students)`
            : `Contest "${contest.name}" published! (Students can now enter with code)`
        );
        fetchContestsAndFaculty();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update publication status');
    }
  };

  const openAssignModal = (contest: Contest) => {
    setAssignContest(contest);
    setSelectedFacultyForAssign(
      contest.assignedFacultyIds || (contest.assignedFaculty?.map((f: any) => f.id) ?? [])
    );
    setAssignModalOpen(true);
  };

  const handleSaveFacultyAssignment = async () => {
    if (!assignContest) return;
    setAssigningFaculty(true);
    try {
      const resp = await apiClient.post(`/admin/contests/${assignContest.id}/assign-faculty`, {
        facultyIds: selectedFacultyForAssign,
      });
      if (resp.success) {
        toast.success(`Faculty supervisors updated for "${assignContest.name}"`);
        setAssignModalOpen(false);
        fetchContestsAndFaculty();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign faculty');
    } finally {
      setAssigningFaculty(false);
    }
  };

  const handleStart = async (contest: Contest) => {
    try {
      const resp = await apiClient.post(`/admin/contests/${contest.id}/start`);
      if (resp.success) {
        toast.success(`Contest ${contest.name} started successfully!`);
        fetchContestsAndFaculty();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to start contest');
    } finally {
      setModalState({ isOpen: false, type: 'START' });
    }
  };

  const handlePause = async (contest: Contest) => {
    try {
      const resp = await apiClient.post(`/admin/contests/${contest.id}/pause`);
      if (resp.success) {
        toast.warning(`Contest ${contest.name} paused`);
        fetchContestsAndFaculty();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to pause contest');
    } finally {
      setModalState({ isOpen: false, type: 'PAUSE' });
    }
  };

  const handleResume = async (contest: Contest) => {
    try {
      const resp = await apiClient.post(`/admin/contests/${contest.id}/resume`);
      if (resp.success) {
        toast.success(`Contest ${contest.name} resumed`);
        fetchContestsAndFaculty();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to resume contest');
    } finally {
      setModalState({ isOpen: false, type: 'RESUME' });
    }
  };

  const handleEnd = async (contest: Contest) => {
    try {
      const resp = await apiClient.post(`/admin/contests/${contest.id}/end`);
      if (resp.success) {
        toast.info(`Contest ${contest.name} ended`);
        fetchContestsAndFaculty();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to end contest');
    } finally {
      setModalState({ isOpen: false, type: 'END' });
    }
  };

  const handleCancel = async (contest: Contest, reason?: string) => {
    try {
      const resp = await apiClient.post(`/admin/contests/${contest.id}/cancel`, { reason });
      if (resp.success) {
        toast.warning(`Contest ${contest.name} cancelled`);
        fetchContestsAndFaculty();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel contest');
    } finally {
      setModalState({ isOpen: false, type: 'CANCEL' });
    }
  };

  const handleDuplicate = async (contest: Contest) => {
    try {
      const resp = await apiClient.post(`/admin/contests/${contest.id}/duplicate`);
      if (resp.success) {
        toast.success('Contest duplicated as Draft');
        fetchContestsAndFaculty();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to duplicate contest');
    }
  };

  const handleDeleteDraft = async (contest: Contest) => {
    try {
      const resp = await apiClient.delete(`/admin/contests/${contest.id}`);
      if (resp.success) {
        toast.info('Draft contest removed');
        fetchContestsAndFaculty();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete contest');
    } finally {
      setModalState({ isOpen: false, type: 'DELETE' });
    }
  };

  const activeContest = contests.find((c) => c.status === 'ACTIVE');

  // Filtered Contests
  const filteredContests = contests.filter((c) => {
    const matchesFilter =
      filterTab === 'ALL' ||
      (filterTab === 'ACTIVE' && c.status === 'ACTIVE') ||
      (filterTab === 'SCHEDULED' && c.status === 'SCHEDULED') ||
      (filterTab === 'DRAFT' && c.status === 'DRAFT') ||
      (filterTab === 'ENDED' && (c.status === 'ENDED' || c.status === 'CANCELLED'));

    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.code && c.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.accessCode && c.accessCode.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-amber-400" /> Contest Management & Access Control
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure competitions, generate student access codes, assign faculty supervisors, and orchestrate live arena states.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/contests/create"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Create New Contest
          </Link>
          <button
            onClick={fetchContestsAndFaculty}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-sm"
            title="Refresh Contests"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* QUICK STATS KPI BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Total Contests</div>
            <div className="text-xl font-extrabold text-white">{contests.length}</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Live / Active</div>
            <div className="text-xl font-extrabold text-emerald-400">
              {contests.filter((c) => c.status === 'ACTIVE').length}
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Scheduled</div>
            <div className="text-xl font-extrabold text-white">
              {contests.filter((c) => c.status === 'SCHEDULED').length}
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Faculty Supervisors</div>
            <div className="text-xl font-extrabold text-white">{availableFaculty.length}</div>
          </div>
        </div>
      </div>

      {/* ACTIVE CONTEST LIVE CONTROL BAR */}
      {activeContest && (
        <div className="bg-gradient-to-r from-blue-950/80 via-indigo-950/80 to-slate-900 border border-blue-500/40 p-6 rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  CURRENT ACTIVE CONTEST
                </span>
                {/* Contest Access Code Pill */}
                <div className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold text-amber-300">
                  <KeyRound className="w-3 h-3 text-amber-400" />
                  <span>Code: <b>{activeContest.code || activeContest.accessCode || 'OPEN'}</b></span>
                  <button
                    onClick={() => handleCopyCode(activeContest.code || activeContest.accessCode || '', activeContest.id)}
                    className="ml-1 text-amber-400 hover:text-white"
                    title="Copy Code"
                  >
                    {copiedCodeId === activeContest.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <h2 className="text-2xl font-extrabold text-white">{activeContest.name}</h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                <span>Duration: <b>{activeContest.durationMinutes} min</b></span>
                <span>•</span>
                <span>Enrolled: <b>{activeContest.participantsCount || activeContest.participantIds?.length || 0} Students</b></span>
                <span>•</span>
                <span>Assigned Faculty: <b>{activeContest.assignedFaculty?.length || activeContest.assignedFacultyIds?.length || 0} Supervisors</b></span>
                <span>•</span>
                <span>Difficulty: <b>L{activeContest.difficultyRange[0]} - L{activeContest.difficultyRange[1]}</b></span>
              </div>
            </div>

            {/* Direct Operational Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => openAssignModal(activeContest)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition-all"
              >
                <UserCheck className="w-4 h-4 text-purple-400" /> Assign Faculty
              </button>
              <Link
                to={`/admin/contests/${activeContest.id}/questions`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all"
              >
                <Code2 className="w-4 h-4" /> Manage Questions ({activeContest.questionIds?.length || activeContest.questionCount || 0})
              </Link>
              <Link
                to={`/admin/contests/${activeContest.id}/edit`}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
              >
                <Sliders className="w-4 h-4 text-amber-400" /> Edit Config
              </Link>
              <button
                onClick={() => setModalState({ isOpen: true, type: 'PAUSE', targetContest: activeContest })}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md transition-all"
              >
                <Pause className="w-4 h-4" /> Pause Contest
              </button>
              <button
                onClick={() => setModalState({ isOpen: true, type: 'END', targetContest: activeContest })}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition-all"
              >
                <StopCircle className="w-4 h-4" /> End Contest
              </button>
              <Link
                to="/admin/live-sessions"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
              >
                <Activity className="w-4 h-4 text-blue-400" /> Live Arena Table
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* FILTER TABS & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          {(['ALL', 'ACTIVE', 'SCHEDULED', 'DRAFT', 'ENDED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterTab === tab
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab === 'ALL' ? 'All Contests' : tab}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by contest title or code..."
            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* ALL CONTESTS LIST */}
      <div className="space-y-4">
        {filteredContests.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold">No contests match your selected filter.</p>
            <p className="text-xs text-slate-500 mt-1">Try switching tabs or creating a new competition.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredContests.map((c) => {
              const isDraft = c.status === 'DRAFT';
              const isScheduled = c.status === 'SCHEDULED';
              const isActive = c.status === 'ACTIVE';
              const isPaused = c.status === 'PAUSED';
              const isEnded = c.status === 'ENDED';
              const isCancelled = c.status === 'CANCELLED';
              const contestCode = c.code || c.accessCode || 'N/A';

              return (
                <div
                  key={c.id}
                  className={`bg-slate-900 border rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-all ${
                    isActive
                      ? 'border-blue-500/50 bg-slate-900/90'
                      : isPaused
                      ? 'border-amber-500/50'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="space-y-3.5">
                    {/* Header line with Status, Code, and Publication status */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isActive
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : isScheduled
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : isPaused
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : isEnded
                              ? 'bg-slate-700 text-slate-300 border border-slate-600'
                              : isCancelled
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}>
                            {c.status}
                          </span>

                          {/* Contest Access Code Pill */}
                          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold text-amber-300">
                            <KeyRound className="w-3 h-3 text-amber-400" />
                            <span>{contestCode}</span>
                            <button
                              onClick={() => handleCopyCode(contestCode, c.id)}
                              className="ml-1 text-amber-400 hover:text-white transition-colors"
                              title="Copy Access Code"
                            >
                              {copiedCodeId === c.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>

                          {/* Published State Badge */}
                          <button
                            onClick={() => handleTogglePublish(c)}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border transition-all ${
                              c.isPublished
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                            }`}
                            title={c.isPublished ? 'Published to Students (Click to Unpublish)' : 'Draft / Unpublished (Click to Publish)'}
                          >
                            {c.isPublished ? <Globe className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            {c.isPublished ? 'Published' : 'Hidden'}
                          </button>
                        </div>

                        <h4 className="text-lg font-bold text-white leading-tight">{c.name}</h4>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {c.description || 'No description provided.'}
                    </p>

                    {/* Assigned Faculty Section */}
                    <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <UserCheck className="w-4 h-4 text-purple-400 shrink-0" />
                        <div className="text-xs truncate">
                          <span className="text-slate-400 font-medium mr-1.5">Supervisors:</span>
                          {c.assignedFaculty && c.assignedFaculty.length > 0 ? (
                            <span className="font-bold text-purple-300">
                              {c.assignedFaculty.map((f: any) => f.name).join(', ')}
                            </span>
                          ) : (
                            <span className="text-slate-500 italic">No faculty assigned</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => openAssignModal(c)}
                        className="px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-[11px] font-bold shrink-0 transition-all"
                      >
                        Assign
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-slate-800/50 rounded-xl border border-slate-800">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-400" /> Duration
                        </span>
                        <span className="font-bold text-white mt-0.5 block">{c.durationMinutes} minutes</span>
                      </div>
                      <div className="p-2.5 bg-slate-800/50 rounded-xl border border-slate-800">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Users className="w-3 h-3 text-purple-400" /> Enrolled / Max
                        </span>
                        <span className="font-bold text-white mt-0.5 block">
                          {c.participantsCount || c.participantIds?.length || 0} / {c.maxParticipants || 100}
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-800/50 rounded-xl border border-slate-800">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Layers className="w-3 h-3 text-emerald-400" /> Difficulty
                        </span>
                        <span className="font-bold text-white mt-0.5 block">
                          L{c.difficultyRange ? c.difficultyRange[0] : 1} – L{c.difficultyRange ? c.difficultyRange[1] : 10}
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-800/50 rounded-xl border border-slate-800">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-amber-400" /> Scheduled Date
                        </span>
                        <span className="font-bold text-white mt-0.5 block">{c.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contest Card Action Buttons */}
                  <div className="pt-4 border-t border-slate-800/80 mt-4 space-y-3">
                    {/* Dedicated Question & Edit Toolbar */}
                    <div className="flex items-center justify-between gap-2">
                      <Link
                        to={`/admin/contests/${c.id}/questions`}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 text-blue-400 border border-blue-500/30 text-xs font-bold transition-all"
                      >
                        <Code2 className="w-3.5 h-3.5" /> Manage Questions ({c.questionIds?.length || c.questionCount || 0})
                      </Link>
                      <Link
                        to={`/admin/contests/${c.id}/edit`}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
                        title="Edit Contest Settings"
                      >
                        <Edit className="w-3.5 h-3.5 text-amber-400" /> Edit
                      </Link>
                    </div>

                    {/* Lifecycle Controls */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-2">
                        {/* State Transitions */}
                        {(isScheduled || isDraft) && (
                          <button
                            onClick={() => setModalState({ isOpen: true, type: 'START', targetContest: c })}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
                          >
                            <Play className="w-3.5 h-3.5" /> Start
                          </button>
                        )}

                        {isActive && (
                          <button
                            onClick={() => setModalState({ isOpen: true, type: 'PAUSE', targetContest: c })}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-sm"
                          >
                            <Pause className="w-3.5 h-3.5" /> Pause
                          </button>
                        )}

                        {isPaused && (
                          <button
                            onClick={() => setModalState({ isOpen: true, type: 'RESUME', targetContest: c })}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
                          >
                            <Play className="w-3.5 h-3.5" /> Resume
                          </button>
                        )}

                        {(isActive || isPaused) && (
                          <button
                            onClick={() => setModalState({ isOpen: true, type: 'END', targetContest: c })}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-sm"
                          >
                            <StopCircle className="w-3.5 h-3.5" /> End
                          </button>
                        )}

                        {(isScheduled || isActive || isPaused) && (
                          <button
                            onClick={() => setModalState({ isOpen: true, type: 'CANCEL', targetContest: c })}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 text-xs font-semibold"
                            title="Cancel Contest"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {isDraft && (
                          <button
                            onClick={() => setModalState({ isOpen: true, type: 'DELETE', targetContest: c })}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 text-xs font-semibold"
                            title="Delete Draft"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDuplicate(c)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                          title="Duplicate Contest"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* QUICK FACULTY ASSIGNMENT MODAL */}
      {assignModalOpen && assignContest && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-purple-400" /> Assign Faculty Supervisors
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Contest: <b className="text-white">{assignContest.name}</b>
                </p>
              </div>
              <button
                onClick={() => setAssignModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-xs text-slate-300">
                Select one or more faculty members to grant supervisor access:
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {availableFaculty.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No faculty members found in directory.</p>
                ) : (
                  availableFaculty.map((fac) => {
                    const isSelected = selectedFacultyForAssign.includes(fac.id);
                    return (
                      <label
                        key={fac.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer text-xs ${
                          isSelected
                            ? 'bg-purple-600/20 border-purple-500/50 text-white'
                            : 'bg-slate-800/50 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            if (isSelected) {
                              setSelectedFacultyForAssign(selectedFacultyForAssign.filter((id) => id !== fac.id));
                            } else {
                              setSelectedFacultyForAssign([...selectedFacultyForAssign, fac.id]);
                            }
                          }}
                          className="mt-0.5 rounded bg-slate-700 border-slate-600 text-purple-600 focus:ring-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-white truncate">{fac.name}</div>
                          <div className="text-slate-400 text-[11px] truncate">{fac.email}</div>
                          <div className="text-purple-300 text-[10px] mt-0.5">{fac.department || 'Computer Science'}</div>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-xs font-bold text-purple-400">
                {selectedFacultyForAssign.length} Faculty Selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={assigningFaculty}
                  onClick={handleSaveFacultyAssignment}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/25"
                >
                  {assigningFaculty ? 'Saving...' : 'Save Supervisors'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modals for Actions */}
      <ConfirmModal
        isOpen={modalState.isOpen && modalState.type === 'START'}
        onClose={() => setModalState({ isOpen: false, type: 'START' })}
        onConfirm={() => modalState.targetContest && handleStart(modalState.targetContest)}
        title={`Start Contest: ${modalState.targetContest?.name}`}
        description="Starting this competition will open the coding arena for all verified students, launch Docker runner pools, and start the synchronized countdown."
        confirmText="Start Contest Now"
        variant="primary"
      />

      <ConfirmModal
        isOpen={modalState.isOpen && modalState.type === 'PAUSE'}
        onClose={() => setModalState({ isOpen: false, type: 'PAUSE' })}
        onConfirm={() => modalState.targetContest && handlePause(modalState.targetContest)}
        title={`Pause Contest: ${modalState.targetContest?.name}`}
        description="Pausing will freeze the contest clock for all students and temporarily disable Kotlin submission execution."
        confirmText="Pause Contest"
        variant="warning"
      />

      <ConfirmModal
        isOpen={modalState.isOpen && modalState.type === 'RESUME'}
        onClose={() => setModalState({ isOpen: false, type: 'RESUME' })}
        onConfirm={() => modalState.targetContest && handleResume(modalState.targetContest)}
        title={`Resume Contest: ${modalState.targetContest?.name}`}
        description="Resuming will unfreeze the contest timer and re-enable active student submission evaluation."
        confirmText="Resume Contest"
        variant="primary"
      />

      <ConfirmModal
        isOpen={modalState.isOpen && modalState.type === 'END'}
        onClose={() => setModalState({ isOpen: false, type: 'END' })}
        onConfirm={() => modalState.targetContest && handleEnd(modalState.targetContest)}
        title={`Conclude Contest: ${modalState.targetContest?.name}`}
        description="Ending the contest will immediately lock all active sessions, finalize scoring, and lock leaderboard rankings."
        confirmText="Officially End Contest"
        variant="danger"
      />

      <ConfirmModal
        isOpen={modalState.isOpen && modalState.type === 'CANCEL'}
        onClose={() => setModalState({ isOpen: false, type: 'CANCEL' })}
        onConfirm={(reason) => modalState.targetContest && handleCancel(modalState.targetContest, reason)}
        title={`Cancel Contest: ${modalState.targetContest?.name}`}
        description="Cancelling will abort this competition and terminate all active student participation."
        confirmText="Cancel Contest"
        variant="danger"
        requireReason={true}
        reasonPlaceholder="Specify reason for contest cancellation..."
      />

      <ConfirmModal
        isOpen={modalState.isOpen && modalState.type === 'DELETE'}
        onClose={() => setModalState({ isOpen: false, type: 'DELETE' })}
        onConfirm={() => modalState.targetContest && handleDeleteDraft(modalState.targetContest)}
        title="Delete Draft Contest?"
        description="This will permanently delete this draft contest configuration."
        confirmText="Delete Draft"
        variant="danger"
      />
    </div>
  );
}
