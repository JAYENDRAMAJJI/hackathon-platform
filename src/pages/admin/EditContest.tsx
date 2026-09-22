import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Trophy,
  Calendar,
  Clock,
  Users,
  Code2,
  Shield,
  Layers,
  ArrowLeft,
  Save,
  Sliders,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ListPlus,
  KeyRound,
  RefreshCw,
  UserCheck,
  Globe
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { useToast } from '../../context/AdminToastContext';
import { Contest, User } from '../../types/admin';
import AssignFacultyDropdown from '../../components/admin/AssignFacultyDropdown';

export default function EditContest() {
  const { id: contestId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [contest, setContest] = useState<Contest | null>(null);
  const [availableFaculty, setAvailableFaculty] = useState<User[]>([]);
  const [selectedFacultyIds, setSelectedFacultyIds] = useState<string[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    durationMinutes: 120,
    maxParticipants: 100,
    status: 'DRAFT',
    isPublished: true,
    difficultyMin: 1,
    difficultyMax: 10,
    questionCount: 20,
    kotlinOnly: true,
    attemptPenalty: 2,
    skipImpact: 5,
    tieBreaker: 'TOTAL_TIME_ASC',
    attemptRules: 'Max 10 submissions per problem. -2 penalty on score per failed attempt.',
    skipRules: 'Max 3 problem skips allowed. Deducts 5 points per skip.',
    leaderboardVisible: true,
    autoStart: true,
    autoEnd: true,
    sessionPolicy: 'STRICT_SINGLE_SESSION',
    singleActiveSession: true,
    cpuLimitSec: 5,
    memoryLimitMb: 256,
    maxCodeSizeKb: 10,
    networkDisabled: true,
    readOnlyFs: true,
  });

  const generateRandomCode = () => {
    const prefixes = ['HACK', 'ARENA', 'CODE', 'SPRINT', 'DEV', 'ALGO'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${num}`;
  };

  useEffect(() => {
    const fetchContestAndFaculty = async () => {
      if (!contestId) return;
      setLoading(true);
      try {
        const [contestResp, facResp] = await Promise.all([
          apiClient.get(`/admin/contests/${contestId}`),
          apiClient.get('/admin/faculty'),
        ]);

        if (facResp.success && facResp.data) {
          setAvailableFaculty(facResp.data);
        }

        if (contestResp.success && contestResp.data) {
          const c = contestResp.data;
          setContest(c);

          let parsedTime = '10:00';
          if (c.startTime && c.startTime.includes('T')) {
            parsedTime = c.startTime.split('T')[1].substring(0, 5);
          }

          setSelectedFacultyIds(c.assignedFacultyIds || (c.assignedFaculty?.map((f: any) => f.id) ?? []));

          setFormData({
            name: c.name || '',
            code: c.code || c.accessCode || '',
            description: c.description || '',
            date: c.date || (c.startTime ? c.startTime.split('T')[0] : new Date().toISOString().split('T')[0]),
            startTime: parsedTime,
            durationMinutes: c.durationMinutes || 120,
            maxParticipants: c.maxParticipants || 100,
            status: c.status || 'DRAFT',
            isPublished: c.isPublished !== false,
            difficultyMin: c.difficultyRange ? c.difficultyRange[0] : 1,
            difficultyMax: c.difficultyRange ? c.difficultyRange[1] : 10,
            questionCount: c.questionIds ? c.questionIds.length : (c.questionCount || 20),
            kotlinOnly: true,
            attemptPenalty: c.scoringConfig?.attemptPenalty ?? 2,
            skipImpact: c.scoringConfig?.skipImpact ?? 5,
            tieBreaker: c.scoringConfig?.tieBreaker || 'TOTAL_TIME_ASC',
            attemptRules: c.attemptRules || 'Max 10 submissions per problem.',
            skipRules: c.skipRules || 'Max 3 problem skips allowed.',
            leaderboardVisible: c.leaderboardVisible !== false,
            autoStart: c.autoStart !== false,
            autoEnd: c.autoEnd !== false,
            sessionPolicy: c.sessionPolicy || 'STRICT_SINGLE_SESSION',
            singleActiveSession: c.singleActiveSession !== false,
            cpuLimitSec: c.codeExecutionLimits?.cpuLimitSec ?? 5,
            memoryLimitMb: c.codeExecutionLimits?.memoryLimitMb ?? 256,
            maxCodeSizeKb: c.codeExecutionLimits?.maxCodeSizeKb ?? 10,
            networkDisabled: c.codeExecutionLimits?.networkDisabled !== false,
            readOnlyFs: c.codeExecutionLimits?.readOnlyFs !== false,
          });
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to fetch contest details');
      } finally {
        setLoading(false);
      }
    };

    fetchContestAndFaculty();
  }, [contestId]);

  // Calculate Computed End Time
  const calculateEndTime = () => {
    try {
      const [hours, minutes] = formData.startTime.split(':').map(Number);
      const start = new Date(formData.date);
      start.setHours(hours || 0, minutes || 0, 0, 0);
      const end = new Date(start.getTime() + (Number(formData.durationMinutes) || 120) * 60000);
      return end.toISOString();
    } catch {
      return new Date(Date.now() + 7200000).toISOString();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Contest name is required');
      return;
    }
    if (!formData.code.trim()) {
      toast.error('Contest access code is required');
      return;
    }

    setSubmitting(true);
    try {
      const computedStart = `${formData.date}T${formData.startTime}:00Z`;
      const computedEnd = calculateEndTime();

      const payload = {
        name: formData.name,
        code: formData.code.trim().toUpperCase(),
        accessCode: formData.code.trim().toUpperCase(),
        description: formData.description,
        date: formData.date,
        startTime: computedStart,
        endTime: computedEnd,
        durationMinutes: Number(formData.durationMinutes),
        maxParticipants: Number(formData.maxParticipants),
        status: formData.status,
        isPublished: formData.status !== 'DRAFT',
        difficultyRange: [Number(formData.difficultyMin), Number(formData.difficultyMax)],
        questionCount: Number(formData.questionCount),
        assignedFacultyIds: selectedFacultyIds,
        kotlinOnly: true,
        scoringConfig: {
          difficultyWeights: contest?.scoringConfig?.difficultyWeights || {
            1: 10, 2: 20, 3: 35, 4: 55, 5: 80,
            6: 110, 7: 150, 8: 200, 9: 260, 10: 330,
          },
          attemptPenalty: Number(formData.attemptPenalty),
          skipImpact: Number(formData.skipImpact),
          tieBreaker: formData.tieBreaker,
        },
        attemptRules: formData.attemptRules,
        skipRules: formData.skipRules,
        leaderboardVisible: formData.leaderboardVisible,
        autoStart: formData.autoStart,
        autoEnd: formData.autoEnd,
        sessionPolicy: formData.sessionPolicy,
        singleActiveSession: formData.singleActiveSession,
        codeExecutionLimits: {
          cpuLimitSec: Number(formData.cpuLimitSec),
          memoryLimitMb: Number(formData.memoryLimitMb),
          maxCodeSizeKb: Number(formData.maxCodeSizeKb),
          networkDisabled: formData.networkDisabled,
          readOnlyFs: formData.readOnlyFs,
        },
      };

      const resp = await apiClient.put(`/admin/contests/${contestId}`, payload);
      if (resp.success) {
        toast.success(`Contest "${formData.name}" (Code: ${payload.code}) updated successfully!`);
        navigate('/admin/contests');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update contest');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-sm">Loading contest configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/contests"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Sliders className="w-6 h-6 text-amber-400" /> Edit Contest Configuration
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Update challenge schedule, access code, supervisors, and sandbox constraints.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/admin/contests/${contestId}/questions`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-bold border border-slate-700"
          >
            <Code2 className="w-4 h-4" /> Manage Questions ({contest?.questionIds?.length || contest?.questionCount || 0})
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information & Access Code */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-blue-400" /> Basic Contest Information & Access Code
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Status:</span>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-blue-500"
              >
                <option value="DRAFT">DRAFT</option>
                <option value="SCHEDULED">SCHEDULED</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="PAUSED">PAUSED</option>
                <option value="ENDED">ENDED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-slate-300">Contest Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-300 flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" /> Contest Code *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const newCode = generateRandomCode();
                      setFormData({ ...formData, code: newCode });
                      toast.info(`Regenerated contest access code: ${newCode}`);
                    }}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
                  >
                    <RefreshCw className="w-3 h-3 hover:rotate-180 transition-transform duration-300" /> Auto
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-amber-500/40 rounded-xl text-amber-300 font-mono font-bold text-sm tracking-wider uppercase focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Description & Overview</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Contest Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Start Time (UTC) *
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Duration (Minutes) *
                </label>
                <input
                  type="number"
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* End Time Calculated Preview */}
            <div className="p-3 bg-blue-950/30 border border-blue-500/30 rounded-xl flex items-center justify-between text-xs text-blue-300">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>Calculated End Time: <b>{new Date(calculateEndTime()).toLocaleString()}</b></span>
              </div>
              <span className="text-[11px] bg-blue-500/20 px-2 py-0.5 rounded text-blue-300 border border-blue-500/30 font-semibold">
                Auto-Synced Server Clock
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" /> Max Capacity (Participants)
                </label>
                <input
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300 flex items-center gap-1">
                  <Code2 className="w-3.5 h-3.5 text-slate-400" /> Attached Question Pool
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    disabled
                    value={contest?.questionIds?.length || formData.questionCount}
                    className="w-full px-3.5 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-slate-300 text-sm"
                  />
                  <Link
                    to={`/admin/contests/${contestId}/questions`}
                    className="px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold whitespace-nowrap text-xs flex items-center gap-1"
                  >
                    <ListPlus className="w-3.5 h-3.5" /> Manage
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1b: Assigned Faculty Supervisors */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <AssignFacultyDropdown
            contestId={contestId}
            contestName={formData.name || contest?.name}
            selectedFacultyIds={selectedFacultyIds}
            onChange={(ids) => setSelectedFacultyIds(ids)}
            showSaveButton={true}
            title="Assigned Faculty Supervisors"
            description="Faculty members assigned here receive live telemetry, student submission logs, proctoring alert notifications, and exclusive supervisory access."
          />
        </div>

        {/* Section 2: Difficulty & Calibration Rules */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Layers className="w-4 h-4 text-emerald-400" /> Difficulty Calibration & Penalties
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Minimum Starting Difficulty</label>
              <select
                value={formData.difficultyMin}
                onChange={(e) => setFormData({ ...formData, difficultyMin: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              >
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <option key={lvl} value={lvl}>Level {lvl}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Maximum Target Difficulty</label>
              <select
                value={formData.difficultyMax}
                onChange={(e) => setFormData({ ...formData, difficultyMax: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              >
                {[6, 7, 8, 9, 10].map((lvl) => (
                  <option key={lvl} value={lvl}>Level {lvl}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Failed Attempt Penalty</label>
              <input
                type="number"
                value={formData.attemptPenalty}
                onChange={(e) => setFormData({ ...formData, attemptPenalty: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Skip Penalty</label>
              <input
                type="number"
                value={formData.skipImpact}
                onChange={(e) => setFormData({ ...formData, skipImpact: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Tie-Breaking Formula</label>
              <select
                value={formData.tieBreaker}
                onChange={(e) => setFormData({ ...formData, tieBreaker: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="TOTAL_TIME_ASC">Least Total Time (Ascending)</option>
                <option value="LEAST_ATTEMPTS">Fewest Attempts Taken</option>
                <option value="HIGHEST_DIFFICULTY_SOLVED">Highest Difficulty Problem Solved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Security & Execution Limits */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Shield className="w-4 h-4 text-purple-400" /> Security & Kotlin Sandbox Constraints
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">CPU Execution Timeout (sec)</label>
              <input
                type="number"
                value={formData.cpuLimitSec}
                onChange={(e) => setFormData({ ...formData, cpuLimitSec: Number(e.target.value) })}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Worker Memory Limit (MB)</label>
              <input
                type="number"
                value={formData.memoryLimitMb}
                onChange={(e) => setFormData({ ...formData, memoryLimitMb: Number(e.target.value) })}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Max Code Size (KB)</label>
              <input
                type="number"
                value={formData.maxCodeSizeKb}
                onChange={(e) => setFormData({ ...formData, maxCodeSizeKb: Number(e.target.value) })}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.singleActiveSession}
                onChange={(e) => setFormData({ ...formData, singleActiveSession: e.target.checked })}
                className="rounded bg-slate-700 border-slate-600 text-blue-600 focus:ring-0"
              />
              <span className="font-semibold text-white">Enforce Single Active Session Per Student</span>
            </label>

            <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.networkDisabled}
                onChange={(e) => setFormData({ ...formData, networkDisabled: e.target.checked })}
                className="rounded bg-slate-700 border-slate-600 text-blue-600 focus:ring-0"
              />
              <span className="font-semibold text-white">Disable Docker Sandbox Outbound Network Access</span>
            </label>

            <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.leaderboardVisible}
                onChange={(e) => setFormData({ ...formData, leaderboardVisible: e.target.checked })}
                className="rounded bg-slate-700 border-slate-600 text-blue-600 focus:ring-0"
              />
              <span className="font-semibold text-white">Live Leaderboard Visible to Participants</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            to="/admin/contests"
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25"
          >
            {submitting ? 'Saving Changes...' : 'Save Contest Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
