import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Trophy,
  Calendar,
  Clock,
  Users,
  Code2,
  Shield,
  Layers,
  Award,
  AlertCircle,
  Save,
  CheckCircle2,
  ArrowLeft,
  Sliders,
  Flame,
  ListPlus,
  CheckSquare,
  Square,
  KeyRound,
  RefreshCw,
  UserCheck,
  Globe,
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { useToast } from '../../context/AdminToastContext';
import { Question, User } from '../../types/admin';
import AssignFacultyDropdown from '../../components/admin/AssignFacultyDropdown';

export default function CreateContest() {
  const navigate = useNavigate();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [availableFaculty, setAvailableFaculty] = useState<User[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>(['q_1', 'q_2', 'q_3', 'q_4', 'q_5']);
  const [selectedFacultyIds, setSelectedFacultyIds] = useState<string[]>(['usr_fac_1']);
  const [showQuestionPicker, setShowQuestionPicker] = useState(false);

  const generateRandomCode = () => {
    const prefixes = ['HACK', 'ARENA', 'CODE', 'SPRINT', 'DEV', 'ALGO'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${num}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [qResp, facResp] = await Promise.all([
          apiClient.get('/admin/questions'),
          apiClient.get('/admin/faculty'),
        ]);
        if (qResp.success && qResp.data) {
          setAvailableQuestions(qResp.data);
        }
        if (facResp.success && facResp.data) {
          setAvailableFaculty(facResp.data);
          if (facResp.data.length > 0 && selectedFacultyIds.length === 0) {
            setSelectedFacultyIds([facResp.data[0].id]);
          }
        }
      } catch (err) {
        console.error('Failed to load contest setup data:', err);
      }
    };
    fetchData();
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: generateRandomCode(),
    description: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    durationMinutes: 120,
    maxParticipants: 100,
    difficultyMin: 1,
    difficultyMax: 10,
    questionCount: 5,
    isPublished: true,
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

  const handleSubmit = async (targetStatus: 'DRAFT' | 'SCHEDULED' | 'ACTIVE', redirectToQuestions = false) => {
    if (!formData.name.trim()) {
      toast.error('Contest name is required');
      return;
    }
    if (!formData.code.trim()) {
      toast.error('Contest code is required');
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
        status: targetStatus,
        isPublished: targetStatus !== 'DRAFT',
        difficultyRange: [Number(formData.difficultyMin), Number(formData.difficultyMax)],
        questionIds: selectedQuestionIds,
        questionCount: selectedQuestionIds.length || Number(formData.questionCount),
        assignedFacultyIds: selectedFacultyIds,
        kotlinOnly: true,
        scoringConfig: {
          difficultyWeights: {
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

      const resp = await apiClient.post('/admin/contests', payload);
      if (resp.success && resp.data) {
        toast.success(`Contest "${formData.name}" (Code: ${payload.code}) ${targetStatus === 'DRAFT' ? 'saved as Draft' : 'created & published'}!`);
        if (redirectToQuestions && resp.data.id) {
          navigate(`/admin/contests/${resp.data.id}/questions`);
        } else {
          navigate('/admin/contests');
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create contest');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300 pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/contests"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-400" /> Create & Configure Hackathon
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Set up challenge parameters, Kotlin execution rules, and security limits.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit('DRAFT')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
          >
            Save as Draft
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit('SCHEDULED')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25"
          >
            {submitting ? 'Creating Contest...' : 'Schedule Contest'}
          </button>
        </div>
      </div>

      {/* Form Body */}
      <div className="space-y-6">
        {/* Section 1: Basic Information & Access Code */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Trophy className="w-4 h-4 text-blue-400" /> Basic Contest Information & Access Code
          </h2>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-slate-300">Contest Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. University Grand Hackathon Championship 2026"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
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
                      toast.info(`Generated contest access code: ${newCode}`);
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
                  placeholder="e.g. HACK2026"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-amber-300 font-mono font-bold text-sm tracking-wider uppercase focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Description & Overview</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe rules, objectives, and eligibility for students..."
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
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
                  <Code2 className="w-3.5 h-3.5 text-slate-400" /> Total Questions in Pool
                </label>
                <input
                  type="number"
                  value={formData.questionCount}
                  onChange={(e) => setFormData({ ...formData, questionCount: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 1b: Faculty Assignment (Supervision Permissions) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <AssignFacultyDropdown
            selectedFacultyIds={selectedFacultyIds}
            onChange={(ids) => setSelectedFacultyIds(ids)}
            showSaveButton={false}
            title="Assign Faculty Supervisors"
            description="Assign faculty to monitor live telemetry, review student submissions, and receive proctoring anomaly alerts."
          />
        </div>

        {/* Section 2: Difficulty & Calibration Rules */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Layers className="w-4 h-4 text-emerald-400" /> Difficulty Calibration & Question Range
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
              <span className="text-[11px] text-slate-400">Score deducted per failed compile</span>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Skip Penalty</label>
              <input
                type="number"
                value={formData.skipImpact}
                onChange={(e) => setFormData({ ...formData, skipImpact: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              />
              <span className="text-[11px] text-slate-400">Points deducted per question skip</span>
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

        {/* Section 3: Question Pool Selection */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-blue-400" /> Contest Question Pool Selection
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Pre-assign questions from the repository or customize attached challenges.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-400 bg-blue-500/15 px-3 py-1 rounded-full border border-blue-500/30">
              {selectedQuestionIds.length} Problems Selected
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Choose from available repository questions ({availableQuestions.length} available):</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedQuestionIds(availableQuestions.map((q) => q.id))}
                  className="text-blue-400 hover:text-blue-300 font-semibold"
                >
                  Select All
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setSelectedQuestionIds([])}
                  className="text-slate-400 hover:text-white font-semibold"
                >
                  Deselect All
                </button>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {availableQuestions.map((q) => {
                const isSelected = selectedQuestionIds.includes(q.id);
                return (
                  <label
                    key={q.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer text-xs ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500/50 text-white'
                        : 'bg-slate-800/50 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          if (isSelected) {
                            setSelectedQuestionIds(selectedQuestionIds.filter((id) => id !== q.id));
                          } else {
                            setSelectedQuestionIds([...selectedQuestionIds, q.id]);
                          }
                        }}
                        className="rounded bg-slate-700 border-slate-600 text-blue-600 focus:ring-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            q.difficulty <= 3
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : q.difficulty <= 6
                              ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                              : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          }`}>
                            Level {q.difficulty}
                          </span>
                          <span className="font-bold text-white">{q.title}</span>
                          <span className="text-slate-500 text-[11px]">({q.category})</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {(q.visibleTestCasesCount || 2) + (q.hiddenTestCasesCount || 4)} testcases
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 4: Security & Code Execution Sandbox */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Shield className="w-4 h-4 text-purple-400" /> Security & Kotlin Sandbox Constraints
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">CPU Execution Timeout</span>
              <span className="font-bold text-white text-sm">{formData.cpuLimitSec} seconds / testcase</span>
            </div>
            <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Worker Memory Limit</span>
              <span className="font-bold text-white text-sm">{formData.memoryLimitMb} MB RAM</span>
            </div>
            <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Max Code Size</span>
              <span className="font-bold text-white text-sm">{formData.maxCodeSizeKb} KB</span>
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
              <span className="text-slate-400">(Prevents concurrent logins on multiple machines)</span>
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
                checked={formData.readOnlyFs}
                onChange={(e) => setFormData({ ...formData, readOnlyFs: e.target.checked })}
                className="rounded bg-slate-700 border-slate-600 text-blue-600 focus:ring-0"
              />
              <span className="font-semibold text-white">Read-Only Sandbox Filesystem</span>
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
        <div className="flex flex-wrap items-center justify-end gap-3 pt-4">
          <Link
            to="/admin/contests"
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Cancel
          </Link>
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit('DRAFT')}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 shadow-sm"
          >
            Save Draft
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit('DRAFT', true)}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 text-xs font-bold border border-blue-500/30 shadow-sm"
          >
            <ListPlus className="w-4 h-4" /> Save & Manage Questions
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit('SCHEDULED')}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25"
          >
            {submitting ? 'Creating Contest...' : 'Schedule Contest Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
